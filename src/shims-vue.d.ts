declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
  declare interface User {
  id: number
  name: string
  age: number
  sex: 0 | 1
  phone: string
  avatar: string
  role: 'admin' | 'user'  // 新增：角色（管理员/普通用户）
  }
