import { PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useRef, useState } from 'react'

import { baseUrl, getHost } from '../../requests'
import { getIdentifier } from '../../utils'

export default function Index({ isAutoplay = false, whisperUuid, nowPlayingWhisperUuidState, setNowPlayingWhisperUuidState }: any) {
  const identifier = getIdentifier()

  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<any>()

  useEffect(() => {
    if (!audioRef || !audioRef.current) return

    if (isPlaying) {
      audioRef.current.play()
      setNowPlayingWhisperUuidState(whisperUuid)
    } else {
      audioRef.current.pause()
      setNowPlayingWhisperUuidState('')
    }
  }, [isPlaying, audioRef, setNowPlayingWhisperUuidState, whisperUuid])

  useEffect(() => {
    if (whisperUuid !== nowPlayingWhisperUuidState) setIsPlaying(false)
  }, [nowPlayingWhisperUuidState, whisperUuid])

  const onEnded = useCallback(() => {
    setIsPlaying(false)
    setNowPlayingWhisperUuidState('')
  }, [setNowPlayingWhisperUuidState])

  const playPause = useCallback(() => {
    if (nowPlayingWhisperUuidState && nowPlayingWhisperUuidState !== whisperUuid) {
      setNowPlayingWhisperUuidState('')
      setTimeout(() => {
        setIsPlaying(true)
      }, 70)
    } else {
      setIsPlaying((prev: boolean) => !prev)
    }
  }, [nowPlayingWhisperUuidState, setNowPlayingWhisperUuidState, whisperUuid])

  useEffect(() => {
    setIsPlaying(isAutoplay)
  }, [isAutoplay])

  return (
    <>
      {identifier && (
        <>
          <button onClick={playPause} className="h-6 w-6">
            {isPlaying ? <PauseCircleIcon className="h-full w-full stroke-primary-color" /> : <PlayCircleIcon className="h-full w-full stroke-gray-600" />}
          </button>
          <audio src={`${getHost()}${baseUrl}/uploads/outputs/${whisperUuid}-output.wav`} ref={audioRef} onEnded={onEnded} className="hidden"></audio>
        </>
      )}
    </>
  )
}
