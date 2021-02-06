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
import { MapToolServices } from '../MapToolServices';
import { MapToolServicesImpl } from '../MapToolServicesImpl';
import { Config } from '../../config/Config';

interface ServerDetails {
  clientId: string;
  name: string;
  ipv4?: string;
  ipv6?: string;
  port: number;
  version: string;
  country: string;
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
    expressApp.put('/register-server', (req, res) => {
      const serverDetails = req.body as ServerDetails;
      let valid = true;

      // First check all the mandatory fields
      if (
        !serverDetails.clientId ||
        !serverDetails.name ||
        !serverDetails.port ||
        !serverDetails.version ||
        !serverDetails.country
      ) {
        valid = false;
      }

      // One or both of ipv4 and ipv6 must be set
      if (!serverDetails.ipv4 && !serverDetails.ipv6) {
        valid = false;
      }

      if (!valid) {
        this.logger.error('Invalid Register Server Request');
        this.logger.error(JSON.stringify(req.body));
        res.sendStatus(400);
        return;
      }

      const id = v4();
      const heartBeatMS = this.config.getHeartBeatMS();
      this.registerServer(serverDetails, id)
        .then(() => {
          res.send({ serverId: id, heartBeatMS: heartBeatMS });
          return;
        })
        .catch((err) => {
          this.logger.error(err);
          this.logger.error(JSON.stringify(serverDetails));
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

    await pool.query(
      `insert into maptool_instance (
        id, client_id, name, ipv4, ipv6, port, public, version, last_heartbeat, active, first_seen, country_code
    ) values (
        ?, ?, ?, ?, ?, ?, true, ?, now(), true, now(), ?
    )`,
      [
        id,
        serverDetails.clientId,
        serverDetails.name,
        serverDetails.ipv4,
        serverDetails.ipv6,
        serverDetails.port,
        serverDetails.version,
        serverDetails.country,
      ],
    );

    await pool.query(
      'insert into event_log (instance_id, event_type) values (?, ?)',
      [id, 'RegisterServer'],
    );
  }
}
