/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */

import { sharedConfig } from './tailwind.config.lib'

export default {
  ...sharedConfig,
  plugins: [require('@tailwindcss/forms')(), require('@tailwindcss/typography')],
}
