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

interface Disconnect {
  id: string;
  clientId: string;
}

@injectable()
export class ServerDisconnectRouteHandler implements RouteHandler {
  private readonly logger;
  constructor(
    @inject(DEPENDENCY_TYPES.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(DEPENDENCY_TYPES.DBConnectionPool)
    private readonly dbConnectionPool: DBConnectionPool,
  ) {
    this.logger = loggerFactory.getLogger();
  }

  addRoutes(expressApp: Express): void {
    this.logger.info('Registering /server-disconnect');
    expressApp.patch('/server-disconnect', (req, res) => {
      const disconnect = req.body as Disconnect;

      // First check all the mandatory fields
      if (!disconnect.id || !disconnect.clientId) {
        this.logger.error('Invalid Disconnect Message');
        this.logger.error(JSON.stringify(req.body));
        res.sendStatus(400);
        return;
      }

      this.registerDisconnect(disconnect)
        .then(() => {
          res.sendStatus(200);
          return;
        })
        .catch((err) => {
          this.logger.error(err);
          this.logger.error(JSON.stringify(disconnect));
        });
    });
  }

  async registerDisconnect(disconnect: Disconnect): Promise<void> {
    const pool = await this.dbConnectionPool.getPool();

    try {
      await pool.query(
        'insert into event_log (instance_id, event_type) values (?, ?)',
        [disconnect.id, 'DisconnectServer'],
      );

      await pool.query(
        'update maptool_instance set active = false, last_heartbeat = now() where client_id = ?',
        [disconnect.clientId],
      );

      await pool.query(
        'update maptool_instance set active = false, last_heartbeat = now() where id = ?',
        [disconnect.id],
      );
    } catch (err) {
      this.logger.error('Error trying to process disconnect message');
      this.logger.error(err);
    }
  }
}
