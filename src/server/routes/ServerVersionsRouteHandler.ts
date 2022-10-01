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
import { FieldPacket, RowDataPacket } from 'mysql2';
import { default as fs } from 'fs';
import path from 'path';
import { Config } from '../../config/Config';

interface ServerVersionDetails extends RowDataPacket {
  version: string;
  servers: number;
  players: number;
}

interface ServerVersionList {
  hours: number;
  versionInfo: {
    version: string;
    servers: number;
    players: number;
  }[];
}

@injectable()
export class ServerVersionsRouteHandler implements RouteHandler {
  private readonly logger;
  private readonly sqlQuery: string;
  constructor(
    @inject(DEPENDENCY_TYPES.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(DEPENDENCY_TYPES.DBConnectionPool)
    private readonly dbConnectionPool: DBConnectionPool,
    @inject(DEPENDENCY_TYPES.Config)
    private readonly config: Config,
  ) {
    this.logger = loggerFactory.getLogger();
    this.sqlQuery = fs
      .readFileSync(path.join(__dirname, '../../resources/sql/versions.sql'))
      .toString();
  }

  addRoutes(expressApp: Express): void {
    this.logger.info('Registering /server-versions');

    expressApp.get('/server-versions', (req, res) => {
      const numHoursString = req.query.hours;

      const hoursArray: number[] = [];

      if (!numHoursString || typeof numHoursString != 'string') {
        this.config.getDefaultHours().forEach((n) => hoursArray.push(n));
      } else {
        numHoursString
          .split(',')
          .map(Number)
          .forEach((n) => hoursArray.push(n));
      }

      this.getServerVersions(hoursArray)
        .then((details: ServerVersionList[]) => {
          res.send(details);
        })
        .catch((err) => {
          this.logger.error('Error retrieving servers');
          this.logger.error(err);
          res.sendStatus(500);
        });
    });
  }

  async getServerVersions(hours: number[]): Promise<ServerVersionList[]> {
    const versions: ServerVersionList[] = [];
    for (const h of hours) {
      const vals = await this.getServerVersionsByHour(h);
      if (vals.length > 0) {
        const vers: ServerVersionList = { hours: h, versionInfo: [] };
        vals.forEach((v) =>
          vers.versionInfo.push({
            version: v.version,
            servers: v.servers,
            players: Number(v.players),
          }),
        );
        versions.push(vers);
      }
    }

    return versions;
  }

  async getServerVersionsByHour(
    hours: number,
  ): Promise<ServerVersionDetails[]> {
    const pool = await this.dbConnectionPool.getPool();
    const [serverVersionDetails]: [
      ServerVersionDetails[],
      FieldPacket[],
    ] = await pool.query<ServerVersionDetails[]>(this.sqlQuery, [hours, hours]);

    return serverVersionDetails;
  }
}
