import { useEffect, useState } from 'react'

import { i18n as en } from '../locales/en'
import { getLang } from '../utils'

export const useLocale = (language = '') => {
  const [i18nState, setI18nState] = useState(en) as any

  const lang = language || getLang()

  useEffect(() => {
    ;(async () => {
      if (!lang) return

      const { i18n } = await import(/* @vite-ignore */ `../locales/${lang}.ts`)
      if (i18n) setI18nState(i18n)
    })()
  }, [lang])

  return i18nState
}
