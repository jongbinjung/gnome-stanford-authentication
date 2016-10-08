
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Util = imports.misc.util;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const EXTENSIONDIR = Me.dir.get_path();

let text, button;

var control = {
    _spawn_async: function(cmd, e) {
        try {
            GLib.spawn_command_line_async(cmd, e);
        } catch (e) {
            throw e;
        }
    },

    _spawn_sync: function (cmd, e) {
        try {
            GLib.spawn_command_line_sync(cmd, null, null, null, e);
        } catch (e) {
            throw e;
        }
    },

    init: function() {
        this._spawn_async("gnome-terminal --command kinit", null);
    }
};

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showHello() {
    control.init();

    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
                      monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideHello });
}


function init() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: false,
                          y_fill: true,
                          track_hover: true });
    let gicon = Gio.icon_new_for_string(Me.path + '/icons/stanford_auth_on.svg');
    let icon = new St.Icon({
        gicon: gicon,
        style_class: 'system-status-icon'
    });

    button.set_child(icon);
    button.connect('button-press-event', _showHello);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
