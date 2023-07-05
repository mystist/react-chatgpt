import { useEffect, useRef, useState } from 'react'

import { useConfiguration } from '../../hooks/useConfiguration'

export default function Index({ whisperUuid, nowPlayingWhisperUuidState }: any) {
  const [isPlaying, setIsPlaying] = useState(false)
  const { avatarPath } = useConfiguration()

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
      {avatarPath && (
        <div className="relative flex h-12 w-12 flex-col overflow-hidden rounded-full">
          <img src={avatarPath} alt="avatar" className="h-12 w-12 scale-105 rounded-full bg-[#bfbdbe]" />
        </div>
      )}
    </>
  )
}
