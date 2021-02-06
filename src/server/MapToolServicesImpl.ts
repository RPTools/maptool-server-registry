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

import { default as express, Express } from 'express';
import { default as cors } from 'cors';
import { default as bodyParser } from 'body-parser';
import { Logger } from '../util/Logger';
import { LoggerFactory } from '../util/LoggerFactory';
import { inject, injectable } from 'inversify';
import * as http from 'http';
import { CronJob } from 'cron';
import { MapToolServices } from './MapToolServices';
import {
  DEPENDENCY_TYPES,
  ROUTE_DEPENDENCY_TYPES,
} from '../inversify/inversify-types';
import { DBConnectionPool } from '../database/DBConnectionPool';
import { RoutesManager } from './routes/RoutesManager';
import { ServerExpiry } from '../scheduled/ServerExpiry';

@injectable()
export class MapToolServicesImpl implements MapToolServices {
  /**
   * The Express application object.
   * @private
   */
  private expressApp: Express;

  /**
   * The port number to start the server on
   * @private
   */
  private portNumber: number;

  /**
   * Logging object
   * @private
   */
  private logger: Logger;

  /**
   * The http server listening for connections
   * @private
   */
  private server?: http.Server;

  /**
   * Constructor to create a new 'MapToolServices' object.
   * @param loggerFactory the factory used to create loggers.
   * @param routeHandler the route handler for the server.
   * @param serverExpiry the class to run for server expiration
   */
  constructor(
    @inject(DEPENDENCY_TYPES.LoggerFactory)
    loggerFactory: LoggerFactory,
    @inject(ROUTE_DEPENDENCY_TYPES.RoutesHandler)
    private readonly routeHandler: RoutesManager,
    @inject(DEPENDENCY_TYPES.ServerExpiry)
    private readonly serverExpiry: ServerExpiry,
  ) {
    this.logger = loggerFactory.getLogger();
    this.expressApp = express();
    this.portNumber = 3000;
    this.expressApp.set('maptool-services', this);
  }

  /**
   * Performs any clean up on exit.
   * @private
   */
  private exit = async () => {
    this.logger.info('Exiting');
    if (this.server) {
      await this.server.close();
      this.server = undefined;
    }
  };

  /**
   * Starts the 'MapToolServices' listener.
   */
  start = (): void => {
    process.on('exit', this.exit);
    process.on('SIGINT', this.exit);
    process.on('SIGBREAK', this.exit);

    this.setUpTimers();
    this.addMiddleware();
    this.addRoutes();
    this.server = this.expressApp.listen(this.portNumber, () => {
      this.logger.info(
        `[server]: Server is running at http://localhost:${this.portNumber}`,
      );
    });
  };

  /**
   * Adds middleware components to the express server.
   * @private
   */
  private addMiddleware = () => {
    this.expressApp.use(cors());
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({ extended: true }));
  };

  /**
   * Adds the routes to the express server.
   * @private
   */
  private addRoutes = () => {
    this.routeHandler.addRoutes(this.expressApp);
  };

  private setUpTimers = () => {
    const serverExpiryJob = new CronJob('0 */15 * * * *', () =>
      this.serverExpiry.run(),
    );
    serverExpiryJob.start();
  };
}
