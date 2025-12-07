<template>
  <div class="record-container">
    <!-- 1. 顶部搜索栏 -->
     <el-card class="my-card" style="margin-bottom: 20px;">
 <div style="display: flex; gap: 10px">
        <el-input
          v-model="queryDto.name"
          placeholder="请输入物品名称搜索"
          class="search-input"
          clearable
          @clear="loadData"
          @keyup.enter="loadData"
        >
          <template #prefix
            ><el-icon><Search /></el-icon
          ></template>
        </el-input>

        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </div>
    </el-card>

    <!-- 2. 数据表格 -->
    <el-card class="my-card">
      <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column prop="goodsName" label="物品名称" min-width="150" />

        <!-- 这一列：根据入库/出库显示不同颜色的标签 -->
        <el-table-column prop="action" label="操作类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getActionTag(scope.row.action)" effect="light">
              {{ scope.row.action }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="count" label="变动数量" width="120" align="center">
          <template #default="scope">
            <span style="font-weight: bold">{{ scope.row.count }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="adminName" label="操作人" width="150" align="center">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.adminName }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createtime" label="操作时间" min-width="180" align="center">
          <template #default="scope">
            <!-- 把时间中间的 T 去掉，稍微美化一下 -->
            {{ scope.row.createtime ? scope.row.createtime.replace('T', ' ') : '' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 3. 分页组件 -->
      <div style="margin-top: 20px; display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="queryDto.currentPage"
          v-model:page-size="queryDto.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// ================= 变量定义 =================
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 请求地址 (对应后端的 GoodsRecordController)
const BASE_URL = 'http://localhost:8080/record'

// 查询条件
const queryDto = reactive({
  currentPage: 1,
  pageSize: 10,
  name: '',
})

// ================= 方法定义 =================

// 1. 加载数据
const loadData = async () => {
  loading.value = true
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
    ElMessage.error('网络异常，请检查后端')
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryDto.name = ''
  queryDto.currentPage = 1
  loadData()
}

// 3. 标签颜色判断 (美化关键点✨)
// 根据后端返回的 action 字符串来决定颜色
const getActionTag = (action) => {
  if (!action) return 'info'
  // 包含"入库"显示绿色(success)，包含"出库"显示橙色(warning)
  if (action.includes('入库')) return 'success'
  if (action.includes('出库')) return 'warning'
  return 'primary' // 其他情况显示蓝色
}

// ⚠️ URL 优化建议：
// 你上面写的 BASE_URL 是 'http://localhost:8080/record'
// 建议改成相对路径，跟 UserManage 保持一致，防止跨域配置失效
// const BASE_URL = '/record'

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 你的样式可以删掉了，因为我们直接在 template 里写了 style */
/* .record-container { padding: 20px; } */
</style>
