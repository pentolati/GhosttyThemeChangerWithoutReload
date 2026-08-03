# Ghostty Theme Changer

Switch Ghostty themes without restarting your terminal. Every theme on your machine shows up as a
card with a preview in its own colors — click one and the terminal windows you already have open
change color right away.

![Ghostty Theme Changer](screenshot.png)

## Install

You need [Node.js](https://nodejs.org) and, of course, [Ghostty](https://ghostty.org).

```bash
git clone https://github.com/pentolati/GhosttyThemeChangerWithoutReload.git
cd GhosttyThemeChangerWithoutReload
npm install
npm run app
```

`npm run app` builds the interface and opens the app. After the first build you can just run
`./start.sh`.

To get it into your applications menu on Linux, drop this into
`~/.local/share/applications/ghostty-theme-changer.desktop` and fix the two paths:

```ini
[Desktop Entry]
Type=Application
Name=Ghostty Theme Changer
Comment=Switch Ghostty terminal themes in one click
Exec=/path/to/GhosttyThemeChangerWithoutReload/start.sh
Icon=/path/to/GhosttyThemeChangerWithoutReload/assets/ikon.png
Terminal=false
Categories=Utility;Settings;
StartupWMClass=Ghostty Theme Changer
```

## What you get

- **One theme only** — click a card, it's applied.
- **Follow light and dark** — one theme for when your screen is light, one for when it's dark, and
  the terminal follows your system.
- **Search and filter** — by name, or narrow it to dark ones, light ones, or your favorites.
- **Favorites** — the star on a card, remembered between sessions.

Each card also shows the theme's background color and how legible it is, so you can rule one out
before trying it.

## Questions you probably have

**Will it mess up my config?**
No. It only touches the `theme` line — every other setting you've written stays exactly where it
was. Before each change your config is copied to a backup (the five most recent are kept), so you
can always go back.

**Why don't my terminals need a restart?**
Ghostty doesn't watch its config file, but it does reload when it receives `SIGUSR2`. So the app
writes the theme and sends that signal to every running Ghostty process. Your windows change color
mid-session — same tabs, same running commands, nothing lost.

**Will it find the themes I made myself?**
Yes. It reads Ghostty's built-in themes (`$GHOSTTY_RESOURCES_DIR/themes`, falling back to
`/usr/share/ghostty/themes`) and your own in `~/.config/ghostty/themes`. If the same name exists in
both, yours wins. Drop a new theme file in and reopen the app to see it.

**What's that number on each card?**
The contrast ratio between the theme's text and its background. Below 4.5 it turns amber — that's
roughly where text starts being tiring to read.

## Good to know

- **Linux only for now.** The reload signal is sent with `pkill -USR2`.
- Built with Electron, React, Zustand and Chakra UI.
- The code comments are in Indonesian.
