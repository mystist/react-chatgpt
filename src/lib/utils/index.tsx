import { nanoid } from 'nanoid/non-secure'

import { localStorageEnhanced } from './local-storage-enhanced'

const oneDay = 24 * 60 * 60 * 1000

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

export const timeSince = (date: number) => {
  date = date.toString().length === 13 ? date / 1000 : date
  const seconds = Math.floor(new Date().getTime() / 1000 - date)

  let interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + ' years ago'
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + ' months ago'
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + ' days ago'
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago'
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago'
  }
  return seconds <= 3 ? 'Just now' : Math.floor(seconds) + ' seconds ago'
}

export const getOrCreateUserUuid = () => {
  let userUuid = localStorageEnhanced.getWithExpiry('userUuid') || ''

  if (!userUuid) {
    userUuid = nanoid()
    localStorageEnhanced.setWithExpiry('userUuid', userUuid, oneDay)
  }

  return userUuid
}

export const getIdentifier = () => localStorageEnhanced.getItem('identifier') || ''
export const setIdentifier = (value: string) => localStorageEnhanced.setItem('identifier', value)

export const getConfig = () => localStorageEnhanced.getItem('configuration') || ''
export const setConfig = (value: string) => localStorageEnhanced.setItem('configuration', value)
export const removeConfig = () => localStorageEnhanced.removeItem('configuration')
