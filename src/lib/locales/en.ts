import { transformI18n } from '.'

export const messages = {
  aiAgent: 'AI Agent',
  intro: 'Intro',
  send: 'Send',
  done: 'Done',
  cancel: 'Cancel',
  isThinking: 'is thinking',
  justNow: 'Just now',
  yearAgo: '${0} years ago',
  monthsAgo: '${0} months ago',
  daysAgo: '${0} days ago',
  hoursAgo: '${0} hours ago',
  minutesAgo: '${0} minutes ago',
  secondsAgo: '${0} seconds ago',
  newConversation: 'New conversation',
  disclaimer: 'Disclaimer',
  agree: 'Agree',
  disagree: 'Disagree',
  readFullDisclaimer: 'Read full disclaimer',
  clickButtonToAgree: 'Click the "Agree" button to indicate that you have read and agree to the above disclaimer.',
  newChat: 'New Chat',
  taskMode: 'Task Mode',
  chatMode: 'Chat Mode',
}

export const i18n = transformI18n(messages)
