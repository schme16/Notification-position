/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class NotificationPositionExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        
        // Store original values
        this._originalBannerAlignment = Main.messageTray.bannerAlignment;
        this._originalBannerY = Main.messageTray._bannerBin.y;
        this._originalBannerYAlign = Main.messageTray._bannerBin.y_align;
        
        // Connect to settings changes
        this._settingsChangedId = this._settings.connect('changed', () => {
            this._updatePosition();
        });
        
        // Apply initial position
        this._updatePosition();
    }

    disable() {
        // Disconnect settings
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }
        
        // Restore original values
        Main.messageTray.bannerAlignment = this._originalBannerAlignment;
        Main.messageTray._bannerBin.y = this._originalBannerY;
        Main.messageTray._bannerBin.y_align = this._originalBannerYAlign;
        
        this._settings = null;
    }

    _updatePosition() {
        const horizontalPosition = this._settings.get_string('horizontal-position');
        const verticalPosition = this._settings.get_string('vertical-position');
        const monitorIndex = this._settings.get_int('monitor-index');
        
        // Set horizontal alignment
        switch (horizontalPosition) {
            case 'left':
                Main.messageTray.bannerAlignment = Clutter.ActorAlign.START;
                break;
            case 'center':
                Main.messageTray.bannerAlignment = Clutter.ActorAlign.CENTER;
                break;
            case 'right':
                Main.messageTray.bannerAlignment = Clutter.ActorAlign.END;
                break;
        }
        
        // Set vertical position
        const banner = Main.messageTray._bannerBin;
        const monitor = Main.layoutManager.monitors[monitorIndex] || Main.layoutManager.primaryMonitor;
        
        if (verticalPosition === 'top') {
            banner.y_align = Clutter.ActorAlign.START;
            banner.y = monitor.y + 10; // 10px from top
        } else {
            banner.y_align = Clutter.ActorAlign.END;
            banner.y = monitor.y + monitor.height - 10; // 10px from bottom
        }
    }
}