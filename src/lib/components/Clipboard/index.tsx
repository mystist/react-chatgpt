import { classNames } from '../../utils'

export default function Clipboard({ className = '', isCopied }: { className?: string; isCopied: boolean }) {
  return (
    <>
      <svg
        className={classNames(isCopied ? 'rotate-[-8deg] stroke-primary-color' : 'stroke-[#06B6D4]', `stroke-[1.3] ${className}`)}
        fill="none"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        strokeWidth="current"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
          strokeWidth="current"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
          strokeWidth="current"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path d="M13.7475 16.2499L18.2475 16.2499" strokeWidth="current" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M13.7475 19.2499L18.2475 19.2499" strokeWidth="current" strokeLinecap="round" strokeLinejoin="round"></path>
        <g className={classNames(isCopied ? 'opacity-100' : 'opacity-0')}>
          <path d="M15.9975 5.99988L15.9975 3.99988" strokeWidth="current" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M19.9975 5.99988L20.9975 4.99988" strokeWidth="current" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M11.9975 5.99988L10.9975 4.99988" strokeWidth="current" strokeLinecap="round" strokeLinejoin="round"></path>
        </g>
      </svg>
    </>
  )
}
