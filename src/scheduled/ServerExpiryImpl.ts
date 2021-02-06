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

import { ServerExpiry } from './ServerExpiry';
import { inject, injectable } from 'inversify';
import { DEPENDENCY_TYPES } from '../inversify/inversify-types';
import { LoggerFactory } from '../util/LoggerFactory';
import { DBConnectionPool } from '../database/DBConnectionPool';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { Config } from '../config/Config';

interface ExpiredServers extends RowDataPacket {
  id: string;
}

@injectable()
export class ServerExpiryImpl implements ServerExpiry {
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

  run = async (): Promise<void> => {
    const timeoutMinutes = this.config.getTimeoutMinutes();
    const pool = await this.dbConnectionPool.getPool();
    const [expired]: [ExpiredServers[], FieldPacket[]] = await pool.query<
      ExpiredServers[]
    >(
      'select id from maptool_instance where active = true and timestampadd(MINUTE, ?, last_heartbeat) < now()',
      [timeoutMinutes],
    );
    for (const server of expired) {
      await pool.query(
        'update maptool_instance set active = false, ipv4 = null, ipv6 = null where id = ?',
        [server.id],
      );
      await pool.query(
        'insert into event_log (instance_id, event_type) values (?, ?)',
        [server.id, 'ServerTimeOut'],
      );
    }
  };
}
