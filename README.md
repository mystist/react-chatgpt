# [react-chatgpt](https://github.com/mystist/react-chatgpt)

Embedding your chatgpt agent into your react application, option in tailwindcss, from development to release, all in this react-chatgpt project.

## Features

- **Component library development starter:** You can simply use this project as a starter for developing modern react + tailwindcss npm libraries. The project uses tailwindcss and effectively isolates the styles of the library, allowing it to be seamlessly used in both react or react + tailwindcss projects.
- **Fancy and customizable UI:** Elevate the appearance and experience of your agent by utilizing the tailwindcss framework, which can be easily customized to suit your preferences.
- **Universal chatgpt agent:** With its versatile design, you can create agents for any purpose by align with your api implementation.
- **Keep context:** Keep the full rounds of context.
- **Infinite conversation:** Start new conversation automatically when reach rate limit.
- **Out of the box:** Built in i18n support, built in disclaimer support, ready to use out of the box.
- **Voice interaction:** Supports voice input and output, and voice also supports multiple languages.
- **Responsive:** Optimized for various screen sizes and adapt automatically.
- **Chart support:** Chart support with [Mermaid](https://mermaid.js.org/).

## Quick start

```sh
yarn add @mystist/react-chatgpt
```

For react project:

```tsx
import '@mystist/react-chatgpt/dist/style.css'

import { ReactChatGPT } from '@mystist/react-chatgpt'
```

For nextjs project:

```tsx
import '@mystist/react-chatgpt/dist/style.css'

import dynamic from 'next/dynamic'

export const ReactChatGPT = dynamic(() => import('@mystist/react-chatgpt').then((module) => module.ReactChatGPT as any), { ssr: false })
```

Render chat with self controlled component, you can controll the open/closed status by yourself

Sample:
`./components/Agent/index.tsx`

```tsx
import '@mystist/react-chatgpt/dist/style.css'

import dynamic from 'next/dynamic'
import { useState } from 'react'

export const ReactChatGPT = dynamic(() => import('@mystist/react-chatgpt').then((module) => module.ReactChatGPT as any), { ssr: false })

const DefaultAvatar = () => (
  <span className="inline-block h-full w-full overflow-hidden rounded-full bg-gray-100">
    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  </span>
)

export default function Index() {
  const [status, setStatus] = useState('')

  const identifier = '<your identifier>'
  const lang = 'en'

  return (
    <>
      <button onClick={() => setStatus('open')}>
        <div className="relative h-16 w-16">
          <DefaultAvatar />
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
        </div>
      </button>

      {/* @ts-ignore */}
      {identifier && <ReactChatGPT status={status} setStatus={setStatus} identifier={identifier} lang={lang} />}
    </>
  )
}
```

Start chat with avatar automatically
```tsx

<ReactChatGPT mode="auto" identifier={identifier} lang={lang} />
```

## Options

- `mode`<''(default) | 'auto'>: The usage mode for react chat.
  - `auto`: mode will render the chat with avatar and controlled the open/closed status automatically
  - without mode, you can controll the status by your self.
- `status`<'' | 'open'>: The React state represent the opening of the ReactChatGPT component.
- `setStatus`: The React state set function controls the opening of the ReactChatGPT component.
- `identifier`: To retrieve the specified data from the API endpoint with this identifier param.
- `lang`: Specify the language, such as 'en' for English, 'zh' for Chinese, and 'ja' for Japanese.
- `overlayMode`<'auto'(default) | 'modal' | 'slide-over'>: Specify the overlay mode. The default is 'auto', which will use 'modal' for large screens and 'slide-over' for smaller screens.

## API dependencies

Checkout `src/lib/requests/index.tsx` for the api dependencies.

Be aware that the Configuration api is the basic api to have react-chatgpt up and running:
`api/configuration?identifier=<your identifier>&lang=<your lang>`
It should return a Configuration object specs here: `src/lib/interfaces/index.tsx`

## Development

```sh
yarn
```

```sh
yarn dev
```

## Release

```sh
yarn release
```
