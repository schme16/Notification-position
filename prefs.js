/* prefs.js */
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
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
        
        // Position selector
        const positionRow = new Adw.ComboRow({
            title: 'Position',
            subtitle: 'Select notification location'
        });
        
        const positionModel = new Gtk.StringList();
        positionModel.append('Top Left');
        positionModel.append('Top Center');
        positionModel.append('Top Right');
        positionModel.append('Bottom Left');
        positionModel.append('Bottom Center');
        positionModel.append('Bottom Right');
        positionModel.append('Top Stretched');
        positionModel.append('Bottom Stretched');
        positionRow.model = positionModel;
        
        const positions = [
            'top-left',
            'top-center', 
            'top-right',
            'bottom-left',
            'bottom-center',
            'bottom-right',
            'top-stretch',
            'bottom-stretch'
        ];
        
        const currentPosition = settings.get_string('position');
        positionRow.selected = positions.indexOf(currentPosition);
        
        positionRow.connect('notify::selected', (widget) => {
            settings.set_string('position', positions[widget.selected]);
        });
        
        positionGroup.add(positionRow);
        
        // Test notification group
        const testGroup = new Adw.PreferencesGroup({
            title: 'Test',
            description: 'Send a test notification to verify position'
        });
        page.add(testGroup);
        
        const testRow = new Adw.ActionRow({
            title: 'Send Test Notification',
            subtitle: 'Click to see a sample notification with current settings'
        });
        
        const testButton = new Gtk.Button({
            label: 'Send Test',
            valign: Gtk.Align.CENTER,
            css_classes: ['suggested-action']
        });
        
        testButton.connect('clicked', () => {
            try {
                // Get current position for display in notification
                const position = settings.get_string('position');
                
                const positionNames = {
                    'top-left': 'Top Left',
                    'top-center': 'Top Center',
                    'top-right': 'Top Right',
                    'bottom-left': 'Bottom Left',
                    'bottom-center': 'Bottom Center',
                    'bottom-right': 'Bottom Right',
                    'top-stretch': 'Top Stretched',
                    'bottom-stretch': 'Bottom Stretched'
                };
                
                const positionName = positionNames[position] || position;
                
                // Use notify-send command which triggers GNOME Shell notifications
                const proc = Gio.Subprocess.new(
                    ['notify-send', 
                     'Test Notification', 
                     `Position: ${positionName}`,
                     '--urgency=normal',
                     '--app-name=Notification Position Plus'],
                    Gio.SubprocessFlags.NONE
                );
            } catch (e) {
                console.error('Error sending test notification:', e);
            }
        });
        
        testRow.add_suffix(testButton);
        testRow.activatable_widget = testButton;
        testGroup.add(testRow);
    }
}