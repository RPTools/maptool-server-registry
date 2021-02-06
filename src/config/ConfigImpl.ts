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

import { Config } from './Config';
import { injectable } from 'inversify';

@injectable()
export class ConfigImpl implements Config {
  /**
   * Number of minutes between heart beats.
   * @private
   */
  private readonly heartBeatMinutes = 15;
  /**
   * Returns the number of Minutes between heart beats.
   */
  getHeartBeatMinutes(): number {
    return this.heartBeatMinutes;
  }
  /**
   * Returns the number of minutes for time out waiting for a heart beat.
   */
  getTimeoutMinutes(): number {
    return this.heartBeatMinutes * 2;
  }
}
