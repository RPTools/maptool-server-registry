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

import { Express } from 'express';
import { RouteHandler } from './RouteHandler';

/**
 * Interface implemented by classes that manage the classes that handle routes.
 */
export interface RoutesManager {
  /**
   * Adds the routes to the express application
   *
   * @param expressApp the express application that the routes will be added to.
   */
  addRoutes(expressApp: Express): void;

  /**
   * Registers {@link RouteHandler} objects with this handler.
   * @param routes the {@link RouteHandler} object to register.
   */
  registerRoutes(routes: RouteHandler): void;
}
