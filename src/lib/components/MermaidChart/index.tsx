import mermaid from 'mermaid'
import { useEffect } from 'react'

mermaid.initialize({
  startOnLoad: true,
})

const Mermaid = ({ code }: any) => {
  useEffect(() => {
    mermaid.contentLoaded()
  }, [])

  return <div className="mermaid">{code}</div>
}

export default Mermaid
