import { nanoid } from 'nanoid/non-secure'

import { localStorageEnhanced } from './local-storage-enhanced'

const oneDay = 24 * 60 * 60 * 1000
const oneWeek = 7 * oneDay

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

export const timeSince = (date: number, i18n: any) => {
  date = date.toString().length === 13 ? date / 1000 : date
  const seconds = Math.floor(new Date().getTime() / 1000 - date)

  let interval = seconds / 31536000

  if (interval > 1) {
    return i18n.yearsAgo(Math.floor(interval))
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return i18n.monthsAgo(Math.floor(interval))
  }
  interval = seconds / 86400
  if (interval > 1) {
    return i18n.daysAgo(Math.floor(interval))
  }
  interval = seconds / 3600
  if (interval > 1) {
    return i18n.hoursAgo(Math.floor(interval))
  }
  interval = seconds / 60
  if (interval > 1) {
    return i18n.minutesAgo(Math.floor(interval))
  }
  return seconds <= 20 ? i18n.justNow : i18n.secondsAgo(Math.floor(seconds))
}

export const getOrCreateUserUuid = () => {
  let userUuid = localStorageEnhanced.getWithExpiry('react-chatgpt-userUuid') || ''

  if (!userUuid) {
    userUuid = `${nanoid()}-${getIdentifier()}`
    localStorageEnhanced.setWithExpiry('react-chatgpt-userUuid', userUuid, oneWeek)
  }

  return userUuid
}

export const getIdentifier = () => localStorageEnhanced.getItem('react-chatgpt-identifier') || ''
export const setIdentifier = (value: string) => localStorageEnhanced.setItem('react-chatgpt-identifier', value)

export const getConfig = () => localStorageEnhanced.getItem('react-chatgpt-configuration') || ''
export const setConfig = (value: string) => localStorageEnhanced.setItem('react-chatgpt-configuration', value)
export const removeConfig = () => localStorageEnhanced.removeItem('react-chatgpt-configuration')

export const setLang = (value: string) => localStorageEnhanced.setItem('react-chatgpt-lang', value)
export const getLang = () => localStorageEnhanced.getItem('react-chatgpt-lang') || ''

export const setAgreement = (value: string) => localStorageEnhanced.setWithExpiry('react-chatgpt-agreement', value, oneDay)
export const getAgreement = () => localStorageEnhanced.getWithExpiry('react-chatgpt-agreement') || ''
