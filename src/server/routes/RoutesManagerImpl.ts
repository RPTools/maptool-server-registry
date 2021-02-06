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
import { RoutesManager } from './RoutesManager';
import { Logger } from '../../util/Logger';
import { DEPENDENCY_TYPES } from '../../inversify/inversify-types';
import { LoggerFactory } from '../../util/LoggerFactory';

@injectable()
export class RoutesManagerImpl implements RoutesManager {
  private logger: Logger;
  private routes: RouteHandler[];

  constructor(
    @inject(DEPENDENCY_TYPES.LoggerFactory)
    private loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.getLogger();
    this.routes = [];
  }

  addRoutes = (expressApp: Express): void => {
    this.routes.forEach((r) => {
      r.addRoutes(expressApp);
    });
  };

  registerRoutes = (routes: RouteHandler): void => {
    this.routes.push(routes);
  };
}
