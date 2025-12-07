<template>
  <div style="padding: 20px">
    <el-row :gutter="20" style="margin-bottom: 30px">
      <!-- 卡片1 -->
      <el-col :span="12">
        <el-card class="my-card" shadow="hover" style="background-color: #409eff; color: white">
          <div style="display: flex; align-items: center">
            <el-icon size="50" style="margin-right: 20px"><Box /></el-icon>
            <div>
              <div style="font-size: 16px; opacity: 0.8">仓库总库存</div>
              <div style="font-size: 32px; font-weight: bold; margin-top: 5px">
                {{ totalStock }} 件
              </div>
            </div>
          </div>
          </el-card>
      </el-col>
      <!-- 卡片2 -->
      <el-col :span="12">
        <el-card class="my-card" shadow="hover" style="background-color: #67c23a; color: white">
          <div style="display: flex; align-items: center">
            <el-icon size="50" style="margin-right: 20px"><Files /></el-icon>
            <div>
              <div style="font-size: 16px; opacity: 0.8">物品分类总数</div>
              <div style="font-size: 32px; font-weight: bold; margin-top: 5px">
                {{ categoryCount }} 类
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight: bold">📦 库存分类占比</div>
          </template>
          <!-- 这里的 ref 必须对应 -->
          <div ref="chartRef" style="height: 350px"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight: bold">📊 欢迎使用</div>
          </template>
          <div style="height: 350px; display: flex; flex-direction: column; justify-content: center; color: #666;">
             <h3>欢迎来到 WMS 仓库管理系统</h3>
             <p>当前时间：{{ nowTime }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue' // 引入 nextTick 和 onUnmounted
import * as echarts from 'echarts'
import axios from 'axios'
import { Box, Files } from '@element-plus/icons-vue'

const totalStock = ref(0)
const categoryCount = ref(0)
const nowTime = ref(new Date().toLocaleString())
const chartRef = ref(null)

// 保存图表实例，方便销毁
let myChart = null

const initChart = (data) => {
  // 1. 销毁旧实例 (防止切换页面回来时报错 "Initialize failed: invalid dom")
  if (myChart != null && myChart != "" && myChart != undefined) {
      myChart.dispose();
  }

  // 2. 检查 DOM 是否存在
  const chartDom = chartRef.value
  if (!chartDom) return

  // 3. 初始化
  myChart = echarts.init(chartDom)

  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [
      {
        name: '库存数量',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
        data: data,
      },
    ],
  }
  myChart.setOption(option)
}

const loadStats = async () => {
  try {
    const res = await axios.get('/goods/stats')
    if (res.data.code === 200) {
      const stats = res.data.data
      totalStock.value = stats.totalStock

      const pieData = stats.categoryData
      if (pieData && pieData.length > 0) {
        categoryCount.value = pieData.length

        // 【核心修复】：使用 nextTick 确保 DOM 已经渲染出来了再画图
        nextTick(() => {
          initChart(pieData)
        })
      } else {
        categoryCount.value = 0
      }
    }
  } catch (err) {
    console.error('加载失败', err)
  }
}

// 页面加载时
onMounted(() => {
  loadStats()
})

// 【核心修复】：页面离开时，销毁图表，释放内存
onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>
