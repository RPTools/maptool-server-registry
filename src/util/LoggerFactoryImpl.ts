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

import { default as winston } from 'winston';
import { default as Transport } from 'winston-transport';
import { injectable } from 'inversify';

import { Logger } from './Logger';
import { LoggerFactory } from './LoggerFactory';


/**
 * Class that implements the {@link LoggerFactory} interface to retrieve loggers.
 */
@injectable()
export class LoggerFactoryImpl implements LoggerFactory {
  /**
   * Logger object used for the main process.
   * @private
   */
  private static readonly mainLogger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.align(),
          winston.format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`,
          ),
        ),
      }),
    ],
  });

  getLogger = (): Logger => {
    return LoggerFactoryImpl.mainLogger;
  };
}
