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
  weekday: number;
  version: string;
  servers: number;
  players: number;
}

interface ServerDaysList {
  hours: number;
  days: {
    versionInfo: {
      version: string;
      servers: number;
      players: number;
    }[];
  }[];
}

interface ReturnValue {
  timezone: string;
  data: ServerDaysList[];
}

@injectable()
export class ServersByDayRouteHandler implements RouteHandler {
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
      .readFileSync(path.join(__dirname, '../../resources/sql/server-days.sql'))
      .toString();
  }

  addRoutes(expressApp: Express): void {
    this.logger.info('Registering /server-days');

    expressApp.get('/server-days', (req, res) => {
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
      const timezone = req.query.timezone
        ? req.query.timezone.toString()
        : 'UTC';

      this.getServerVersions(hoursArray, timezone)
        .then((details: ReturnValue) => {
          res.send(details);
        })
        .catch((err) => {
          this.logger.error('Error retrieving servers');
          this.logger.error(err);
          res.sendStatus(500);
        });
    });
  }

  async getServerVersions(
    hours: number[],
    timezone: string,
  ): Promise<ReturnValue> {
    const returnValue: ReturnValue = { timezone: timezone, data: [] };
    for (const h of hours) {
      const vals = await this.getServerVersionsByHour(h, timezone);
      if (vals.length > 0) {
        const vers: ServerDaysList = { hours: h, days: [] };
        console.log('here 1');
        for (let i = 0; i < 7; i++) {
          vers.days[i] = { versionInfo: [] };
        }
        console.log('here 2');
        vals.forEach((v) => {
          console.log(v.weekday);
          console.log(v.version);
          console.log(v.servers);
          console.log(v.players);
          vers.days[v.weekday].versionInfo.push({
            version: v.version,
            servers: v.servers,
            players: Number(v.players),
          });
        });
        console.log('here 3');
        returnValue.data.push(vers);
      }
    }

    return returnValue;
  }

  async getServerVersionsByHour(
    hours: number,
    timezone: string,
  ): Promise<ServerVersionDetails[]> {
    const pool = await this.dbConnectionPool.getPool();
    const [serverVersionDetails]: [
      ServerVersionDetails[],
      FieldPacket[],
    ] = await pool.query<ServerVersionDetails[]>(this.sqlQuery, [
      hours,
      timezone,
      hours,
      timezone,
    ]);

    return serverVersionDetails;
  }
}
