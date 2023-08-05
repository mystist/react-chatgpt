import { transformI18n } from '.'

export const messages = {
  aiAgent: '智能助理',
  intro: '介绍',
  send: '发送',
  done: '完成',
  cancel: '取消',
  isThinking: '正在思考',
  justNow: '刚刚',
  yearAgo: '${0} 年前',
  monthsAgo: '${0} 个月前',
  daysAgo: '${0} 天前',
  hoursAgo: '${0} 小时前',
  minutesAgo: '${0} 分钟前',
  secondsAgo: '${0} 秒前',
  newConversation: '新对话',
  disclaimer: '免责申明',
  agree: '同意',
  disagree: '不同意',
  readFullDisclaimer: '阅读完整的免责申明',
  clickButtonToAgree: '点击“同意”按钮，表示您已知情并同意以上免责申明。',
  newChat: '新对话',
}

export const i18n = transformI18n(messages)
