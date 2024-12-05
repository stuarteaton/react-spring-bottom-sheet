import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { GesturePlugin } from '@vueuse/gesture'
import { MotionPlugin } from '@vueuse/motion'

const app = createApp(App)

app.use(GesturePlugin).use(MotionPlugin)

app.mount('#app')
