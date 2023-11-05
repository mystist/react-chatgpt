import { Dialog, Menu, Transition } from '@headlessui/react'
import { ChatBubbleBottomCenterTextIcon, CheckCircleIcon, ChevronDownIcon, PaperClipIcon } from '@heroicons/react/20/solid'
import { ExclamationTriangleIcon, FireIcon, MicrophoneIcon, MinusCircleIcon, PlusCircleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import { useMutation, useQuery } from 'react-query'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { useConversation } from '../../hooks'
import { useConfiguration } from '../../hooks/useConfiguration'
import { useLocale } from '../../hooks/useLocale'
import { useReplies } from '../../hooks/useReplies'
import { useWhispers } from '../../hooks/useWhispers'
import { Talk, Whisper } from '../../interfaces'
import { deleteReference, getReferences, postReply, postSection, postUpload, postWhisperByText } from '../../requests'
import { classNames, getAgreement, getConversationUuid, getIdentifier, getUserUuid, setAgreement, timeSince } from '../../utils'
import AiAvatar from '../AiAvatar'
import AudioPlayer from '../AudioPlayer'
import Clipboard from '../Clipboard'
import Divider from '../Divider'
import MermaidChart from '../MermaidChart'
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

export default function Index({ overlayMode }: any) {
  const divRef = useRef<HTMLDivElement | null>(null)
  const introRef = useRef<any>()

  const i18n = useLocale()

  const [isSpeakingMode, setIsSpeakingMode] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [isImeComposing, setIsImeComposing] = useState(false)
  const [nowPlayingWhisperUuidState, setNowPlayingWhisperUuidState] = useState('')
  const [isIntroPlaying, setIsIntroPlaying] = useState(false)
  const [isShowClaim, setIsShowClaim] = useState(false)
  const [isShowSend, setIsShowSend] = useState(false)
  const [contentBreakCount, setContentBreakCount] = useState(0)
  const [chatMode, setChatMode] = useState('task')
  const [newFile, setNewFile] = useState<{ title: string; file: File } | null>(null)
  const [isShowPanel, setIsShowPanel] = useState(false)
  const [isLoadingSectionIndex, setIsLoadingSectionIndex] = useState(-1)
  const [selectedReferences, setSelectedReferences] = useState([])
  const [currentCopiedIndexState, setCurrentCopiedIndexState] = useState(-1)

  const [latestWhisperContentState, setLatestWhisperContentState] = useState('')
  const [latestReplyContentState, setLatestReplyContentState] = useState('')

  const [conversationUuidState, setConversationUuidState] = useState('')
  const [previousConversationUuidState, setPreviousConversationUuidState] = useState('')
  const [isNewConversation, setIsNewConversation] = useState(false)
  const [isNewChat, setIsNewChat] = useState(false)

  const identifier = getIdentifier()
  const userUuid = getUserUuid()
  const { agentName, questions, introduction, disclaimer, disclaimerPath, videoPath, isUseEmbedding, prompt, sectionType, isAudioAutoPlay, tongue, newConversationRound: cNewConversationRound } = useConfiguration()

  const {
    data: [conversation, previousConversation],
    refetch: refetchConversation,
  } = useConversation({ isCreate: isNewConversation })

  const { data: whispers, refetch: refetchWhispers } = useWhispers(conversationUuidState)
  const { data: replies, refetch: refetchReplies } = useReplies(conversationUuidState)

  const { data: previousWhispers } = useWhispers(previousConversationUuidState)
  const { data: previousReplies } = useReplies(previousConversationUuidState)

  const { mutate: reply } = useMutation(postReply)
  const { mutate: mutateUpload, isLoading: isLoadingUpload } = useMutation(postUpload)
  const { mutate: mutateSection } = useMutation(postSection)
  const { mutate: mutateDeleteReference } = useMutation(deleteReference)

  const { register, handleSubmit, resetField, setValue, watch } = useForm()
  const { mutate: whisperByText, isLoading } = useMutation(postWhisperByText)
  const watchedContent = watch('content')

  const { data: references, refetch: refetchReferences } = useQuery('references', () => getReferences({ identifier, userUuid }), { enabled: isShowPanel && !!userUuid })

  const isConversationUuidAsParam = !!getConversationUuid()

  useEffect(() => {
    if (conversation) setConversationUuidState(conversation.uuid)
    if (previousConversation) setPreviousConversationUuidState(previousConversation.uuid)
  }, [conversation, previousConversation])

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

  const onConversationFull = useCallback(() => {
    setIsNewConversation(true)
  }, [])

  const fetchWhispersAndReply = useCallback(
    ({ content, conversationUuid, whisperUuid }: any) => {
      if (!content) return

      setLatestWhisperContentState(content)
      refetchWhispers().then(() => {
        setIsThinking(true)

        const referenceCodesStr = selectedReferences.length > 0 ? selectedReferences.map((item: any) => item.code).join(',') : ''
        reply({ conversationUuid, whisperUuid, content, identifier, onMessage, onConversationFull, chatMode, userUuid, referenceCodesStr })

        scroll()
      })
    },
    [chatMode, identifier, onConversationFull, onMessage, refetchWhispers, reply, scroll, userUuid, selectedReferences],
  )

  useEffect(() => {
    if (isNewConversation && !isNewChat)
      refetchConversation().then(({ data }: any) => {
        setIsNewConversation(false)

        const conversation = data && data.length > 1 ? data[0] : null

        whisperByText(
          { content: latestWhisperContentState, conversationUuid: conversation.uuid, chatMode },
          {
            onSuccess: (whisper: Whisper) => {
              fetchWhispersAndReply({ content: whisper.content, conversationUuid: conversation.uuid, whisperUuid: whisper.uuid })
            },
          },
        )
      })
  }, [chatMode, conversationUuidState, fetchWhispersAndReply, isNewChat, isNewConversation, latestWhisperContentState, refetchConversation, whisperByText])

  const talks = useMemo(() => {
    const talks: Talk[] = []

    if (!whispers || !replies) return talks

    return talks
      .concat(whispers)
      .concat(replies)
      .sort((a: Talk, b: Talk) => (a.createdAt > b.createdAt ? 1 : -1))
  }, [whispers, replies])

  const previousTalks = useMemo(() => {
    const talks: Talk[] = []

    if (!previousWhispers || !previousReplies) return talks

    return talks
      .concat(previousWhispers)
      .concat(previousReplies)
      .sort((a: Talk, b: Talk) => (a.createdAt > b.createdAt ? 1 : -1))
      .slice(-2 * 1)
  }, [previousWhispers, previousReplies])

  const introTalks = useMemo(() => {
    if (!conversationUuidState || !introduction) return []

    const talk: Talk = {
      conversationUuid: conversationUuidState,
      createdAt: 0,
      role: 'assistant',
      uuid: 'fake-uuid',
      content: introduction,
    }

    return [talk]
  }, [conversationUuidState, introduction])

  const latestWhisper = useMemo(() => {
    if (!whispers || whispers.length === 0) return

    return whispers.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))[0]
  }, [whispers])

  const updateReplies = useCallback(() => {
    refetchReplies().then(() => setLatestReplyContentState(''))
  }, [refetchReplies])

  const useSpeakingMode = useCallback(() => {
    if (isWriting || isThinking) return

    setIsSpeakingMode(true)
    updateReplies()
  }, [isThinking, isWriting, updateReplies])

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
      if (!content || !content.trim() || isWriting || isThinking) return

      resetField('content')
      updateReplies()
      setCurrentCopiedIndexState(-1)

      whisperByText(
        { content, conversationUuid: conversationUuidState, chatMode },
        {
          onSuccess: (whisper: Whisper) => {
            fetchWhispersAndReply({ content: whisper.content, conversationUuid: conversationUuidState, whisperUuid: whisper.uuid })
          },
        },
      )
    },
    [isWriting, isThinking, resetField, updateReplies, whisperByText, conversationUuidState, chatMode, fetchWhispersAndReply],
  )

  const onSelectQuestion = useCallback(
    (e: any) => {
      const val = e.currentTarget.innerText.trim()
      if (!val) return

      setValue('content', val)
    },
    [setValue],
  )

  const agree = useCallback(() => {
    setAgreement('agree')
    setIsShowClaim(false)
  }, [])

  const showDisclaimer = useCallback((e: any) => {
    setIsShowClaim(true)
    e.preventDefault()
  }, [])

  const shouldShowDisclaimer = useCallback(() => {
    return disclaimer && getAgreement() !== 'agree'
  }, [disclaimer])

  useEffect(() => {
    setIsShowSend(watchedContent && watchedContent.trim())
  }, [watchedContent])

  const newChat = useCallback(() => {
    setIsNewChat(true)
    setIsNewConversation(true)
  }, [])

  useEffect(() => {
    if (isNewChat && isNewConversation) {
      refetchConversation().then(() => {
        setIsNewConversation(false)
        setIsNewChat(false)
      })
    }
  }, [isNewChat, isNewConversation, refetchConversation, refetchWhispers])

  useEffect(() => {
    if (!watchedContent || !watchedContent.trim()) {
      setContentBreakCount(0)
      resetField('content')
      return
    }

    const matches = watchedContent.match(/\n/g)
    const count = matches ? matches.length : 0

    setContentBreakCount(count >= 5 ? 5 : count)
  }, [resetField, watchedContent])

  const addFile = useCallback((file: any) => {
    if (!file) return

    const maxSize = 30 * 1024 * 1024

    if (file && file.size <= maxSize) {
      setNewFile({ title: file.name.trim().replace(/\.[^/.]+$/, ''), file })
    }
  }, [])

  const upload = useCallback(
    ({ title, file }: any) => {
      mutateUpload(
        { title, file, userCode: identifier, clientIdentifier: userUuid },
        {
          onSuccess: () => {
            setNewFile(null)
            refetchReferences()
          },
        },
      )
    },
    [identifier, mutateUpload, refetchReferences, userUuid],
  )

  const getMermaidCodes = useCallback((content: string) => {
    if (typeof content !== 'string') return []

    const regex = content.indexOf('```mermaid') !== -1 ? /```mermaid\n([\s\S]*?)```/g : /<blockquote>\n([\s\S]*?)<\/blockquote>/g

    let match
    const contents = []

    while ((match = regex.exec(content)) !== null) {
      contents.push(match[1])
    }

    return contents
  }, [])

  useEffect(() => {
    if (prompt && !prompt.user) setChatMode('chat')
  }, [prompt])

  const training = useCallback(
    ({ code, index }: any) => {
      if (!code) return

      setIsLoadingSectionIndex(index)
      mutateSection(
        { code, identifier, userUuid },
        {
          onSuccess: () => {
            setIsLoadingSectionIndex(-1)
            refetchReferences()
          },
        },
      )
    },
    [identifier, mutateSection, refetchReferences, userUuid],
  )

  const doDelete = useCallback(
    (code: string) => {
      if (!code) return

      mutateDeleteReference(
        { code, userUuid },
        {
          onSuccess: () => {
            refetchReferences()
          },
        },
      )
    },
    [mutateDeleteReference, refetchReferences, userUuid],
  )

  const add = useCallback(
    (reference: any) => {
      if (!reference) return
      if (selectedReferences.find((item: any) => item.code === reference.code)) return

      setSelectedReferences(selectedReferences.concat(reference))
    },
    [selectedReferences],
  )

  const remove = useCallback(
    (code: string) => {
      if (!code) return

      setSelectedReferences(selectedReferences.filter((item: any) => item.code !== code))
    },
    [selectedReferences],
  )

  const isConversationFull = useCallback(() => {
    if (!cNewConversationRound || !talks || talks.length === 0) return false

    let newConversationRound = 50
    if (cNewConversationRound && +cNewConversationRound >= 10 && +cNewConversationRound <= 100) newConversationRound = +cNewConversationRound

    return talks.length + 1 >= newConversationRound * 2
  }, [cNewConversationRound, talks])

  return (
    <>
      {agentName && (
        <div className="flex h-full">
          <section className="w-full">
            <div className="flex h-full flex-col justify-between bg-white shadow sm:overflow-hidden sm:rounded-lg">
              <div className="px-4 py-6 sm:px-6">
                {
                  <ul role="list" className="space-y-8">
                    {videoPath && (
                      <li>
                        <div className="flex space-x-3">
                          <div className="z-20 flex-shrink-0">
                            <AiAvatar />
                          </div>
                          <div className="z-10">
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">{agentName}</span>
                            </div>
                            <div className="relative mt-1 max-w-md overflow-hidden rounded text-sm text-gray-700">
                              <video className="w-full" ref={introRef} onEnded={() => setIsIntroPlaying(false)}>
                                <source src={videoPath} type="video/mp4" />
                              </video>
                            </div>
                            <div className="mt-4 flex items-center space-x-4 text-sm">
                              <span className="text-gray-500">{i18n.intro}</span>
                              <span className="text-gray-500">&middot;</span>
                              <div className="relative inline-flex h-7 w-7">
                                <button onClick={() => setIsIntroPlaying((prev) => !prev)} className="group absolute flex h-full w-full flex-shrink-0 rounded-full bg-linear-color opacity-100 hover:opacity-90">
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
                    )}
                    {introTalks
                      .concat(previousTalks)
                      .concat(talks)
                      .map((item: any, index: number) => (
                        <Fragment key={index}>
                          <li>
                            {item.role === 'assistant' && (
                              <div className="flex space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="relative flex flex-col">
                                    <AiAvatar whisperUuid={item.whisperUuid} nowPlayingWhisperUuidState={nowPlayingWhisperUuidState} />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-900">{agentName}</span>
                                  </div>
                                  <div className="mt-2 flex w-fit flex-col rounded-2xl bg-gray-100 px-4 py-2 text-gray-700">
                                    <div
                                      className={classNames(
                                        overlayMode === 'slide-over' ? '' : 'lg:prose-base',
                                        'prose prose-sm prose-slate prose-blockquote:hidden prose-pre:whitespace-pre-line prose-thead:whitespace-pre-line prose-td:break-all',
                                      )}
                                    >
                                      <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                                        {item.content}
                                      </ReactMarkdown>
                                    </div>
                                    {getMermaidCodes(item.content).map((code: string, index: number) => (
                                      <MermaidChart key={index} code={code} index={index} />
                                    ))}
                                  </div>
                                  {!!item.createdAt && (
                                    <div className="mt-2 flex items-center space-x-4 text-sm">
                                      <span className="text-gray-500">{timeSince(item.createdAt, i18n)}</span>
                                      <span className="text-gray-500">&middot;</span>
                                      <button
                                        className="flex"
                                        onClick={() => {
                                          navigator.clipboard.writeText(item.content)
                                          setCurrentCopiedIndexState(index)
                                        }}
                                      >
                                        <Clipboard className="h-9 w-9 stroke-gray-600" isCopied={currentCopiedIndexState === index} />
                                      </button>
                                      {tongue && item.whisperUuid && <AudioPlayer whisperUuid={item.whisperUuid} nowPlayingWhisperUuidState={nowPlayingWhisperUuidState} setNowPlayingWhisperUuidState={setNowPlayingWhisperUuidState} />}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {item.role === 'user' && (
                              <>
                                {index === introTalks.length + previousTalks.length + talks.length - 1 && <div ref={divRef} />}
                                <div className="flex justify-end space-x-3">
                                  <div className="flex flex-col items-end">
                                    <div className="flex rounded-2xl bg-opacity-[0.85] bg-linear-color px-4 py-2">
                                      <div className={classNames(overlayMode === 'slide-over' ? '' : 'lg:prose-base', 'prose prose-sm prose-slate text-white prose-p:my-0 prose-thead:whitespace-nowrap')}>
                                        {item.content && typeof item.content === 'string' && item.content.split('\n').map((p: string, index: number) => <p key={index}>{p}</p>)}
                                      </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-end space-x-4 text-sm">
                                      <span className="text-gray-500">{timeSince(item.createdAt, i18n)}</span>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <DefaultAvatar />
                                  </div>
                                </div>
                              </>
                            )}
                          </li>
                          {previousTalks.length > 0 && index - 1 === previousTalks.length - 1 && <Divider className="top-2" text={i18n.newConversation} />}
                        </Fragment>
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
                              <span className="font-medium text-gray-900">{agentName}</span>
                            </div>
                            <div className="mt-2 flex w-fit flex-col rounded-2xl bg-gray-100 px-4 py-2 text-gray-700">
                              <div
                                className={classNames(
                                  overlayMode === 'slide-over' ? '' : 'lg:prose-base',
                                  'prose prose-sm prose-slate prose-blockquote:hidden prose-pre:whitespace-pre-line prose-thead:whitespace-pre-line prose-td:break-all',
                                )}
                              >
                                <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                                  {latestReplyContentState + (isWriting && !latestReplyContentState.includes('<') ? caretHtml : '')}
                                </ReactMarkdown>

                                {!isWriting && (
                                  <>
                                    {getMermaidCodes(latestReplyContentState).map((code: string, index: number) => (
                                      <MermaidChart key={index} code={code} index={index} />
                                    ))}
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 flex items-center space-x-4 text-sm">
                              <span className="text-gray-500">{timeSince(new Date().getTime(), i18n)}</span>
                              <span className="text-gray-500">&middot;</span>
                              <button
                                className="flex"
                                onClick={() => {
                                  navigator.clipboard.writeText(latestReplyContentState)
                                  setCurrentCopiedIndexState(65535)
                                }}
                              >
                                <Clipboard className="h-9 w-9 stroke-gray-600" isCopied={currentCopiedIndexState === 65535} />
                              </button>
                              {tongue && (
                                <>
                                  {latestWhisper.uuid && !isWriting && (
                                    <AudioPlayer isAutoplay={!!isAudioAutoPlay} whisperUuid={latestWhisper.uuid} nowPlayingWhisperUuidState={nowPlayingWhisperUuidState} setNowPlayingWhisperUuidState={setNowPlayingWhisperUuidState} />
                                  )}
                                </>
                              )}
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
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-linear-color opacity-50"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-linear-color opacity-70"></span>
                              </span>
                            </div>
                          </div>
                          <div className="flex w-full max-w-xs flex-col">
                            <div className="flex items-baseline space-x-1 text-sm">
                              <span className="font-medium text-gray-900">{agentName}</span>
                              <span className="text-xs text-gray-500">{i18n.isThinking}...</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-700">
                              <PulseSpinner />
                            </div>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                }
              </div>
              <div className="mt-4 bg-gray-100 px-4 py-6 sm:px-6">
                <div className="flex flex-col space-y-3">
                  {isShowPanel && (
                    <div className="flex flex-col space-y-3">
                      <ul role="list" className="max-h-[247px] flex-col divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200 bg-white">
                        {references &&
                          references
                            .sort((a: any, b: any) => (a.updatedAt > b.updatedAt ? 1 : -1))
                            .map((item: any, index: number) => (
                              <li key={index} className="flex items-center justify-between px-4 py-3 text-sm leading-6">
                                <div className="mr-3.5 flex w-0 flex-1 items-center">
                                  <div className="flex min-w-0 flex-1 justify-between gap-2">
                                    <span className="truncate">{item.title}</span>
                                    {item.hasCompleted ? (
                                      <span className="flex-shrink-0 text-gray-400">
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{i18n.completed}</span>
                                      </span>
                                    ) : (
                                      <span className="flex flex-shrink-0 items-center text-gray-400">
                                        {isLoadingSectionIndex === index && <Spinner className="mr-2 !h-4 !w-4 text-gray-400" />}
                                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">{i18n.trainingIncomplete}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  {item.hasCompleted ? (
                                    <button onClick={() => add(item)} className="-mx-1 -my-2.5 block px-1 py-2.5 pr-3.5 text-gray-500 hover:text-gray-900" title={i18n.add}>
                                      <PlusCircleIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                  ) : (
                                    <button onClick={() => training({ code: item.code, index })} className="-mx-1 -my-2.5 block px-1 py-2.5 pr-3.5 text-gray-500 hover:text-gray-900" title={i18n.training}>
                                      <FireIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                  )}
                                  <button onClick={() => doDelete(item.code)} className="-mx-1 -my-2.5 block px-1 py-2.5 text-gray-500 hover:text-gray-900" title={i18n.delete}>
                                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                  </button>
                                </div>
                              </li>
                            ))}

                        {newFile && (
                          <li key={newFile.title} className="flex items-center justify-between space-x-1 px-4 py-3 text-sm leading-6">
                            <div className="flex w-0 flex-1 items-center">
                              <div className="flex min-w-0 flex-1 justify-between gap-2">
                                <span className="truncate">{newFile.title}</span>
                              </div>
                            </div>
                            {isLoadingUpload ? (
                              <Spinner className="mr-2 !h-4 !w-4 text-gray-400" />
                            ) : (
                              <button onClick={() => upload(newFile)} className="flex items-center pl-1 font-medium text-indigo-600 hover:text-indigo-500">
                                {i18n.upload}
                              </button>
                            )}
                          </li>
                        )}
                        <li className="flex items-center space-x-4 py-3 pl-4 pr-5 text-sm leading-6">
                          <label htmlFor="file" className="flex cursor-pointer items-center space-x-2 text-sm font-medium leading-6 text-indigo-600 hover:text-indigo-500">
                            <span>+ {i18n.addNewFile}</span>
                            <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            <input id="file" type="file" accept=".pdf" className="sr-only invisible" tabIndex={-1} onChange={(e: any) => addFile(e.target.files[0])} />
                          </label>
                          <span className="text-xs">{i18n.fileUpTo}</span>
                        </li>
                      </ul>
                      <div className="flex-wrap items-baseline space-y-2">
                        {selectedReferences.map((item: any, index: number) => (
                          <span key={index} className="mr-2 inline-flex items-center gap-x-0.5 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-700">
                            {item.title}
                            <button type="button" onClick={() => remove(item.code)} className="group relative -mr-1 h-4 w-4 rounded-sm hover:bg-blue-600/20">
                              <svg viewBox="0 0 14 14" className="h-4 w-4 stroke-blue-800/50 group-hover:stroke-blue-800/75">
                                <path d="M4 4l6 6m0-6l-6 6" />
                              </svg>
                              <span className="absolute -inset-1" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1">
                    {isSpeakingMode && (
                      <SoundWave
                        onFinish={(data: any) => {
                          fetchWhispersAndReply(data)
                          updateReplies()
                        }}
                        chatMode={chatMode}
                        close={() => setIsSpeakingMode(false)}
                      />
                    )}
                    {!isSpeakingMode && (
                      <div className="relative w-full">
                        <form onSubmit={handleSubmit(send)} className="flex space-x-3">
                          <div className="relative flex min-h-[40px] flex-1">
                            {sectionType && (
                              <>
                                {isShowPanel ? (
                                  <button type="button" onClick={() => setIsShowPanel(false)} className="absolute left-0.5 rounded-full p-2 text-gray-500 hover:text-gray-400">
                                    <MinusCircleIcon className="h-6 w-6" aria-hidden="true" />
                                  </button>
                                ) : (
                                  <button type="button" onClick={() => setIsShowPanel(true)} className="absolute left-0.5 rounded-full p-2 text-gray-500 hover:text-gray-400">
                                    <PlusCircleIcon className="h-6 w-6" aria-hidden="true" />
                                  </button>
                                )}
                              </>
                            )}

                            <textarea
                              defaultValue={''}
                              rows={contentBreakCount + 1}
                              {...register('content')}
                              onKeyDown={(e) => {
                                if (isImeComposing || e.key === 'Escape') {
                                  e.stopPropagation()
                                  return
                                }

                                if (e.key === 'Enter') {
                                  if (shouldShowDisclaimer()) {
                                    showDisclaimer(e)
                                  } else if (!e.shiftKey) {
                                    handleSubmit(send)()
                                  }
                                }
                              }}
                              onCompositionStart={() => setIsImeComposing(true)}
                              onCompositionEnd={() => setIsImeComposing(false)}
                              className={classNames(
                                sectionType ? 'pl-10' : '',
                                'block w-full resize-none rounded-md border-0 py-1.5 pr-10 text-sm leading-7 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-[1.25px]',
                              )}
                            />
                            <button type="button" onClick={useSpeakingMode} className="absolute right-1 rounded-full p-2 text-primary-color opacity-100 hover:opacity-90">
                              <MicrophoneIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                          <div className="flex h-10">
                            {isShowSend ? (
                              <>
                                {shouldShowDisclaimer() ? (
                                  <button type="button" onClick={showDisclaimer} className="btn btn-primary h-full w-fit min-w-[80px]" tabIndex={1}>
                                    <span>{i18n.send}</span>
                                  </button>
                                ) : (
                                  <button type="submit" className="btn btn-primary h-full w-fit min-w-[80px]">
                                    {isLoading && <Spinner className="mr-2 text-gray-400" />}
                                    <span>{i18n.send}</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {!isConversationUuidAsParam && !isConversationFull() && (
                                  <>
                                    {isUseEmbedding || (prompt && !prompt.user) ? (
                                      <button onClick={newChat} className="btn btn-secondary h-full w-fit min-w-[80px]">
                                        <PlusIcon className="mr-1 h-5 w-5 text-gray-500" />
                                        {i18n.newChat}
                                      </button>
                                    ) : (
                                      <Menu as="div" className="relative inline-block h-full text-left">
                                        <Menu.Button className="btn btn-secondary flex h-full w-fit min-w-[80px] gap-x-1.5 font-normal">
                                          <div className="flex">
                                            {chatMode === 'task' && (
                                              <>
                                                <CheckCircleIcon className="mr-2 h-5 w-5 text-green-400" />
                                                {i18n.taskMode}
                                              </>
                                            )}
                                            {chatMode === 'chat' && (
                                              <>
                                                <ChatBubbleBottomCenterTextIcon className="mr-2 h-5 w-5 text-primary-color" />
                                                {i18n.chatMode}
                                              </>
                                            )}
                                          </div>
                                          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" />
                                        </Menu.Button>

                                        <Transition
                                          as={Fragment}
                                          enter="transition ease-out duration-100"
                                          enterFrom="transform opacity-0 scale-95"
                                          enterTo="transform opacity-100 scale-100"
                                          leave="transition ease-in duration-75"
                                          leaveFrom="transform opacity-100 scale-100"
                                          leaveTo="transform opacity-0 scale-95"
                                        >
                                          <Menu.Items className="absolute bottom-full right-0 z-10 mb-2 w-fit origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="py-1">
                                              <Menu.Item>
                                                {({ active }) => (
                                                  <button
                                                    onClick={() => setChatMode('chat')}
                                                    className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex w-full items-center whitespace-nowrap px-4 py-2 text-sm')}
                                                  >
                                                    <ChatBubbleBottomCenterTextIcon className="mr-3 h-5 w-5 text-primary-color" />
                                                    {i18n.chatMode}
                                                  </button>
                                                )}
                                              </Menu.Item>
                                              <Menu.Item>
                                                {({ active }) => (
                                                  <button
                                                    onClick={() => setChatMode('task')}
                                                    className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex w-full items-center whitespace-nowrap px-4 py-2 text-sm')}
                                                  >
                                                    <CheckCircleIcon className="mr-3 h-5 w-5 text-green-400" />
                                                    {i18n.taskMode}
                                                  </button>
                                                )}
                                              </Menu.Item>
                                            </div>
                                            <div className="py-1">
                                              <Menu.Item>
                                                {({ active }) => (
                                                  <button onClick={newChat} className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex w-full items-center whitespace-nowrap px-4 py-2 text-sm')}>
                                                    <PlusIcon className="mr-3 h-5 w-5 text-gray-500" />
                                                    {i18n.newChat}
                                                  </button>
                                                )}
                                              </Menu.Item>
                                            </div>
                                          </Menu.Items>
                                        </Transition>
                                      </Menu>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </form>
                        {questions && questions.length > 0 && (
                          <div className="my-2 max-h-[156px] overflow-y-auto">
                            <div className="flex flex-wrap gap-x-3 gap-y-4 pt-4">
                              {questions.map((item: any, index: number) => (
                                <button key={index} type="button" className="rounded-full bg-gray-200 px-4 py-2 text-left text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:opacity-80" onClick={onSelectQuestion}>
                                  {item}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      <Transition.Root show={isShowClaim} as={Fragment}>
        <Dialog as="div" id="react-chatgpt" className="relative z-50" onClose={setIsShowClaim}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        {i18n.disclaimer}
                      </Dialog.Title>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-500">{disclaimer}</p>
                        <a href={disclaimerPath} target="_blank" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                          {i18n.readFullDisclaimer}
                        </a>
                        <p className="text-sm text-gray-500">{i18n.clickButtonToAgree}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          agree()
                        }
                      }}
                      onClick={agree}
                    >
                      {i18n.agree}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setIsShowClaim(false)}
                    >
                      {i18n.disagree}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
