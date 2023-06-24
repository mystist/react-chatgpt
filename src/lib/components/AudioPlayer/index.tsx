import { useCallback, useEffect, useRef, useState } from 'react'

import { baseUrl } from '../../requests'
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
          <button onClick={playPause} className="group absolute flex h-full w-full flex-shrink-0 rounded-full bg-linear-purple-pink opacity-100 hover:opacity-90">
            {isPlaying ? (
              <svg aria-hidden="true" viewBox="0 0 22 28" className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform fill-gray-200">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.5 0C0.671573 0 0 0.671572 0 1.5V26.5C0 27.3284 0.671573 28 1.5 28H4.5C5.32843 28 6 27.3284 6 26.5V1.5C6 0.671573 5.32843 0 4.5 0H1.5ZM17.5 0C16.6716 0 16 0.671572 16 1.5V26.5C16 27.3284 16.6716 28 17.5 28H20.5C21.3284 28 22 27.3284 22 26.5V1.5C22 0.671573 21.3284 0 20.5 0H17.5Z"
                ></path>
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 36 36" className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 transform fill-gray-200">
                <path d="M33.75 16.701C34.75 17.2783 34.75 18.7217 33.75 19.299L11.25 32.2894C10.25 32.8668 9 32.1451 9 30.9904L9 5.00962C9 3.85491 10.25 3.13323 11.25 3.71058L33.75 16.701Z"></path>
              </svg>
            )}
          </button>
          <audio src={`${baseUrl}/uploads/outputs/${whisperUuid}-output.wav`} ref={audioRef} onEnded={onEnded} className="hidden"></audio>
        </>
      )}
    </>
  )
}
