import React, { memo, useState } from 'react'

import { setIdentifier, setLang } from '../../utils'
import AiAvatar from '../AiAvatar'
import Overlay, { OverlayProps } from '../Overlay'

export const MemoizedOverlay = memo(Overlay)



export default function ReactChatGPTIntegration(props: OverlayProps) {
  const { identifier, lang = 'en' } = props
  const [status, setStatus] = useState<'open' | ''>('')
  if (identifier) {
    setIdentifier(identifier)
    setLang(lang)
  }
  return (
    <>
      <div
        id="react-chatgpt"
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
