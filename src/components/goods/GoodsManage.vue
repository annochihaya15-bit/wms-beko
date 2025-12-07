<template>
  <div style="padding: 20px;">

    <!-- 📦 盒子 1：搜索工具栏 (直接穿上 my-card) -->
    <el-card class="my-card" style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">

        <!-- 左边：搜索框 -->
        <div style="display: flex; gap: 10px">
          <el-input
            v-model="queryDto.name"
            placeholder="请输入物品名称"
            style="width: 200px"
            clearable
            @clear="loadData"
          />
          <el-button type="primary" @click="loadData">
            <el-icon style="margin-right: 5px"><Search /></el-icon> 查询
          </el-button>
          <el-button type="info" plain @click="resetQuery">
            <el-icon style="margin-right: 5px"><Refresh /></el-icon> 重置
          </el-button>
        </div>

        <!-- 右边：导出和新增 -->
        <div style="display: flex; gap: 10px">
          <el-button type="success" plain @click="handleExport">
            <el-icon style="margin-right: 5px"><Download /></el-icon> 导出 Excel
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon style="margin-right: 5px"><Plus /></el-icon> 新增物品
          </el-button>
        </div>

      </div>
    </el-card>

    <!-- 📦 盒子 2：表格和分页 (也直接穿上 my-card) -->
    <el-card class="my-card">

      <!-- 表格区域 -->
      <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="物品名称" width="180" />
        <el-table-column prop="storage" label="仓库位置" width="150" />
        <el-table-column prop="goodstype" label="分类" width="120">
          <template #default="scope">
            <el-tag>{{ scope.row.goodstype }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="库存数量" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getAuditStatus(scope.row.count)">
              {{ scope.row.count }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div style="margin-top: 20px; display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="queryDto.currentPage"
          v-model:page-size="queryDto.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>

    </el-card>

    <!-- 👇👇👇 弹窗代码保留在最下面，不用动 👇👇👇 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑物品' : '新增物品'"
      width="30%"
      append-to-body
    >
      <!-- ... 这里面的表单内容保持不变 ... -->
      <el-form :model="form" label-width="80px">
        <el-form-item label="物品名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="仓库位置"><el-input v-model="form.storage" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="form.goodstype" /></el-form-item>
        <el-form-item label="库存数量"><el-input-number v-model="form.count" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <!-- 记得这里也要改冒号 :loading -->
          <el-button :loading="isBtnLoading" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="isBtnLoading" @click="save">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh, Edit, Delete, Download } from '@element-plus/icons-vue'


// ================= 变量定义 =================
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const isBtnLoading = ref(false)
const loading=ref(false)

// 请求地址前缀
const BASE_URL = '/goods'

// 查询条件
const queryDto = reactive({
  currentPage: 1,
  pageSize: 10,
  name: '',
})

// 表单对象 (根据你的 script 使用的字段)
const form = reactive({
  id: null,
  name: '',
  storage: '',     // ⚠️注意：如果这里没值，检查数据库是不是叫 location
  goodstype: '',   // ⚠️注意：如果这里没值，检查数据库是不是叫 category
  count: 0,
  remark: '',
})

// ================= 方法定义 =================

// 1. 导出 Excel
const handleExport = async () => {
   isBtnLoading.value=true
  try {
    ElMessage.info('正在请求导出，请稍候...')
    // 建议：如果配置了代理，这里最好用 `${BASE_URL}/export`，即 '/goods/export'
    // 目前保留你原来的 localhost 写法，如果跨域报错请改成 '/goods/export'
    const res = await axios.get('http://localhost:8080/goods/export', {
      responseType: 'blob',
    })

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
    })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `库存清单_${new Date().getTime()}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    ElMessage.success('导出成功！')
     isBtnLoading.value=false
  } catch (error) {
    console.error('导出失败', error)
    ElMessage.error('导出失败，请检查后端服务')
     isBtnLoading.value=false
  }
}

// 2. 加载数据
const loadData = async () => {
   isBtnLoading.value = true
  try {
    const res = await axios.post(`${BASE_URL}/listPage`, queryDto)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '数据加载失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('网络异常，请检查后端是否启动')
  } finally {
     isBtnLoading.value = false
  }
}

// 3. 重置搜索
const resetQuery = () => {
  queryDto.name = ''
  queryDto.currentPage = 1
  loadData()
}

// 4. 点击新增
const handleAdd = () => {
  dialogVisible.value = true
  // 清空表单
  form.id = null
  form.name = ''
  form.storage = ''
  form.goodstype = ''
  form.count = 0
  form.remark = ''
}

// 5. 点击编辑
const handleEdit = (row) => {
  dialogVisible.value = true
  // 复制数据到表单
  Object.assign(form, row)
}

// 6. 保存
const save = async () => {
   isBtnLoading.value=true
  try {
    const res = await axios.post(`${BASE_URL}/save`, form)
    if (res.data.code === 200) {
      ElMessage.success('操作成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
    isBtnLoading.value=false
  } catch (err) {
    ElMessage.error('系统异常')
    isBtnLoading.value=false
  }
}

// 7. 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除【${row.name}】吗？`, '警告', {
    type: 'warning',
  })
    .then(async () => {
      isBtnLoading.value=true
      const res = await axios.post(`${BASE_URL}/delete?id=${row.id}`)
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        loadData()
        isBtnLoading.value=false
      } else {
        ElMessage.error(res.data.msg)
        isBtnLoading.value=false
      }
    })
    .catch(() => {})
}

// 8. 库存状态颜色
const getAuditStatus = (count) => {
  if (count === 0) return 'danger'
  if (count < 10) return 'warning'
  return 'success'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.goods-container {
  padding: 20px;
}
/* 不需要 search-box 样式了，因为我在 template 里直接写了 flex 布局 */
</style>
