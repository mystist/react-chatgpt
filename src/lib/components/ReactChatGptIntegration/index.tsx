import React, { memo, useState } from 'react'

import { setIdentifier, setLang } from '../../utils'
import AiAvatar from '../AiAvatar'
import Overlay, { OverlayProps } from '../Overlay'

export const MemoizedOverlay = memo(Overlay)

export interface ReactChatGPTIntegrationProps extends OverlayProps {
  defaultStatus: 'open' | ''
}

export default function ReactChatGPTIntegration(props: ReactChatGPTIntegrationProps) {
  const { defaultStatus, identifier, lang = 'en' } = props
  const [status, setStatus] = useState(defaultStatus)
  if (identifier) {
    setIdentifier(identifier)
    setLang(lang)
  }
  return (
    <>
      <div
        onClick={(e) => {
          setStatus('open')
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <AiAvatar />
      </div>
      <MemoizedOverlay {...props} status={status} setStatus={setStatus} />
    </>
  )
}
