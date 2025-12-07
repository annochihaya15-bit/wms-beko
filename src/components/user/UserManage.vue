<template>

  <div style="padding: 20px;">
    <!-- 搜索栏 -->      <el-card class="my-card" style="margin-bottom: 20px;">
      <div style="display: flex; gap: 10px;">

        <el-input v-model="name" placeholder="输入姓名搜索" style="width: 200px;" clearable @clear="loadData" />
        <el-button type="primary" icon="Search" @click="loadData">查询</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd" style="margin-left: auto;">新增用户</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
   <el-card class="my-card" style="margin-bottom: 20px;">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <!-- 【改动1】：这里加回了头像列 -->
        <el-table-column label="头像" width="100" align="center">
          <template #default="scope">
             <!-- 如果后端有avatar字段就显示，没有就显示默认图 -->
             <el-avatar :size="40" :src="scope.row.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
          </template>
        </el-table-column>

        <!-- 【改动2】：删掉了“账号”那一列 -->

        <el-table-column prop="name" label="姓名" width="150" />
        <el-table-column prop="roleid" label="角色" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.roleid === 0 || scope.row.roleid === 1 ? 'danger' : 'info'" disable-transitions>
              {{ scope.row.roleid === 0 ? '超级管理员' : (scope.row.roleid === 1 ? '管理员' : '普通用户') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="sex" label="性别" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.sex === 1 ? '' : 'danger'">{{ scope.row.sex === 1 ? '男' : '女' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
</el-card>
    <!-- 新增/编辑 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑用户' : '新增用户'" append-to-body  width="500px">
      <!-- src/components/user/UserManage.vue -->

      <el-form :model="form" label-width="80px">

        <el-form-item label="账号">
          <el-input v-model="form.no" placeholder="请输入登录账号"></el-input>
        </el-form-item>

        <el-form-item label="姓名">
          <el-input v-model="form.name" placeholder="请输入真实姓名"></el-input>
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入登录密码"></el-input>
        </el-form-item>

        <el-form-item label="年龄">
          <el-input-number v-model="form.age" :min="1" :max="120" />
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="电话">
          <el-input v-model="form.phone" placeholder="请输入联系方式"></el-input>
        </el-form-item>

        <el-form-item label="角色" v-if="currentUser.roleid === 0 || currentUser.roleid === 1">
          <el-radio-group v-model="form.roleid">
            <el-radio :label="1">管理员</el-radio>
            <el-radio :label="2">普通用户</el-radio>
          </el-radio-group>
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button :loading="isBtnLoading" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="isBtnLoading" @click="save">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}')
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const name = ref('')
const isBtnLoading = ref(false) // 按钮用的

const form = reactive({
  id: null,
  no: '',       // 新增：账号
  name: '',
  password: '', // 新增：密码
  age: ''  ,  // 新增：年龄
  sex: '1',
  phone: '',
  roleid: 2     // 新增：角色 (默认2=普通用户)
})

const BASE_URL = '/user'

const loadData = async () => {
  loading.value = true
  try {
    const res = await axios.post(`${BASE_URL}/listPage`, {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      name: name.value
    })
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
    loading.value = false
  } catch (e) {
    ElMessage.error('连接后端失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
   dialogVisible.value = true
  // 清空/重置表单
  form.id = null
  form.no = ''
  form.name = ''
  form.password = ''
  form.age = 18
  form.sex = 1
  form.phone = ''
  form.roleid = 2
}

const handleEdit = (row) => {
  dialogVisible.value = true
  Object.assign(form, row)
}

const save = async () => {
  // 🚩 修复点：把 /update 改成 /mod，对应你后端 userController 的路径
  const url = form.id ? `${BASE_URL}/mod` : `${BASE_URL}/save`
isBtnLoading.value=true
  try {
    const res = await axios.post(url, form)

    if (res.data.code === 200) {
      ElMessage.success(res.data.msg || '操作成功') // 显示后端的成功提示
      dialogVisible.value = false
      loadData()
      isBtnLoading.value=false
    } else {
      // 🚩 优化点：显示后端返回的具体错误信息
      // 比如你后端写的 "请v我50解锁管理员权限" 就会在这里弹出来
      ElMessage.error(res.data.msg || '操作失败')
      isBtnLoading.value=false
    }
  } catch (err) {
    ElMessage.error('系统异常')
    isBtnLoading.value=false
  }
}

const handleDelete = (row) => {
  isBtnLoading.value=true
  ElMessageBox.confirm(`确定删除用户 【${row.name}】 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      const res = await axios.get(`${BASE_URL}/delete?id=${row.id}`)
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        loadData()
        isBtnLoading.value=false
      }else {
        // 🚩 新增：如果有错误（比如权限不足），弹窗报错
        ElMessage.error(res.data.msg || '删除失败')
        isBtnLoading.value=false
      }
    }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
