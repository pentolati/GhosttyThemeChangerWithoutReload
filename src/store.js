import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      themes: [],
      loaded: false,
      loadError: null,
      query: '',
      filter: 'semua', // semua | gelap | terang | favorit
      mode: 'single', // single | split
      activeSlot: 'dark', // slot tujuan klik kartu saat mode split
      slotLight: null,
      slotDark: null,
      current: null, // isi baris theme di config, sudah diurai
      configExists: true,
      favs: [],
      busy: false,

      init: async () => {
        if (!window.ghosttyApi) {
          set({ loadError: 'bukan-desktop', loaded: true })
          return
        }
        try {
          const [themes, state] = await Promise.all([
            window.ghosttyApi.listThemes(),
            window.ghosttyApi.readState(),
          ])
          const patch = {
            themes,
            loaded: true,
            current: state.current,
            configExists: state.configExists,
          }
          if (state.current.mode === 'split') {
            patch.mode = 'split'
            patch.slotLight = state.current.light
            patch.slotDark = state.current.dark
          }
          set(patch)
        } catch {
          set({ loadError: 'gagal-muat', loaded: true })
        }
      },

      setQuery: (q) => set({ query: q }),
      setFilter: (f) => set({ filter: f }),
      setMode: (m) => set({ mode: m }),
      setActiveSlot: (s) => set({ activeSlot: s }),

      toggleFav: (name) =>
        set((s) => ({
          favs: s.favs.includes(name) ? s.favs.filter((f) => f !== name) : [...s.favs, name],
        })),

      // klik kartu saat mode satu-tema: langsung pasang
      applySingle: async (name) => {
        set({ busy: true })
        const res = await window.ghosttyApi.applyTheme({ mode: 'single', theme: name })
        if (res.ok) set({ current: { mode: 'single', theme: name, light: null, dark: null } })
        set({ busy: false })
        return res
      },

      // klik kartu saat mode ikuti-layar: isi slot aktif; kalau dua slot penuh, pasang
      assignSlot: async (name) => {
        const s = get()
        const patch = s.activeSlot === 'light' ? { slotLight: name } : { slotDark: name }
        set(patch)
        const next = { ...s, ...patch }
        if (next.slotLight && next.slotDark) {
          set({ busy: true })
          const res = await window.ghosttyApi.applyTheme({
            mode: 'split',
            light: next.slotLight,
            dark: next.slotDark,
          })
          if (res.ok) {
            set({
              current: { mode: 'split', theme: null, light: next.slotLight, dark: next.slotDark },
            })
          }
          set({ busy: false })
          return res
        }
        return null
      },
    }),
    {
      name: 'gts-store',
      partialize: (s) => ({
        favs: s.favs,
        mode: s.mode,
        slotLight: s.slotLight,
        slotDark: s.slotDark,
      }),
    },
  ),
)
