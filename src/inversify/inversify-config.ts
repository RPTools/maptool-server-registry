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

import 'reflect-metadata';
import { LoggerFactory } from '../util/LoggerFactory';
import { LoggerFactoryImpl } from '../util/LoggerFactoryImpl';
import { MapToolServices } from '../server/MapToolServices';
import { DEPENDENCY_TYPES, ROUTE_DEPENDENCY_TYPES } from './inversify-types';
import { MapToolServicesImpl } from '../server/MapToolServicesImpl';
import { DBConnectionPoolImpl } from '../database/DBConnectionPoolImpl';
import { DBConnectionPool } from '../database/DBConnectionPool';
import { Container } from 'inversify';
import { RouteHandler } from '../server/routes/RouteHandler';
import { RootRouteHandler } from '../server/routes/RootRouteHandler';
import { RoutesManager } from '../server/routes/RoutesManager';
import { RoutesManagerImpl } from '../server/routes/RoutesManagerImpl';
import { RegisterServerRouteHandler } from '../server/routes/RegisterServerRouteHandler';
import { ActiveServersRouteHandler } from '../server/routes/ActiveServersRouteHandler';
import { ServerHeartBeatRouteHandler } from '../server/routes/ServerHeartBeatRouteHandler';
import { ServerDisconnectRouteHandler } from '../server/routes/ServerDisconnectRouteHandler';
import { Config } from '../config/Config';
import { ConfigImpl } from '../config/ConfigImpl';
import { ServerExpiry } from '../scheduled/ServerExpiry';
import { ServerExpiryImpl } from '../scheduled/ServerExpiryImpl';
import { ServerDetailsRouteHandler } from '../server/routes/ServerDetailsRouteHandler';
import { ServersTodayRouteHandler } from '../server/routes/ServersTodayRouteHandler';
import { ServersYesterdayRouteHandler } from '../server/routes/ServersYesterdayRouteHandler';
import { ServersLastNHoursRouteHandler } from '../server/routes/ServersLastNHoursRouteHandler';
import { ServerVersionsRouteHandler } from '../server/routes/ServerVersionsRouteHandler';

/**
 * The dependency container for inversify.
 */
export const dependencyContainer = new Container({ defaultScope: 'Singleton' });

dependencyContainer.bind<Config>(DEPENDENCY_TYPES.Config).to(ConfigImpl);

dependencyContainer
  .bind<LoggerFactory>(DEPENDENCY_TYPES.LoggerFactory)
  .to(LoggerFactoryImpl);

dependencyContainer
  .bind<MapToolServices>(DEPENDENCY_TYPES.MapToolServices)
  .to(MapToolServicesImpl);

dependencyContainer
  .bind<DBConnectionPool>(DEPENDENCY_TYPES.DBConnectionPool)
  .to(DBConnectionPoolImpl)
  .inSingletonScope();

dependencyContainer
  .bind<ServerExpiry>(DEPENDENCY_TYPES.ServerExpiry)
  .to(ServerExpiryImpl)
  .inSingletonScope();

/**
 * Create the binding for {@link RoutesManager} and any {@link RouteHandler} objects.
 * The `.onActivation()` method for the {@link RoutesManager} binding should be
 * used to create any RouteHandler objects and register them.
 * @example
 * ```typescript
 * dependencyContainer
 *    .bind<RoutesManager>(ROUTE_DEPENDENCY_TYPES.RoutesManager)
 *    .to(RoutesManagerImpl)
 *    .inSingletonScope()
 *    .onActivation((context, routesHandler) => {
 *        const rootRouteHandler = context.container.get<RouteHandler>(
 *             ROUTE_DEPENDENCY_TYPES.rootRouteHandler,
 *        );
 *    routesHandler.registerRoutes(rootRouteHandler);
 *    return routesHandler;
 * });
 * ```
 */
dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.RootRouteHandler)
  .to(RootRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.RegisterServerRouteHandler)
  .to(RegisterServerRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.ActiveServersRouteHandler)
  .to(ActiveServersRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.ServerHeartBeatRouteHandler)
  .to(ServerHeartBeatRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.ServerDisconnectRouteHandler)
  .to(ServerDisconnectRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.ServerDetailsRouteHandler)
  .to(ServerDetailsRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.ServersTodayRouteHandler)
  .to(ServersTodayRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.ServersYesterdayRouteHandler)
  .to(ServersYesterdayRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.ServersLastNHoursRouteHandler)
  .to(ServersLastNHoursRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RouteHandler>(ROUTE_DEPENDENCY_TYPES.ServerVersionsRouteHandler)
  .to(ServerVersionsRouteHandler)
  .inSingletonScope();

dependencyContainer
  .bind<RoutesManager>(ROUTE_DEPENDENCY_TYPES.RoutesHandler)
  .to(RoutesManagerImpl)
  .inSingletonScope()
  .onActivation((context, routesHandler) => {
    const rootRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.RootRouteHandler,
    );
    routesHandler.registerRoutes(rootRouteHandler);

    const registerServerRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.RegisterServerRouteHandler,
    );
    routesHandler.registerRoutes(registerServerRouteHandler);

    const activeServersRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.ActiveServersRouteHandler,
    );
    routesHandler.registerRoutes(activeServersRouteHandler);

    const serverHeartBeatRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.ServerHeartBeatRouteHandler,
    );
    routesHandler.registerRoutes(serverHeartBeatRouteHandler);

    const serverDisconnectRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.ServerDisconnectRouteHandler,
    );
    routesHandler.registerRoutes(serverDisconnectRouteHandler);

    const serverDetailsRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.ServerDetailsRouteHandler,
    );
    routesHandler.registerRoutes(serverDetailsRouteHandler);

    const serversTodayRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.ServersTodayRouteHandler,
    );
    routesHandler.registerRoutes(serversTodayRouteHandler);

    const serversYesterdayRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.ServersYesterdayRouteHandler,
    );
    routesHandler.registerRoutes(serversYesterdayRouteHandler);

    const serversLastNHoursRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.ServersLastNHoursRouteHandler,
    );
    routesHandler.registerRoutes(serversLastNHoursRouteHandler);

    const serverVersionsRouteHandler = context.container.get<RouteHandler>(
      ROUTE_DEPENDENCY_TYPES.ServerVersionsRouteHandler,
    );
    routesHandler.registerRoutes(serverVersionsRouteHandler);

    return routesHandler;
  });
