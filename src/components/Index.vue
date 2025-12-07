<template>
  <el-container class="layout-container" style="height: 100vh">

    <!-- 左侧侧边栏 -->
    <el-aside width="200px" style="background-color: #304156">
      <div style="height: 60px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">
        <span style="margin-left: 5px;">WMS 仓库系统</span>
      </div>

      <el-menu
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :default-active="$route.path"
        router
        style="border-right: none"
      >
        <el-menu-item index="/Index/home"><el-icon><House /></el-icon><span>系统首页</span></el-menu-item>
        <el-menu-item index="/Index/goods"><el-icon><Goods /></el-icon><span>物品管理</span></el-menu-item>
        <el-menu-item index="/Index/user"><el-icon><User /></el-icon><span>用户管理</span></el-menu-item>
        <el-menu-item index="/Index/record"><el-icon><List /></el-icon><span>出入库记录</span></el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主体 -->
    <el-container>
      <el-header style="text-align: right; font-size: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); z-index: 10; ; line-height: 60px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 18px; cursor: pointer;"></div>

        <div style="display: flex; align-items: center;">
          <!-- ↓↓↓↓↓↓↓↓↓↓ 插入这段代码 ↓↓↓↓↓↓↓↓↓↓ -->
          <el-tag
            v-if="user.roleid === 0 || user.roleid === 1"
            type="danger"
            effect="dark"
            size="small"
            style="margin-right: 10px;">
            管理员
          </el-tag>
          <el-tag
            v-else
            type="info"
            effect="plain"
            size="small"
            style="margin-right: 10px;">
            普通用户
          </el-tag>
          <!-- ↑↑↑↑↑↑↑↑↑↑ 插入这段代码 ↑↑↑↑↑↑↑↑↑↑ -->
          <!-- 这里的头像会跟随 user.avatar 变化 -->
          <el-avatar
            :size="30"
            :src="user.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"
            style="margin-right: 10px;"
          />

          <el-dropdown>
            <span class="el-dropdown-link" style="cursor: pointer; display: flex; align-items: center; font-size: 16px;">
              {{ user.name }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openPersonInfo">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main style="background-color: #f0f2f5;">
        <router-view />
      </el-main>
    </el-container>

    <!-- ============ 修改个人信息弹窗 ============ -->
    <el-dialog v-model="centerDialogVisible" title="修改个人信息" width="30%" center>
      <el-form :model="form" label-width="80px">

        <el-form-item label="账号">
          <el-input v-model="form.no" disabled></el-input>
        </el-form-item>

        <el-form-item label="姓名">
          <el-input v-model="form.name"></el-input>
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="不修改请留空"></el-input>
        </el-form-item>

        <el-form-item label="头像">
          <!-- 上传代码 -->
          <el-upload
               class="avatar-uploader"
    action="/user/uploadAvatar"
    name="file"
    :data="{ userId: form.id }"
    :show-file-list="false"
    :on-success="handleAvatarSuccess"
          >
            <img v-if="form.avatar" :src="form.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUserInfo">保存修改</el-button>
        </span>
      </template>
    </el-dialog>

  </el-container>
</template>

<script setup>
import { House, Goods, User, List, ArrowDown, Plus } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 获取当前用户
const user = reactive(JSON.parse(sessionStorage.getItem('user') || '{}'))

// 弹窗控制
const centerDialogVisible = ref(false)
const form = reactive({
  id: '',
  no: '',
  name: '',
  password: '',
  avatar: ''
})

// 打开弹窗回显数据
const openPersonInfo = () => {
  centerDialogVisible.value = true
  form.id = user.id
  form.no = user.no
  form.name = user.name
  form.password = user.password
  form.avatar = user.avatar
}

// 头像上传成功后的回调
const handleAvatarSuccess = (res) => {
  if (res.code === 200) {
    form.avatar = res.data
  } else {
    ElMessage.error('上传失败')
  }
}

// 保存修改
// src/components/Index.vue

// 保存修改
const saveUserInfo = async () => {
  try {
    // 🚩 【核心修改】：这里原来是 /user/save，必须改成 /user/mod
    // 因为 /save 是新增，/mod 才是修改
    const res = await axios.post('/user/mod', form)

    if (res.data.code === 200) {
      ElMessage.success('修改成功')

      // 更新 SessionStorage 里的缓存，不然刷新页面又变回去了
      // 把 form 里的新数据覆盖到 user 对象里
      user.name = form.name
      user.avatar = form.avatar

      // 如果改了密码，也更新一下（虽然通常不建议前端存密码，但这里保持一致）
      if (form.password) {
         user.password = form.password
      }

      sessionStorage.setItem('user', JSON.stringify(user))

      centerDialogVisible.value = false
    } else {
      ElMessage.error(res.data.msg || '修改失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('系统错误')
  }
}
const logout = () => {
  sessionStorage.removeItem('user')
  router.push('/')
}
</script>

<style scoped>
.layout-container { height: 100%; }
.el-menu { border-right: none; }
.el-dropdown-link:hover { color: #409EFF; }

/* ⬇️⬇️⬇️ 补全了你丢失的样式部分 ⬇️⬇️⬇️ */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  border: 1px dashed #ccc;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
