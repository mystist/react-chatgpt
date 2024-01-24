import { nanoid } from 'nanoid/non-secure'

import { localStorageEnhanced, sessionStorageEnhanced } from './storage-enhanced'

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

const getUserUuidKey = () => `react-chatgpt-userUuid`

export const getUserUuid = () => {
  const key = getUserUuidKey()

  return localStorageEnhanced.getWithExpiry(key) || ''
}

export const getOrCreateUserUuid = () => {
  let userUuid = getUserUuid()

  if (!userUuid) {
    userUuid = nanoid()
    setUserUuid(userUuid, oneWeek)
  }

  return userUuid
}

export const setUserUuid = (userUuid: string, duration = oneDay) => {
  const key = getUserUuidKey()

  localStorageEnhanced.setWithExpiry(key, userUuid, duration)
}

export const setIdentifier = (value: string) => sessionStorageEnhanced.setItem('react-chatgpt-identifier', value)
export const getIdentifier = () => sessionStorageEnhanced.getItem('react-chatgpt-identifier') || ''
export const removeIdentifier = () => sessionStorageEnhanced.removeItem('react-chatgpt-identifier')

export const setConfig = (value: string) => sessionStorageEnhanced.setItem('react-chatgpt-configuration', value)
export const getConfig = () => sessionStorageEnhanced.getItem('react-chatgpt-configuration') || ''
export const removeConfig = () => sessionStorageEnhanced.removeItem('react-chatgpt-configuration')

export const setLang = (value: string) => sessionStorageEnhanced.setItem('react-chatgpt-lang', value)
export const getLang = () => sessionStorageEnhanced.getItem('react-chatgpt-lang') || ''
export const removeLang = () => sessionStorageEnhanced.removeItem('react-chatgpt-lang')

export const setAgreement = (value: string) => localStorageEnhanced.setWithExpiry('react-chatgpt-agreement', value, oneDay)
export const getAgreement = () => localStorageEnhanced.getWithExpiry('react-chatgpt-agreement') || ''

export const setConversationUuid = (value: string) => sessionStorageEnhanced.setItem('react-chatgpt-conversation', value)
export const getConversationUuid = () => sessionStorageEnhanced.getItem('react-chatgpt-conversation') || ''
export const removeConversationUuid = () => sessionStorageEnhanced.removeItem('react-chatgpt-conversation')

export const isValidSite = (str: string) => {
  return /[a-zA-Z]{1}\.[a-zA-Z]{2}/.test(str)
}

export const replaceOrAppendSitePrefix = (content: string, siteVal: string) => {
  const pattern = /\/site:[^\s]+/
  const regex = new RegExp(pattern)
  const prefix = `/site:${siteVal}`

  if (regex.test(content)) {
    return content.replace(regex, prefix)
  } else {
    return `${prefix} ${content}`
  }
}

export const removeSitePrefix = (content: string) => {
  const pattern = /\/site:[^\s]+/
  const regex = new RegExp(pattern)

  return content.replace(regex, '').trim()
}
