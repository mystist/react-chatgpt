import { useCallback, useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'

import { useLocale } from '../../hooks/useLocale'
import { setConversationUuid, setIdentifier, setLang, setUserUuid } from '../../utils'
import { setConfig } from '../../utils'
import Modal from './Modal'
import SlideOver from './SlideOver'

export default function Index({ status, setStatus, identifier, lang = 'en', overlayMode = 'auto', userUuid = '', conversationUuid = '', configuration = null }: any) {
  const i18n = useLocale(lang)

  const isMd = useMediaQuery({ query: '(min-width: 768px)' })

  if (status && identifier) {
    setIdentifier(identifier)
    setLang(lang)

    if (userUuid) setUserUuid(userUuid)
    if (conversationUuid) setConversationUuid(conversationUuid)
    if (configuration) setConfig(JSON.stringify(configuration))
  }

  const close = useCallback(() => {
    setStatus('')
  }, [setStatus])

  const isShow = useMemo(() => {
    return !!identifier && !!status
  }, [identifier, status])

  const mode = useMemo(() => {
    if (overlayMode !== 'auto') return overlayMode

    if (isMd) {
      return 'modal'
    } else {
      return 'slide-over'
    }
  }, [isMd, overlayMode])

  return (
    <>
      {mode === 'modal' && <Modal isShow={isShow} i18n={i18n} close={setStatus ? close : null} overlayMode={mode} />}
      {mode === 'slide-over' && <SlideOver isShow={isShow} i18n={i18n} close={setStatus ? close : null} overlayMode={mode} />}
    </>
  )
}
