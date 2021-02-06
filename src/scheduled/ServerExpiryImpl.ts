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

@injectable()
export class ServerExpiryImpl implements ServerExpiry {
  private readonly logger;
  constructor(
    @inject(DEPENDENCY_TYPES.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(DEPENDENCY_TYPES.DBConnectionPool)
    private readonly dbConnectionPool: DBConnectionPool,
  ) {
    this.logger = loggerFactory.getLogger();
  }

  run = async (): Promise<void> => {
    this.logger.info('ServerExpiry started.');
    const pool = await this.dbConnectionPool.getPool();
    pool.query('update ma');
    this.logger.info('ServerExpiry ended.');
  };
}
