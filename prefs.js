/* prefs.js */
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class NotificationPositionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        
        // Create a preferences page
        const page = new Adw.PreferencesPage();
        window.add(page);
        
        // Position group
        const positionGroup = new Adw.PreferencesGroup({
            title: 'Notification Position',
            description: 'Choose where notifications appear on screen'
        });
        page.add(positionGroup);
        
        // Horizontal position
        const horizontalRow = new Adw.ComboRow({
            title: 'Horizontal Position',
            subtitle: 'Left, center, or right alignment'
        });
        
        const horizontalModel = new Gtk.StringList();
        horizontalModel.append('Left');
        horizontalModel.append('Center');
        horizontalModel.append('Right');
        horizontalRow.model = horizontalModel;
        
        const hPositions = ['left', 'center', 'right'];
        const currentH = settings.get_string('horizontal-position');
        horizontalRow.selected = hPositions.indexOf(currentH);
        
        horizontalRow.connect('notify::selected', (widget) => {
            settings.set_string('horizontal-position', hPositions[widget.selected]);
        });
        
        positionGroup.add(horizontalRow);
        
        // Vertical position
        const verticalRow = new Adw.ComboRow({
            title: 'Vertical Position',
            subtitle: 'Top or bottom of screen'
        });
        
        const verticalModel = new Gtk.StringList();
        verticalModel.append('Top');
        verticalModel.append('Bottom');
        verticalRow.model = verticalModel;
        
        const vPositions = ['top', 'bottom'];
        const currentV = settings.get_string('vertical-position');
        verticalRow.selected = vPositions.indexOf(currentV);
        
        verticalRow.connect('notify::selected', (widget) => {
            settings.set_string('vertical-position', vPositions[widget.selected]);
        });
        
        positionGroup.add(verticalRow);
        
        // Monitor selection
        const monitorGroup = new Adw.PreferencesGroup({
            title: 'Monitor',
            description: 'Select which monitor displays notifications'
        });
        page.add(monitorGroup);
        
        const monitorRow = new Adw.ComboRow({
            title: 'Display Monitor',
            subtitle: '0 = Primary monitor, 1+ = Secondary monitors'
        });
        
        const monitorModel = new Gtk.StringList();
        monitorModel.append('Primary Monitor (0)');
        for (let i = 1; i <= 5; i++) {
            monitorModel.append(`Monitor ${i}`);
        }
        monitorRow.model = monitorModel;
        
        const currentMonitor = settings.get_int('monitor-index');
        monitorRow.selected = currentMonitor;
        
        monitorRow.connect('notify::selected', (widget) => {
            settings.set_int('monitor-index', widget.selected);
        });
        
        monitorGroup.add(monitorRow);
    }
}