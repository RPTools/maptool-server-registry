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

export const DEPENDENCY_TYPES = {
  /** Factory class that returns logger. */
  LoggerFactory: Symbol.for('LoggerFactory'),
  /** MapTool Services main server class. */
  MapToolServices: Symbol.for('MapToolServices'),
  /** The database connection pool class. */
  DBConnectionPool: Symbol.for('DBConnectionPool'),
  /** Configuration options. */
  Config: Symbol.for('Config'),
  /** Server Registry expiry. */
  ServerExpiry: Symbol.for('ServerExpiry'),
};

/**
 * Dependency Types for the Server
 * All types here should be bound in the 'inversify-config.ts' file.
 */
export const ROUTE_DEPENDENCY_TYPES = {
  /** Class that manages all the classes that handle routes. */
  RoutesHandler: Symbol.for('RoutesHandler'),
  /** Class for the root route handler. */
  RootRouteHandler: Symbol.for('RootRouteHandler'),
  /** Class for the register server route handler. */
  RegisterServerRouteHandler: Symbol.for('RegisterServerRouteHandler'),
  /** Class for the active servers route handler. */
  ActiveServersRouteHandler: Symbol.for('ActiveServersRouteHandler'),
  /** Class for the heart beat route handler. */
  ServerHeartBeatRouteHandler: Symbol.for('ServerHeartBeatRouteHandler'),
  /** Class for the server disconnection route handler. */
  ServerDisconnectRouteHandler: Symbol.for('ServerDisconnectRouteHandler'),
  /** Server Details Route handler. */
  ServerDetailsRouteHandler: Symbol.for('ServerDetailsRouteHandler'),
};
