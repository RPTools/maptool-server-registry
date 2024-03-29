/*
 * This software Copyright by the RPTools.net development team, and
 * licensed under the Affero GPL Version 3 or, at your option, any later
 * version.
 *
 * MapTool Source Code is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * You should have received a copy of the GNU Affero General Public
 * License * along with this source Code.  If not, please visit
 * <http://www.gnu.org/licenses/> and specifically the Affero license
 * text at <http://www.gnu.org/licenses/agpl.html>.
 */

import { RouteHandler } from './RouteHandler';
import { Express } from 'express';
import { inject, injectable } from 'inversify';
import { DEPENDENCY_TYPES } from '../../inversify/inversify-types';
import { LoggerFactory } from '../../util/LoggerFactory';
import { DBConnectionPool } from '../../database/DBConnectionPool';
import { v4 } from 'uuid';
import { Config } from '../../config/Config';
import { FieldPacket, RowDataPacket } from 'mysql2';

interface ServerDetails {
  clientId: string;
  name: string;
  address: string;
  port: number;
  version: string;
  country: string;
  language: string;
  timezone: string;
  webrtc?: boolean;
  info?: { name: string; value: string }[];
}

interface ExistingInstance {
  status: 'matched' | 'not-matched' | 'none';
  id?: string;
}

@injectable()
export class RegisterServerRouteHandler implements RouteHandler {
  private readonly logger;
  constructor(
    @inject(DEPENDENCY_TYPES.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(DEPENDENCY_TYPES.DBConnectionPool)
    private readonly dbConnectionPool: DBConnectionPool,
    @inject(DEPENDENCY_TYPES.Config)
    private readonly config: Config,
  ) {
    this.logger = loggerFactory.getLogger();
  }

  addRoutes(expressApp: Express): void {
    this.logger.info('Registering /register-server');
    expressApp.put('/register-server', async (req, res) => {
      const serverDetails = req.body as ServerDetails;

      // First check all the mandatory fields
      if (
        !serverDetails.clientId ||
        !serverDetails.name ||
        !serverDetails.port ||
        !serverDetails.version ||
        !serverDetails.country ||
        !serverDetails.address
      ) {
        this.logger.error('Invalid Register Server Request');
        this.logger.error(JSON.stringify(req.body));
        res.sendStatus(400);
        return;
      }

      const heartBeatMinutes = this.config.getHeartBeatMinutes();
      const details = await this.checkExistingInstance(serverDetails);
      if (details.status == 'not-matched') {
        res.send({ status: 'name-exists' });
        return;
      } else if (details.status == 'matched') {
        res.send({
          status: 'ok',
          id: details.id,
          heartBeatMinutes: heartBeatMinutes,
        });
        return;
      }

      const id = v4();
      await this.registerServer(serverDetails, id);
      res.send({
        status: 'ok',
        serverId: id,
        heartBeatMinutes: heartBeatMinutes,
      });
    });
  }

  async registerServer(
    serverDetails: ServerDetails,
    id: string,
  ): Promise<void> {
    const pool = await this.dbConnectionPool.getPool();

    // make any servers with the same client id inactive.
    await pool.query(
      'update maptool_instance set active = false where client_id = ?',
      [serverDetails.clientId],
    );

    let version: string = serverDetails.version;
    if (version === '1' || version === '0.0.1') {
      version = 'Development';
    }

    await pool.query(
      `insert into maptool_instance (
        id, client_id, name, address, port, public, version, last_heartbeat, active, first_seen, country_code, language, timezone, webrtc
    ) values (
        ?, ?, ?, ?, ?, true, ?, now(), true, now(), ?, ?, ?, ?
    )`,
      [
        id,
        serverDetails.clientId,
        serverDetails.name,
        serverDetails.address,
        serverDetails.port,
        serverDetails.version,
        serverDetails.country,
        serverDetails.language,
        serverDetails.timezone,
        serverDetails.webrtc ? serverDetails.webrtc : false,
      ],
    );

    // Delete any pre-exsting info for this server
    await pool.query(
      'delete from maptool_instance_info where instance_id = ?',
      [id],
    );

    if (serverDetails.info) {
      for (const info of serverDetails.info) {
        await pool.query(
          'insert into maptool_instance_info (instance_id, name, value) values (?, ?, ?)',
          [id, info.name.substring(0, 255), info.value.substring(0, 255)],
        );
      }
    }

    await pool.query(
      'insert into event_log (instance_id, event_type) values (?, ?)',
      [id, 'RegisterServer'],
    );
  }

  async checkExistingInstance(
    serverDetails: ServerDetails,
  ): Promise<ExistingInstance> {
    const pool = await this.dbConnectionPool.getPool();

    interface ExistingDetails extends RowDataPacket {
      id: string;
      client_id: string;
    }

    const [detail]: [ExistingDetails[], FieldPacket[]] = await pool.query<
      ExistingDetails[]
    >(
      'select id, client_id from maptool_instance where active = true and name = ?',
      [serverDetails.name],
    );

    if (detail.length == 0) {
      return { status: 'none' };
    } else if (detail[0].client_id == serverDetails.clientId) {
      // Update with ip etc
      await pool.query(
        'update maptool_instance set address = ?, active = true, last_heartbeat = now(), port = ?, version = ? where id = ?',
        [
          serverDetails.address,
          serverDetails.port,
          serverDetails.version,
          detail[0].id,
        ],
      );
      await pool.query(
        'insert into event_log (instance_id, event_type) values (?, ?)',
        [detail[0].id, 'UpdateServer'],
      );
      return { status: 'matched', id: detail[0].id };
    } else {
      return { status: 'not-matched' };
    }
  }
}
