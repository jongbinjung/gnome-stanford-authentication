# Stanford Kerberos Authentication Gnome Extension

## Prerequisites
### `kinit` authentication and time indicator
Requires `krb5` to be setup for the Stanford network. See,
https://github.com/jongbinjung/dotfiles/blob/master/SUNetize.sh

### Copy 6 digit 2FA to clipboard
Requires:
  - `xclip`
  - Yubikey with Stanford `Oauth` credentials
  - `2fa` script: https://github.com/jongbinjung/scripts/blob/master/2fa

## Installation
- Clone or symlink the directory to the Gnome extension directory
(`$HOME/.local/share/gnome-shell/extensions`)
- Enable extension (e.g., with [Gnome Tweak
  Tool](https://wiki.gnome.org/Apps/GnomeTweakTool))

