import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment, useCallback, useMemo } from 'react'

import { removeConfig, setIdentifier } from '../../utils'
import Conversation from '../Conversation'

export default function Index({ status, setStatus, identifier }: any) {
  if (status && identifier) {
    removeConfig()
    setIdentifier(identifier)
  }

  const close = useCallback(() => {
    setStatus('')
  }, [setStatus])

  const isShow = useMemo(() => {
    return !!identifier && !!status
  }, [identifier, status])

  return (
    <Transition.Root show={isShow} as={Fragment}>
      <Dialog as="div" id="react-chatgpt" className="relative z-10" onClose={close}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
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
                  <div className="flex h-full flex-col divide-y divide-gray-200 overflow-y-scroll bg-white pt-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">Conversation</Dialog.Title>
                        <div className="ml-3 flex h-6 items-center">
                          <button type="button" className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" onClick={close}>
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1">
                      <Conversation />
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
