import { MicrophoneIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import { useMutation } from 'react-query'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { useConversation } from '../../hooks'
import { useConfiguration } from '../../hooks/useConfiguration'
import { useReplies } from '../../hooks/useReplies'
import { useWhispers } from '../../hooks/useWhispers'
import { Talk, Whisper } from '../../interfaces'
import { baseUrl, postReply, postWhisperByText } from '../../requests'
import { getIdentifier, timeSince } from '../../utils'
import AiAvatar from '../AiAvatar'
import AudioPlayer from '../AudioPlayer'
import SoundWave from '../SoundWave'
import Spinner from '../Spinner'

const DefaultAvatar = () => (
  <span className="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  </span>
)

const PulseSpinner = () => (
  <div className="mx-auto w-full rounded-md">
    <div className="flex animate-pulse space-x-4">
      <div className="flex-1 space-y-6 py-1">
        <div className="space-y-2">
          <div className="h-2 rounded bg-gray-300 opacity-30"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-gray-300 opacity-30"></div>
            <div className="col-span-1 h-2 rounded bg-gray-300 opacity-30"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function Index() {
  const divRef = useRef<HTMLDivElement | null>(null)
  const introRef = useRef<any>()

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [conversationUuidState, setConversationUuidState] = useState('')
  const [latestReplyContentState, setLatestReplyContentState] = useState('')
  const [nowPlayingWhisperUuidState, setNowPlayingWhisperUuidState] = useState('')
  const [isIntroPlaying, setIsIntroPlaying] = useState(false)

  const identifier = getIdentifier()
  const { agentName, questions } = useConfiguration()

  const conversation = useConversation()
  const { data: whispers, refetch: refetchWhispers } = useWhispers(conversationUuidState)
  const { data: replies, refetch: refetchReplies } = useReplies(conversationUuidState)

  const { mutate: reply } = useMutation(postReply, { retry: false })

  const { register, handleSubmit, reset, setValue } = useForm()
  const { mutate, isLoading } = useMutation(postWhisperByText, { retry: false })

  useEffect(() => {
    if (conversation) setConversationUuidState(conversation.uuid)
  }, [conversation])

  const isSafari = useCallback(() => /^((?!chrome|android).)*safari/i.test(navigator.userAgent), [])

  useEffect(() => {
    if (!isSafari()) setIsIntroPlaying(false)
  }, [isSafari])

  const scroll = useCallback(() => {
    setTimeout(() => {
      if (divRef && divRef.current) divRef.current.scrollIntoView({ behavior: 'smooth' })
    }, 70)
  }, [])

  const onMessage = useCallback(
    ({ message, isFinish }: any) => {
      if (!isFinish) {
        const { content, role } = message.choices[0].delta

        // Got the first stream message
        if (role) {
          setIsThinking(false)
          setIsWriting(true)
          scroll()
        }

        if (content) setLatestReplyContentState((item) => item + content)
      } else {
        if (message) {
          setLatestReplyContentState(message)
        }

        setIsThinking(false)
        setIsWriting(false)
      }
    },
    [scroll],
  )

  const onFinish = useCallback(
    ({ content, conversationUuid, whisperUuid }: any) => {
      setIsSpeaking(false)

      if (!content) return

      refetchWhispers().then(scroll)

      setIsThinking(true)
      reply({ conversationUuid, whisperUuid, content, identifier, onMessage })
    },
    [identifier, onMessage, refetchWhispers, reply, scroll],
  )

  const talks = useMemo(() => {
    const talks: Talk[] = []

    if (!whispers || !replies) return talks

    return talks.concat(whispers).concat(replies)
  }, [whispers, replies])

  const latestWhisper = useMemo(() => {
    if (!whispers || whispers.length === 0) return

    return whispers.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))[0]
  }, [whispers])

  const onSpeaking = useCallback(() => {
    if (isWriting || isThinking) return

    setIsSpeaking(true)

    refetchReplies().then(() => setLatestReplyContentState(''))
  }, [isThinking, isWriting, refetchReplies])

  useEffect(() => {
    if (!introRef || !introRef.current) return

    if (isIntroPlaying) {
      introRef.current.play()
    } else {
      introRef.current.pause()
    }
  }, [isIntroPlaying])

  const caretHtml = useMemo(() => '<span class="not-prose ml-1 animate-caret border-r-2 border-r-gray-400"></span>', [])

  const send = useCallback(
    ({ content }: any) => {
      if (!content || isWriting || isThinking) return

      reset()
      refetchReplies().then(() => setLatestReplyContentState(''))

      mutate(
        { content, conversationUuid: conversationUuidState },
        {
          onSuccess: (whisper: Whisper) => {
            onFinish({ content: whisper.content, conversationUuid: conversationUuidState, whisperUuid: whisper.uuid })
          },
        },
      )
    },
    [conversationUuidState, isThinking, isWriting, mutate, onFinish, refetchReplies, reset],
  )

  const onSelectQuestion = useCallback(
    (e: any) => {
      const val = e.currentTarget.innerText.trim()
      if (!val) return

      setValue('content', val)
    },
    [setValue],
  )

  return (
    <>
      {agentName && (
        <div className="flex h-full">
          <section className="w-full">
            <div className="flex h-full flex-col justify-between bg-white shadow sm:overflow-hidden sm:rounded-lg">
              <div className="px-4 py-6 sm:px-6">
                {
                  <ul role="list" className="space-y-8">
                    <li>
                      <div className="flex space-x-3">
                        <div className="z-20 flex-shrink-0">
                          <AiAvatar />
                        </div>
                        <div className="z-10">
                          <div className="text-sm">
                            <a href="#" className="font-medium text-gray-900">
                              {agentName}
                            </a>
                          </div>
                          <div className="relative mt-1 -translate-x-5 transform text-sm text-gray-700">
                            <video className="w-full" ref={introRef} onEnded={() => setIsIntroPlaying(false)}>
                              <source src={`${baseUrl}/uploads/placeholder/videos/default-talk-${identifier}.mp4`} type="video/mp4" />
                            </video>
                          </div>
                          <div className="mt-4 flex items-center space-x-4 text-sm">
                            <span className="text-gray-500">Intro</span>
                            <span className="text-gray-500">&middot;</span>
                            <div className="relative inline-flex h-7 w-7">
                              <button onClick={() => setIsIntroPlaying((prev) => !prev)} className="group absolute flex h-full w-full flex-shrink-0 rounded-full bg-linear-purple-pink opacity-100 hover:opacity-90">
                                {isIntroPlaying ? (
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    {talks
                      .sort((a: Talk, b: Talk) => (a.createdAt > b.createdAt ? 1 : -1))
                      .map((item: any) => (
                        <li key={item.createdAt}>
                          {item.role === 'assistant' && (
                            <div className="flex space-x-3">
                              <div className="flex-shrink-0">
                                <div className="relative flex flex-col">
                                  <AiAvatar whisperUuid={item.whisperUuid} nowPlayingWhisperUuidState={nowPlayingWhisperUuidState} />
                                </div>
                              </div>
                              <div>
                                <div className="text-sm">
                                  <a href="#" className="font-medium text-gray-900">
                                    {agentName}
                                  </a>
                                </div>
                                <div className="mt-1 text-gray-700">
                                  <div className="prose prose-sm prose-slate prose-p:my-2 prose-thead:whitespace-nowrap">
                                    <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                                      {item.content}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                                <div className="mt-1 flex items-center space-x-4 text-sm">
                                  <span className="text-gray-500">{timeSince(item.createdAt)}</span>
                                  <span className="text-gray-500">&middot;</span>
                                  <div className="relative inline-flex h-7 w-7">
                                    {item.whisperUuid && (
                                      <AudioPlayer whisperUuid={item.whisperUuid} content={item.content} nowPlayingWhisperUuidState={nowPlayingWhisperUuidState} setNowPlayingWhisperUuidState={setNowPlayingWhisperUuidState} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {item.role === 'user' && (
                            <div className="flex justify-end space-x-3">
                              <div className="flex flex-col items-end">
                                <div className="mt-1 text-gray-700">
                                  <div className="prose prose-sm prose-slate prose-p:my-2 prose-thead:whitespace-nowrap">{item.content}</div>
                                </div>
                                <div className="mt-1 flex items-center justify-end space-x-4 text-sm">
                                  <span className="text-gray-500">{timeSince(item.createdAt)}</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <DefaultAvatar />
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    {latestReplyContentState && latestWhisper && (
                      <li>
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="relative flex flex-col">
                              <AiAvatar whisperUuid={latestWhisper.uuid} nowPlayingWhisperUuidState={nowPlayingWhisperUuidState} />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm">
                              <a href="#" className="font-medium text-gray-900">
                                {agentName}
                              </a>
                            </div>
                            <div className="mt-1 flex text-gray-700">
                              <div className="prose prose-sm prose-slate prose-p:my-2 prose-thead:whitespace-nowrap">
                                <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                                  {latestReplyContentState + (isWriting ? caretHtml : '')}
                                </ReactMarkdown>
                              </div>
                            </div>

                            <div className="mt-1 flex items-center space-x-4 text-sm">
                              <span className="text-gray-500">{timeSince(new Date().getTime())}</span>
                              <span className="text-gray-500">&middot;</span>
                              <div className="relative inline-flex h-7 w-7">
                                {latestWhisper.uuid && !isWriting && (
                                  <AudioPlayer
                                    isAutoplay={true}
                                    whisperUuid={latestWhisper.uuid}
                                    content={latestReplyContentState}
                                    nowPlayingWhisperUuidState={nowPlayingWhisperUuidState}
                                    setNowPlayingWhisperUuidState={setNowPlayingWhisperUuidState}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}
                    {isThinking && (
                      <li>
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <AiAvatar />
                              <span className="absolute bottom-0 right-0 flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-linear-purple-pink opacity-50"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-linear-purple-pink opacity-70"></span>
                              </span>
                            </div>
                          </div>
                          <div className="flex w-full max-w-[200px] flex-col">
                            <div className="flex items-baseline space-x-1 text-sm">
                              <a href="#" className="font-medium text-gray-900">
                                {agentName}
                              </a>
                              <span className="text-xs text-gray-500"> is thinking...</span>
                            </div>
                            <div className="mt-1 text-sm text-gray-700">
                              <PulseSpinner />
                            </div>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                }
              </div>
              <div className="bg-gray-50 px-4 py-6 sm:px-6">
                <div className="flex flex-col">
                  <div className="min-w-0 flex-1">
                    {isSpeaking && <SoundWave onFinish={onFinish} />}
                    {!isSpeaking && (
                      <div className="">
                        <form onSubmit={handleSubmit(send)} className="flex h-10 space-x-3">
                          <button type="button" onClick={onSpeaking} className="rounded-full bg-linear-purple-pink p-2 text-white opacity-100 hover:opacity-90">
                            <MicrophoneIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                          <input
                            type="text"
                            {...register('content')}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-[1.5px] focus:ring-primary-purple sm:text-sm sm:leading-6"
                          />
                          <button type="submit" className="btn btn-secondary h-full w-20">
                            {isLoading && <Spinner className="mr-2 text-gray-400" />}
                            <span>Send</span>
                          </button>
                        </form>
                        <div className="mb-2 mt-3">
                          <div className="flex flex-wrap gap-x-4 gap-y-4 pt-4">
                            {questions.map((item: any, index: number) => (
                              <button key={index} type="button" className="rounded-md bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" onClick={onSelectQuestion}>
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div ref={divRef} />
          </section>
        </div>
      )}
    </>
  )
}
