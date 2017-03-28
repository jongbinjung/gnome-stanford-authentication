const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
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
		this.hbox = new St.BoxLayout({style_class: 'panel-status-menu-box'});
        this.gicon = Gio.icon_new_for_string(IconOff);
        this.icon = new St.Icon({
            gicon: this.gicon,
            style_class: 'system-status-icon'
        });

		this.lbl = new St.Label({text: "-", y_expand:true, y_align: Clutter.ActorAlign.CENTER});
		this.hbox.add_actor(this.lbl);

		this.hbox.add_actor(this.icon);
    },

    _enable: function() {
        this.actor.add_actor(this.hbox);
        this.actor.connect('button-press-event', Lang.bind(this, this._toggleStatus));
        this._timeout = Mainloop.timeout_add_seconds(1, Lang.bind(this, this._isAuthenticated));
        this.count = 1;
    },

    _resetLoop: function(sec) {
        Mainloop.source_remove(this._timeout);
        this._timeout = Mainloop.timeout_add_seconds(sec, Lang.bind(this, this._isAuthenticated));
        this.count = 1;
    },

    _toggleStatus: function () {
        if (this._isAuthenticated()) {
            this._copy2FA();
        } else {
            this._kinit();
        }
        this._resetLoop(1);
    },

    _isAuthenticated: function () {

        let dates;
        let is_auth = false;
        let e;

        this.klist = GLib.spawn_command_line_sync("klist", e);

        if (this.klist[0] == true && this.klist[2] == "") {
            dates = String.fromCharCode.apply(null,
                this.klist[1]).match(/(\d+\/\d+\/\d+ \d+:\d+:\d+)/g);
            if (Date.parse(dates[1]) >= Date.now()) {
                var diff = Date.parse(dates[1]) - Date.now()
                var minutes = Math.round(diff/60000);
                this.lbl.set_text(Math.floor(minutes/60) + ":" + minutes%60);
                this.icon.gicon = Gio.icon_new_for_string(IconOn);
                is_auth = true;
            } else {
                this.lbl.set_text("exp");
                this.icon.gicon = Gio.icon_new_for_string(IconOff);
                is_auth = false;
            }
        }

        if (this.klist[0] == true && this.klist[1] == "") {
            //this.lbl.set_text("-");
            this.lbl.set_text("-");
            this.icon.gicon = Gio.icon_new_for_string(IconOff);
            return false;
        }

        return is_auth;
    },

    _spawn_sync: function(cmd, e) {
        try {
            return GLib.spawn_command_line_sync(cmd, e);
        } catch (e) {
            throw e;
        }
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
    },

    _disable: function() {
        this.actor.remove_actor(this.icon);
        Mainloop.source_remove(this._timeout);
    },
    destroy: function() {
        this.parent();
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
    skaMenu._enable();
    shown = true;
}

function disable() {
    skaMenu._disable();
    skaMenu.destroy();
}
