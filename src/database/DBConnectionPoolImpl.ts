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

import { DBConnectionPool } from './DBConnectionPool';
import { createPool, Pool } from 'mysql2/promise';
import { injectable } from 'inversify';

@injectable()
/**
 * Class implementing the <code>DBConnectionPool</code> interface for the service.
 */
export class DBConnectionPoolImpl implements DBConnectionPool {
  /**
   * The mysql connection pool.
   * @private
   */
  private readonly connectionPool: Pool;

  /**
   * Creates a new connection pool to a mysql database using the following environment variables for details.
   * MYSQL_HOST = The hostname of the server running the mysql server.
   * MYSQL_USER = The user name used to log into the mysql server.
   * MYSQL_PASSWORD = The password used to log into the mysql server.
   * MYSQL_DATABASE = The mysql database name to use
   */
  constructor() {
    const dbHost = process.env.MYSQL_HOST;
    const dbUser = process.env.MYSQL_USER;
    const dbPass = process.env.MYSQL_PASSWORD;
    const dbDatabase = process.env.MYSQL_DATABASE;

    this.connectionPool = createPool({
      host: dbHost,
      user: dbUser,
      password: dbPass,
      database: dbDatabase,
    });

    console.log(`Connected to ${dbDatabase}@${dbHost}`);
  }

  /**
   * Retrieves the connection pool.
   */
  async getPool(): Promise<Pool> {
    return this.connectionPool;
  }
}
