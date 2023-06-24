import { transformI18n } from '.'

export const messages = {
  aiAgent: 'スマートアシスタント',
  intro: '紹介',
  send: '送信',
  done: '完了',
  cancel: 'キャンセル',
  isThinking: '考え中です',
  justNow: 'ちょうど今',
  yearAgo: '${0} 年前',
  monthsAgo: '${0} ヶ月前',
  daysAgo: '${0} 日前',
  hoursAgo: '${0} 時間前',
  minutesAgo: '${0} 分前',
  secondsAgo: '${0} 秒前',
  newConversation: '新しい対話',
}

export const i18n = transformI18n(messages)
