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

Each card also shows the theme's background color and a legibility score — the contrast ratio
between foreground and background. Anything below 4.5 is flagged, since that's where text starts
getting hard to read.

## How it works

Your choice is written to your Ghostty config as a single `theme` line. The old file is copied to a
backup first (the last five are kept), and everything else in it is left untouched.

Then every running Ghostty process gets `SIGUSR2` — Ghostty's signal to re-read its configuration.
That's why open windows change color without a restart: Ghostty doesn't watch the config file, but
it does answer that signal.

Themes are read from Ghostty's built-in theme directory (`$GHOSTTY_RESOURCES_DIR/themes`, falling
back to `/usr/share/ghostty/themes`) and from your own in `~/.config/ghostty/themes`. If a name
exists in both, yours wins.

Linux only for now — the reload signal is sent with `pkill -USR2`.

Built with Electron, React, Zustand and Chakra UI. Code comments are in Indonesian.
