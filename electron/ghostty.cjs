// Semua urusan berkas Ghostty ada di sini: baca daftar tema, baca keadaan
// sekarang, tulis pilihan baru (dengan cadangan), lalu kabari jendela terminal.
// Dipisah dari jendela aplikasi supaya bisa diuji sendiri tanpa membuka layar.
const path = require('path')
const fs = require('fs')
const os = require('os')
const { execFile } = require('child_process')

const GHOSTTY_DIR = path.join(os.homedir(), '.config', 'ghostty')
const CONFIG_PATH = path.join(GHOSTTY_DIR, 'config')
const USER_THEMES_DIR = path.join(GHOSTTY_DIR, 'themes')
const BUILTIN_THEMES_DIR = process.env.GHOSTTY_RESOURCES_DIR
  ? path.join(process.env.GHOSTTY_RESOURCES_DIR, 'themes')
  : '/usr/share/ghostty/themes'

const MAKS_CADANGAN = 5

// ---------- util warna ----------
function hexToRgb(hex) {
  let h = String(hex).replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  if (Number.isNaN(n)) return [0, 0, 0]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// ---------- parser berkas tema ----------
function parseThemeFile(file) {
  const t = {
    background: null,
    foreground: null,
    cursor: null,
    selBg: null,
    selFg: null,
    palette: Array(16).fill(null),
  }
  let text
  try {
    text = fs.readFileSync(file, 'utf8')
  } catch {
    return null
  }
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    let m = line.match(/^palette\s*=\s*(\d{1,2})\s*=\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/)
    if (m) {
      const idx = Number(m[1])
      if (idx >= 0 && idx <= 15) t.palette[idx] = m[2]
      continue
    }
    m = line.match(
      /^(background|foreground|cursor-color|selection-background|selection-foreground)\s*=\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/,
    )
    if (m) {
      if (m[1] === 'background') t.background = m[2]
      if (m[1] === 'foreground') t.foreground = m[2]
      if (m[1] === 'cursor-color') t.cursor = m[2]
      if (m[1] === 'selection-background') t.selBg = m[2]
      if (m[1] === 'selection-foreground') t.selFg = m[2]
    }
  }
  return t
}

function collectThemes() {
  const byName = new Map()
  const readDir = (dir, source) => {
    if (!fs.existsSync(dir)) return
    for (const name of fs.readdirSync(dir)) {
      const file = path.join(dir, name)
      try {
        if (!fs.statSync(file).isFile()) continue
      } catch {
        continue
      }
      const t = parseThemeFile(file)
      if (!t || !t.background) continue
      // palet bolong diisi warna wajar biar pratinjau tetap utuh
      const pal = t.palette.map((c, i) => c || (i < 8 ? t.background : t.foreground))
      byName.set(name, {
        name,
        source,
        background: t.background,
        foreground: t.foreground || (luminance(t.background) > 0.4 ? '#1a1a1a' : '#e6e6e6'),
        cursor: t.cursor || t.foreground || '#ffffff',
        selBg: t.selBg || t.foreground || '#888888',
        selFg: t.selFg || t.background || '#000000',
        palette: pal,
        light: luminance(t.background) > 0.4,
      })
    }
  }
  readDir(BUILTIN_THEMES_DIR, 'bawaan')
  readDir(USER_THEMES_DIR, 'buatan') // buatan menang kalau nama sama
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
}

// ---------- baca keadaan sekarang ----------
function parseThemeLine(value) {
  // "light:A,dark:B" atau "Nama Tema"
  const res = { mode: 'single', theme: null, light: null, dark: null }
  if (!value) return res
  if (/(^|,)\s*(light|dark)\s*:/.test(value)) {
    res.mode = 'split'
    for (const part of value.split(',')) {
      const m = part.trim().match(/^(light|dark)\s*:\s*(.+)$/)
      if (m) res[m[1]] = m[2].trim()
    }
    return res
  }
  res.theme = value.trim()
  return res
}

function readState() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { configExists: false, current: parseThemeLine(null) }
  }
  let text = ''
  try {
    text = fs.readFileSync(CONFIG_PATH, 'utf8')
  } catch {
    return { configExists: true, current: parseThemeLine(null) }
  }
  let value = null
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (/^theme\s*=/.test(line)) value = line.replace(/^theme\s*=\s*/, '')
  }
  return { configExists: true, current: parseThemeLine(value) }
}

// ---------- tulis pilihan ----------
function rotateBackups() {
  const files = fs
    .readdirSync(GHOSTTY_DIR)
    .filter((f) => f.startsWith('config.cadangan-'))
    .sort()
  while (files.length > MAKS_CADANGAN - 1) {
    fs.unlinkSync(path.join(GHOSTTY_DIR, files.shift()))
  }
}

function beriTahuTerminal() {
  // Ghostty membaca ulang pengaturannya begitu menerima sinyal ini,
  // jadi jendela yang sedang terbuka ikut berganti warna.
  execFile('pkill', ['-USR2', '-x', 'ghostty'], () => {})
}

function applyTheme(payload) {
  const { mode, theme, light, dark } = payload || {}
  let value
  if (mode === 'split') {
    if (!light || !dark) {
      return { ok: false, alasan: 'Both slots, the light one and the dark one, need to be filled first.' }
    }
    value = `light:${light},dark:${dark}`
  } else {
    if (!theme) return { ok: false, alasan: 'No theme has been picked yet.' }
    value = theme
  }

  try {
    fs.mkdirSync(GHOSTTY_DIR, { recursive: true })
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.writeFileSync(
        CONFIG_PATH,
        '# Ghostty settings\n# The theme line below is managed by the Ghostty Theme Changer app.\n',
      )
    } else {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      fs.copyFileSync(CONFIG_PATH, `${CONFIG_PATH}.cadangan-${stamp}`)
      rotateBackups()
    }

    const lines = fs.readFileSync(CONFIG_PATH, 'utf8').split('\n')
    const bersih = lines.filter((l) => !/^theme\s*=/.test(l.trim()))
    while (bersih.length && bersih[bersih.length - 1].trim() === '') bersih.pop()
    bersih.push(`theme = ${value}`)
    fs.writeFileSync(CONFIG_PATH, bersih.join('\n') + '\n')

    beriTahuTerminal()
    return { ok: true, line: `theme = ${value}` }
  } catch {
    return {
      ok: false,
      alasan: "The settings file couldn't be written. Check the permissions on your Ghostty settings folder, then try again.",
    }
  }
}

module.exports = {
  CONFIG_PATH,
  GHOSTTY_DIR,
  collectThemes,
  readState,
  parseThemeLine,
  applyTheme,
  beriTahuTerminal,
  luminance,
}
