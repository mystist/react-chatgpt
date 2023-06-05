import { useCallback } from 'react'

export default function Index() {
  const onClick = useCallback(() => {
    console.log('Hello react-chatgpt')
  }, [])

  return (
    <>
      <button
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={onClick}
      >
        Greeting
      </button>
    </>
  )
}
