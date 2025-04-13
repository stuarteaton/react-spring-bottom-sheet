import { VCodeBlock } from '@wdns/vue-code-block'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VCodeBlock', VCodeBlock)
})
