const setWithExpiry = (key: string, value: any, ttl: number) => {
  const now = new Date()

  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

const getWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key)

  if (!itemStr) return

  try {
    const item = JSON.parse(itemStr)
    const now = new Date()

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return item.value
  } catch (error) {
    return
  }
}

const getItem = (key: string) => localStorage.getItem(key)
const setItem = (key: string, value: string) => localStorage.setItem(key, value)
const removeItem = (key: string) => localStorage.removeItem(key)

const localStorageEnhanced = { getWithExpiry, setWithExpiry, getItem, setItem, removeItem }

export { localStorageEnhanced }
