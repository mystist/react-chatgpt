import { Dialog, Transition } from '@headlessui/react'
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment, useCallback } from 'react'

import { classNames } from '../../utils'
import Conversation from '../Conversation'

export default function Index({ isShow, i18n, close, overlayMode }: any) {
  const onClose = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return close ? close() : (() => {})()
  }, [close])

  return (
    <Transition.Root show={isShow} as={Fragment}>
      <Dialog as="div" id="react-chatgpt" onClose={onClose} style={{ position: 'relative', zIndex: 50 }}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-200 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className={classNames(close ? 'm-8' : '', 'flex min-h-full items-end justify-center text-center sm:items-center')}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={classNames(close ? 'max-w-6xl' : '', 'w-full transform overflow-hidden rounded-lg bg-gray-50 text-left shadow-xl transition-all')}>
                <div className="sm:flex sm:items-start">
                  <div className="mx-6 flex w-full items-center justify-between pb-5 pt-6 text-center">
                    <Dialog.Title className="flex items-center space-x-3 font-medium leading-6 text-gray-700">
                      <ChatBubbleLeftEllipsisIcon className="h-[26px] w-[23px]" />
                      <span>{i18n.aiAgent}</span>
                    </Dialog.Title>
                    {close && (
                      <button type="button" className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" onClick={onClose}>
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Conversation overlayMode={overlayMode} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
