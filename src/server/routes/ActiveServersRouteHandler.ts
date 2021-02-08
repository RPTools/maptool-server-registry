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
import { FieldPacket, RowDataPacket } from 'mysql2';
import { serialize } from 'v8';

interface ServerDetails extends RowDataPacket {
  name: string;
  version: string;
}

@injectable()
export class ActiveServersRouteHandler implements RouteHandler {
  private readonly logger;
  constructor(
    @inject(DEPENDENCY_TYPES.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(DEPENDENCY_TYPES.DBConnectionPool)
    private readonly dbConnectionPool: DBConnectionPool,
  ) {
    this.logger = loggerFactory.getLogger();
  }

  addRoutes(expressApp: Express): void {
    this.logger.info('Registering /active-servers');

    expressApp.get('/active-servers', (req, res) => {
      this.getServerDetails()
        .then((details: ServerDetails[]) => {
          res.send(details);
        })
        .catch((err) => {
          this.logger.error('Error retrieving active servers');
          this.logger.error(err);
          res.sendStatus(500);
        });
    });
  }

  async getServerDetails(): Promise<ServerDetails[]> {
    const pool = await this.dbConnectionPool.getPool();
    const [serverDetails]: [ServerDetails[], FieldPacket[]] = await pool.query<
      ServerDetails[]
    >('select name, version from maptool_instance where active = true');

    return serverDetails;
  }
}
