const getItem = (key: string) => sessionStorage.getItem(key)
const setItem = (key: string, value: string) => sessionStorage.setItem(key, value)
const removeItem = (key: string) => sessionStorage.removeItem(key)

const sessionStorageEnhanced = { getItem, setItem, removeItem }

export { sessionStorageEnhanced }
