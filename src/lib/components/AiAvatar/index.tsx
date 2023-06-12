import { useEffect, useRef, useState } from 'react'

import { baseUrl } from '../../requests'
import { getIdentifier } from '../../utils'

export default function Index({ whisperUuid, nowPlayingWhisperUuidState }: any) {
  const identifier = getIdentifier()
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setIsPlaying(whisperUuid && whisperUuid === nowPlayingWhisperUuidState)
  }, [nowPlayingWhisperUuidState, whisperUuid])

  const elemRef = useRef<any>()

  useEffect(() => {
    if (!elemRef || !elemRef.current) return

    if (isPlaying) {
      elemRef.current.play()
    } else {
      elemRef.current.pause()
    }
  }, [isPlaying, elemRef])

  return (
    <>
      {identifier && (
        <div className="relative flex h-12 w-12 flex-col overflow-hidden rounded-full">
          <img src={`${baseUrl}/uploads/placeholder/images/avatar-${identifier}.png`} alt="avatar" className="h-12 w-12 scale-105 rounded-full bg-[#bfbdbe]" />
        </div>
      )}
    </>
  )
}
