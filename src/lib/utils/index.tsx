import { nanoid } from 'nanoid/non-secure'

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

export const getIdentifier = () => localStorage.getItem('identifier') || ''

export const getOrCreateUserUuid = () => {
  let userUuid = localStorage.getItem('userUuid') || ''

  if (!userUuid) {
    userUuid = nanoid()
    localStorage.setItem('userUuid', userUuid)
  }

  return userUuid
}
