<template>
  <div class="login-container">

    <!-- 👇 核心修复：这个 div 必须包含 left 和 form 两个部分 -->
    <div class="login-box my-card">

      <!-- 左侧：蓝色背景区 -->
      <div class="login-left">
        <img src="https://element-plus.org/images/element-plus-logo.svg" alt="Logo" class="login-logo">
        <div class="login-title-big">WMS</div>
        <div class="login-desc">智慧仓储管理系统</div>
      </div>

      <!-- 右侧：表单区 -->
      <div class="login-form">
        <h2 class="form-title">欢迎登录</h2>
        <el-form :model="loginForm" size="large">
          <el-form-item>
            <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-button
            type="primary"
            :loading="isBtnLoading"
            @click="handleLogin"
            style="width: 100%; font-weight: bold;">
            {{ isBtnLoading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const isBtnLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  isBtnLoading.value = true
  try {
    const res = await axios.post('/user/login', loginForm)
    if (res.data.code === 200) {
      ElMessage.success('登录成功')
      sessionStorage.setItem('user', JSON.stringify(res.data.data))
      router.push('/Index')
    } else {
      ElMessage.error(res.data.msg || '登录失败')
    }
  } catch (error) {
    ElMessage.error('无法连接后端')
  } finally {
    isBtnLoading.value = false
  }
}
</script>

<style scoped>
/* 容器背景 */
.login-container {
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #2d3a4b 0%, #4b6cb7 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 核心盒子：Flex布局是关键 */
.login-box {
  width: 700px;
  height: 400px;
  background-color: #fff;
  border-radius: 12px; /* 圆角 */
  display: flex; /* 让左右两部分并排 */
  overflow: hidden; /* 防止圆角被内部元素遮挡 */
}

/* 这里的 my-card 样式如果 App.vue 没生效，这里补一个保险 */
.my-card {
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
  transition: all 0.3s;
}
.my-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.login-left {
  width: 40%;
  background: linear-gradient(to bottom, #4b6cb7, #182848);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.login-logo { width: 60px; margin-bottom: 20px; }
.login-title-big { font-size: 40px; font-weight: bold; letter-spacing: 5px; }
.login-desc { font-size: 14px; opacity: 0.8; margin-top: 10px; }

.login-form {
  width: 60%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-title { margin-bottom: 30px; color: #333; text-align: center; font-size: 24px; }
</style>
