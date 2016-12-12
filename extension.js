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

let button, icon, icon_path, text;

// Kerberos related variables
let klist  // list of things returned from klist

var control = {
    _spawn_async: function(cmd, e) {
        try {
            GLib.spawn_command_line_async(cmd, e);
        } catch (e) {
            throw e;
        }
    },

    init: function() {
        this._spawn_async("gnome-terminal --command kinit", null);
    },

    copy2FA: function() {
        // TODO(jongbin): Better way to find 2fa
        this._spawn_async("/home/jongbin/repos/scripts/2fa stan", null);
    }
};

function _isAuthenticated() {
    klist = GLib.spawn_command_line_sync("klist");

    // check if Kerberos authentication is present
    if (klist[0] == true && klist[1] == "") {
        return false;
    }

    if (klist[0] == true && klist[2] == "") {
        dates = String.fromCharCode.apply(null,
            klist[1]).match(/(\d+\/\d+\/\d+ \d+:\d+:\d+)/g);
        if (Date.parse(dates[1]) < Date.now()) {
            return false;
        } else {
            return true;
        }
    }

    return false;
}

function _hideMessage() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _toggleStatus() {
    if (_isAuthenticated() == false) {
        control.init();
    }

    control.copy2FA();

    let dates = String.fromCharCode.apply(null,
        klist[1]).match(/(\d+\/\d+\/\d+ \d+:\d+:\d+)/g);

    label = 'Ticket expires: ' + dates[1];

    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: label });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
                      monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text, {
        opacity: 0,
        time: 4,
        transition: 'easeOutQuad',
        onComplete: _hideMessage
    });

    _updateStatus();
}

function _updateStatus() {
    if (_isAuthenticated()) {
        icon_path = Me.path + '/icons/stanford_auth_on.svg';
    } else {
        icon_path = Me.path + '/icons/stanford_auth_off.svg';
    }

    icon.gicon = Gio.icon_new_for_string(icon_path);
}

function init() {
    button = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: false,
        y_fill: true,
        track_hover: true
    });

    icon = new St.Icon({
        style_class: 'system-status-icon'
    });

    _updateStatus();

    button.set_child(icon);
    button.connect('button-press-event', _toggleStatus);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
