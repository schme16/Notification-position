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
        this._originalBannerBin = {
            x: Main.messageTray._bannerBin.x,
            y: Main.messageTray._bannerBin.y,
            x_align: Main.messageTray._bannerBin.x_align,
            y_align: Main.messageTray._bannerBin.y_align,
            width: Main.messageTray._bannerBin.width
        };
        
        // Connect to settings changes
        this._settingsChangedId = this._settings.connect('changed', () => {
            this._updatePosition();
        });
        
        // Connect to monitor changes
        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => {
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
        
        // Disconnect monitor changes
        if (this._monitorsChangedId) {
            Main.layoutManager.disconnect(this._monitorsChangedId);
            this._monitorsChangedId = null;
        }
        
        // Restore original values
        const banner = Main.messageTray._bannerBin;
        Main.messageTray.bannerAlignment = this._originalBannerAlignment;
        banner.x = this._originalBannerBin.x;
        banner.y = this._originalBannerBin.y;
        banner.x_align = this._originalBannerBin.x_align;
        banner.y_align = this._originalBannerBin.y_align;
        banner.set_width(this._originalBannerBin.width);
        
        this._settings = null;
    }

    _updatePosition() {
        const position = this._settings.get_string('position');
        const monitorIndex = this._settings.get_int('monitor-index');
        
        // Get the selected monitor
        const monitors = Main.layoutManager.monitors;
        const monitor = monitors[monitorIndex] || Main.layoutManager.primaryMonitor;
        
        const banner = Main.messageTray._bannerBin;
        const margin = 10;
        
        // Parse position into horizontal and vertical components
        let horizontalAlign, verticalPos, isStretched;
        
        if (position.includes('stretch')) {
            isStretched = true;
            horizontalAlign = 'center';
            verticalPos = position.includes('top') ? 'top' : 'bottom';
        } else {
            isStretched = false;
            if (position.includes('left')) horizontalAlign = 'left';
            else if (position.includes('right')) horizontalAlign = 'right';
            else horizontalAlign = 'center';
            verticalPos = position.includes('top') ? 'top' : 'bottom';
        }
        
        // Set horizontal alignment
        switch (horizontalAlign) {
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
        if (verticalPos === 'top') {
            banner.y_align = Clutter.ActorAlign.START;
            banner.y = monitor.y + margin;
        } else {
            banner.y_align = Clutter.ActorAlign.END;
            banner.y = monitor.y + monitor.height - margin;
        }
        
        // Handle stretched width
        if (isStretched) {
            banner.set_width(monitor.width - (margin * 2));
            banner.x = monitor.x + margin;
        } else {
            banner.set_width(-1); // Natural width
            // For non-primary monitors, adjust x position
            if (monitorIndex > 0) {
                if (horizontalAlign === 'left') {
                    banner.x = monitor.x + margin;
                } else if (horizontalAlign === 'right') {
                    banner.x = monitor.x + monitor.width - margin;
                } else {
                    banner.x = monitor.x + (monitor.width / 2);
                }
            }
        }
    }
}