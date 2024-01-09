import { Dialog, Transition } from '@headlessui/react'
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment, useCallback } from 'react'

import Conversation from '../Conversation'

export default function Index({ isShow, i18n, close, overlayMode }: any) {
  const onClose = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return close ? close() : (() => {})()
  }, [close])

  return (
    <Transition.Root show={isShow} as={Fragment}>
      <Dialog as="div" id="react-chatgpt" onClose={onClose} style={{ position: 'relative', zIndex: 50 }}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-lg">
                  <div className="flex h-full flex-col overflow-y-auto rounded-md bg-white shadow-xl">
                    <div className="bg-gray-100 px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="flex items-center space-x-3 font-medium leading-6 text-gray-700">
                          <ChatBubbleLeftEllipsisIcon className="h-[26px] w-[23px]" />
                          <span>{i18n.aiAgent}</span>
                        </Dialog.Title>

                        {close && (
                          <div className="ml-3 flex h-6 items-center">
                            <button type="button" className="rounded-md text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" onClick={onClose}>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Conversation overlayMode={overlayMode} />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
