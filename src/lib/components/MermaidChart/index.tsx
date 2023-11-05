import mermaid from 'mermaid'
import { useEffect } from 'react'

const Mermaid = ({ code, index = 0 }: any) => {
  useEffect(() => {
    setTimeout(() => {
      if (index === 0) {
        mermaid.initialize({
          startOnLoad: true,
        })
        mermaid.contentLoaded()
      }
    }, 500)
  }, [index])

  return <div className="mermaid">{code}</div>
}

export default Mermaid
