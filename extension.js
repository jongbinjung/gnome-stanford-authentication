const St = imports.gi.St;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

// Kerberos related variables
let klist  // list of things returned from klist

const IconOn = 'stanford_auth_on';
const IconOff = 'stanford_auth_off';

const KerberosIndicator = new Lang.Class({
    Name: 'KerberosIndicator',
    Extends: PanelMenu.Button,

    _init: function () {
        this.klist = "";
		this.parent(null, 'ska');
        this.gicon = Gio.icon_new_for_string(IconOff);
        this.icon = new St.Icon({
            gicon: this.gicon,
            style_class: 'system-status-icon'
        });
        this.actor.add_actor(this.icon);
        this.actor.connect('button-press-event', Lang.bind(this, this._toggleStatus));
        this._isAuthenticated();
    },

    _toggleStatus: function () {
        if (this._isAuthenticated()) {
            this._copy2FA();
        } else {
            this._kinit();
        }

        this._isAuthenticated();
    },

    _isAuthenticated: function () {
        this._timeout = Mainloop.timeout_add_seconds(60,
            Lang.bind(this, this._isAuthenticated));
        this.klist = GLib.spawn_command_line_sync("klist");

        // check if Kerberos authentication is present
        if (this.klist[0] == true && this.klist[1] == "") {
            this.icon.gicon = Gio.icon_new_for_string(IconOff);
            return false;
        }

        if (this.klist[0] == true && this.klist[2] == "") {
            dates = String.fromCharCode.apply(null,
                this.klist[1]).match(/(\d+\/\d+\/\d+ \d+:\d+:\d+)/g);
            if (Date.parse(dates[1]) < Date.now()) {
                this.icon.gicon = Gio.icon_new_for_string(IconOff);
                return false;
            } else {
                this.icon.gicon = Gio.icon_new_for_string(IconOn);
                return true;
            }
        }

        this.icon.gicon = Gio.icon_new_for_string(IconOff);
        return false;
    },

    _spawn_async: function(cmd, e) {
        try {
            GLib.spawn_command_line_async(cmd, e);
        } catch (e) {
            throw e;
        }
    },
    _kinit: function() {
        this._spawn_async("gnome-terminal --command kinit", null);
    },
    _copy2FA: function() {
        // TODO(jongbin): Better way to find 2fa
        this._spawn_async("/home/jongbin/repos/scripts/2fa stan", null);
    }
});

let skaMenu;

function init(extensionMeta) {
    // add icons path to the theme search path
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
    skaMenu = new KerberosIndicator;
    Main.panel.addToStatusArea('ska-menu', skaMenu);
}

function disable() {
    skaMenu.destroy();
}
