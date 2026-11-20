export type AppLanguage = 'id' | 'en'

export const useLang = () => {
  const lang = useState<AppLanguage>('bsh_app_lang', () => 'id')
  const initialized = useState<boolean>('bsh_app_lang_init', () => false)

  const initLang = () => {
    if (!import.meta.client || initialized.value) return
    initialized.value = true
    const saved = localStorage.getItem('bshsupport_lang')
    if (saved === 'id' || saved === 'en') {
      lang.value = saved
    }
  }

  if (import.meta.client && !initialized.value) {
    initLang()
  }

  const setLang = (newLang: AppLanguage) => {
    lang.value = newLang
    if (import.meta.client) {
      localStorage.setItem('bshsupport_lang', newLang)
    }
  }

  const toggleLang = () => {
    setLang(lang.value === 'id' ? 'en' : 'id')
  }

  /**
   * Returns Indonesian text when lang === 'id', or English text when lang === 'en'.
   */
  const t = (idText: string, enText: string): string => {
    return lang.value === 'en' ? enText : idText
  }

  return {
    lang,
    setLang,
    toggleLang,
    t,
  }
}
