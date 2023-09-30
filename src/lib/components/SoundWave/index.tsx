import { LanguageIcon, XCircleIcon } from '@heroicons/react/20/solid'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'react-query'

import { useConversation } from '../../hooks'
import { useLocale } from '../../hooks/useLocale'
import { Whisper } from '../../interfaces'
import { postWhisper } from '../../requests'
import { classNames } from '../../utils'
import Spinner from '../Spinner'

const thresholdInPercent = 0.4
const silentPercent = 0.2 // This value should align with the animation keyframes 50% value, which is 20% for now

export default function Index({ onFinish, chatMode, close }: { onFinish: (content: any) => void; chatMode: string; close: () => void }) {
  const [volumeState, setVolumeState] = useState(0)
  const [recorderState, setRecorderState] = useState<null | MediaRecorder>(null)
  const [audioChunksState, setAudioChunksState] = useState([]) as any
  const [isDone, setIsDone] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speakingStartTime = useRef<number>(0)
  const [infoMessage, setInfoMessage] = useState('')

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
    return !isLoading && volumeState > 0
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
        onSettled: () => {
          setIsDone(false)
          setIsSpeaking(false)
        },
      },
    )
  }, [audioChunksState, chatMode, conversation, isDone, isLoading, onFinish, whisper])

  useEffect(() => {
    ;(async () => {
      const AudioRecorder = (await import('audio-recorder-polyfill')).default
      window.MediaRecorder = AudioRecorder
    })()
  }, [])

  const startSpeaking = () => {
    if (isLoading) return

    stop()
    setRecorderState(null)
    setAudioChunksState([])
    setVolumeState(0)
    setInfoMessage('')

    initialize()
    speakingStartTime.current = Date.now()

    setIsSpeaking(true)
  }

  const finishSpeaking = () => {
    if (isLoading) return

    stop()

    const duration = Date.now() - speakingStartTime.current
    if (duration >= 2000) {
      setIsDone(true)
    } else {
      setInfoMessage(i18n.speakingTimeTooShort)
      setIsSpeaking(false)
    }
  }

  const cancel = () => {
    if (isLoading) return

    stop()
    setIsSpeaking(false)
    setInfoMessage('')
  }

  return (
    <>
      <div className="flex w-full flex-col space-y-4">
        {infoMessage && (
          <div className="flex w-full space-x-1">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <span className="text-sm text-red-700">{infoMessage}</span>
          </div>
        )}
        <div className="flex w-full justify-between">
          <div className="flex h-10 space-x-4">
            <div className="flex h-full items-center rounded-full bg-linear-color px-3 py-2 text-white shadow-sm">
              <div style={{ height: !isSpeaking ? 1 : isCatchingVoice ? `${(thresholdInPercent + volumeState) * 100}%` : `${silentPercent * 100}%` }} className="flex items-center">
                <div className={classNames(isCatchingVoice && isSpeaking ? 'animation-delay-0 animate-sound-wave ' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
                <div className={classNames(isCatchingVoice && isSpeaking ? 'animation-delay-300 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
                <div className={classNames(isCatchingVoice && isSpeaking ? 'animation-delay-600 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
                <div className={classNames(isCatchingVoice && isSpeaking ? 'animation-delay-900 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
                <div className={classNames(isCatchingVoice && isSpeaking ? 'animation-delay-600 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
                <div className={classNames(isCatchingVoice && isSpeaking ? 'animation-delay-300 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
                <div className={classNames(isCatchingVoice && isSpeaking ? 'animation-delay-0 animate-sound-wave' : '', 'relative mx-1 h-full w-[2.5px] rounded-3xl bg-slate-100')}></div>
              </div>
            </div>
            {!isSpeaking && (
              <button onClick={startSpeaking} className="btn btn-secondary h-full w-fit min-w-[80px]">
                <span>{i18n.startSpeaking}</span>
              </button>
            )}
            {isSpeaking && (
              <button onClick={finishSpeaking} className="btn btn-secondary h-full w-fit min-w-[80px]">
                {isLoading && <Spinner className="mr-2 text-gray-400" />}
                <span>{i18n.finishSpeaking}</span>
              </button>
            )}
            {isSpeaking && !isLoading && (
              <button type="button" onClick={cancel} className="btn btn-secondary h-full w-fit min-w-[80px]">
                <span>{i18n.cancel}</span>
              </button>
            )}
          </div>
          {!isSpeaking && (
            <button onClick={close} className="btn btn-secondary h-full w-fit">
              <LanguageIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
