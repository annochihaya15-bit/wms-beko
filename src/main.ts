import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 如果你需要中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 图标库
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 【关键点 1】引入你写好的路由配置
import router from './router'
import axios from 'axios'
// 👇👇👇 2. 加上这一行！这是告诉浏览器：每次发请求都要带着“身份证”(Cookie)
axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://localhost:8080'
const app = createApp(App)

// 【关键点 2】注册图标（防止图标不显示）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 【关键点 3】告诉 Vue 使用路由！如果没有这一行，就会报你那个错
app.use(router)

app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
