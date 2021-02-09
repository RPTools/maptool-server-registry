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

interface HeartBeat {
  id: string;
  clientId: string;
  address: string;
  number_players: number;
  number_maps: number;
}

@injectable()
export class ServerHeartBeatRouteHandler implements RouteHandler {
  private readonly logger;
  constructor(
    @inject(DEPENDENCY_TYPES.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(DEPENDENCY_TYPES.DBConnectionPool)
    private readonly dbConnectionPool: DBConnectionPool,
  ) {
    this.logger = loggerFactory.getLogger();
  }

  addRoutes(expressApp: Express): void {
    this.logger.info('Registering /server-heartbeat');
    expressApp.patch('/server-heartbeat', (req, res) => {
      const heartbeat = req.body as HeartBeat;

      let valid = true;

      // First check all the mandatory fields
      if (!heartbeat.id || !heartbeat.clientId) {
        valid = false;
      }

      if (!heartbeat.address) {
        valid = false;
      }

      if (!valid) {
        this.logger.error('Invalid Server Heart Beat');
        this.logger.error(JSON.stringify(req.body));
        res.sendStatus(400);
        return;
      }

      this.registerHeartBeat(heartbeat)
        .then(() => {
          res.sendStatus(200);
          return;
        })
        .catch((err) => {
          this.logger.error(err);
          this.logger.error(JSON.stringify(heartbeat));
        });
    });
  }

  async registerHeartBeat(heartBeat: HeartBeat): Promise<void> {
    const pool = await this.dbConnectionPool.getPool();

    await pool.query(
      'update maptool_instance set active = false, address = null where active = true and client_id = ? and id != ?',
      [heartBeat.clientId, heartBeat.id],
    );

    await pool.query(
      'update maptool_instance set active = true, address = ?, last_heartbeat = now() where id = ?',
      [heartBeat.id, heartBeat.address],
    );

    await pool.query(
      'insert into heartbeat_log(instance_id, number_players, number_maps) values (?, ?, ?)',
      [heartBeat.id, heartBeat.number_players, heartBeat.number_maps],
    );
  }
}
