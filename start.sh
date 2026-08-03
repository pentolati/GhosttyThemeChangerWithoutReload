#!/bin/bash
# Membuka aplikasi Pengatur Tema Ghostty.
cd "$(dirname "$(readlink -f "$0")")" || exit 1
[ -d dist ] || npm run build
exec ./node_modules/electron/dist/electron . "$@"
