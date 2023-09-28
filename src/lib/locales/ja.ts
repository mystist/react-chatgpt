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
  disclaimer: '免責申し立てます',
  agree: 'Agree',
  disagree: 'Disagree',
  readFullDisclaimer: 'Read full disclaimer',
  clickButtonToAgree: 'Click the "Agree" button to indicate that you have read and agree to the above disclaimer.',
  newChat: '新しい対話',
  taskMode: 'タスクモード',
  chatMode: 'チャットモード',
  fileUpTo: '30MBまでPDFファイルを受け付けます',
  addNewFile: '新しいファイルを追加します',
  trainingIncomplete: '訓練は未完成です',
  completed: '完成です',
  add: '追加します',
  training: '訓練します',
  delete: '削除します',
  upload: 'アップロードします',
  holdToSpeak: 'おさえて話します',
  slideUpToCancel: 'スライドアップキャンセルです'
}

export const i18n = transformI18n(messages)
