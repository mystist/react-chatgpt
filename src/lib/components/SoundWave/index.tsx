import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation } from 'react-query'

import { useConversation } from '../../hooks'
import { useLocale } from '../../hooks/useLocale'
import { Whisper } from '../../interfaces'
import { postWhisper } from '../../requests'
import { classNames } from '../../utils'
import Spinner from '../Spinner'

const thresholdInPercent = 0.4
const silentPercent = 0.2 // This value should align with the animation keyframes 50% value, which is 20% for now

export default function Index({ onFinish, chatMode }: { onFinish: (content: any) => void; chatMode: string }) {
  const [volumeState, setVolumeState] = useState(0)
  const [recorderState, setRecorderState] = useState<null | MediaRecorder>(null)
  const [audioChunksState, setAudioChunksState] = useState([]) as any
  const [isDone, setIsDone] = useState(false)

  const i18n = useLocale()

  const {
    data: [conversation],
  } = useConversation()

  const { mutate: whisper, isLoading: isWhispering } = useMutation(postWhisper)

  const initialize = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      source.connect(analyser)
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const recorder = new MediaRecorder(stream)

      recorder.addEventListener('dataavailable', (e) => {
        setAudioChunksState((prev: any) => prev.concat(e.data))
      })

      recorder.addEventListener('stop', () => {
        recorder.stream.getTracks().forEach((track) => track.stop())
        audioContext.close()
      })

      recorder.start()
      setRecorderState(recorder)

      const animate = () => {
        requestAnimationFrame(animate)

        analyser.getByteFrequencyData(dataArray)
        const volume = dataArray.reduce((a, b) => a + b) / bufferLength / 255

        setVolumeState(volume > 0.01 ? volume : 0)
      }

      animate()
    })
  }, [])

  const isLoading = useMemo(() => {
    return isWhispering
  }, [isWhispering])

  const isCatchingVoice = useMemo(() => {
    return !isLoading && !!volumeState
  }, [isLoading, volumeState])

  const stop = useCallback(() => {
    if (!recorderState || isLoading) return

    recorderState.stop()
  }, [isLoading, recorderState])

  useEffect(() => {
    if (!isDone || audioChunksState.length === 0 || isLoading || !conversation) return

    const audioBlob = new Blob(audioChunksState, { type: 'audio/wav' })
    const conversationUuid = conversation.uuid

    whisper(
      { blob: audioBlob, conversationUuid, chatMode },
      {
        onSuccess: (whisper: Whisper) => onFinish({ content: whisper.content, conversationUuid, whisperUuid: whisper.uuid }),
        onError: () => onFinish({}),
      },
    )
  }, [audioChunksState, chatMode, conversation, isDone, isLoading, onFinish, whisper])

  useEffect(() => {
    ;(async () => {
      const AudioRecorder = (await import('audio-recorder-polyfill')).default
      window.MediaRecorder = AudioRecorder

      initialize()
    })()
  }, [initialize])

  return (
    <>
      <div className="flex h-10 items-center space-x-4">
        <div className="flex h-full items-center rounded-full bg-linear-color px-3 py-2 text-white shadow-sm">
          <div style={{ height: isCatchingVoice ? `${(thresholdInPercent + volumeState) * 100}%` : `${silentPercent * 100}%` }} className="flex items-center">
            <div className={classNames(isCatchingVoice ? 'animation-delay-0 animate-sound-wave ' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
            <div className={classNames(isCatchingVoice ? 'animation-delay-300 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
            <div className={classNames(isCatchingVoice ? 'animation-delay-600 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
            <div className={classNames(isCatchingVoice ? 'animation-delay-900 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
            <div className={classNames(isCatchingVoice ? 'animation-delay-600 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
            <div className={classNames(isCatchingVoice ? 'animation-delay-300 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
            <div className={classNames(isCatchingVoice ? 'animation-delay-0 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            stop()
            setIsDone(true)
          }}
          className="btn btn-secondary h-full w-fit min-w-[80px]"
        >
          {isLoading && <Spinner className="mr-2 text-gray-400" />}
          <span>{i18n.done}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            stop()
            onFinish('')
          }}
          className="btn btn-secondary h-full w-fit min-w-[80px]"
        >
          <span>{i18n.cancel}</span>
        </button>
      </div>
    </>
  )
}
