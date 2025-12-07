import { createRouter, createWebHistory } from 'vue-router'// 👇👇👇 1. 引入 NProgress 和它的样式
import Home from '../components/Home.vue'

// 👇👇👇 1. 引入 NProgress 进度条和样式
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 👇👇👇 2. 简单配置：把右上角那个转圈圈去掉，只留顶部的进度条
NProgress.configure({ showSpinner: false })
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../components/Login.vue'),
    },
    {
      path: '/Index',
      name: 'index',
      // 指向你的布局文件
      component: () => import('../components/Index.vue'),
      redirect: '/Index/home',  // 默认跳到首页
      children: [
         // ============ 新增的首页路由 ============
        {
          path: 'home',
          name: 'home',
          component: Home
        },
        // ======================================
        {
          path: 'goods',
          name: 'goods',
          component: () => import('../components/goods/GoodsManage.vue'),
        },

        {
          path: 'user',
          name: 'user',
          component: () => import('../components/user/UserManage.vue')
        },
        {
  path: 'record',
  name: 'record',
  component: () => import('../components/record/RecordManage.vue')
}
      ],
    },
  ],
})
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})
export default router
