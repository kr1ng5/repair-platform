<template>
  <div class="statistics-container">
    <div class="page-header-row">
      <h2>数据统计</h2>
      <a-radio-group v-model:value="timeRange" button-style="solid" @change="loadStats">
        <a-radio-button value="all">全部</a-radio-button>
        <a-radio-button value="today">今日</a-radio-button>
        <a-radio-button value="week">本周</a-radio-button>
        <a-radio-button value="month">本月</a-radio-button>
      </a-radio-group>
    </div>

    <!-- 统计概览 -->
    <a-row :gutter="24" class="stat-overview">
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card blue">
          <a-statistic title="总订单数" :value="stats.total">
            <template #prefix><UnorderedListOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card green">
          <a-statistic title="今日新增" :value="stats.today">
            <template #prefix><RiseOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card orange">
          <a-statistic title="待处理" :value="stats.pending">
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card purple">
          <a-statistic title="已完成" :value="stats.completed">
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card red">
          <a-statistic title="紧急订单" :value="stats.urgent">
            <template #prefix><AlertOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="24">
      <!-- 问题类型分布 -->
      <a-col :xs="24" :md="12">
        <a-card title="问题类型分布" class="chart-card">
          <div class="chart-content">
            <div v-for="(count, category) in stats.categoryStats" :key="category" class="chart-bar-item">
              <div class="bar-header">
                <span class="bar-label">{{ category }}</span>
                <span class="bar-value">{{ count }}单 ({{ stats.total > 0 ? Math.round(count / stats.total * 100) : 0 }}%)</span>
              </div>
              <a-progress :percent="stats.total > 0 ? Math.round(count / stats.total * 100) : 0" :stroke-color="categoryColors[category] || '#1890ff'" :show-info="false" />
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 订单状态分布 -->
      <a-col :xs="24" :md="12">
        <a-card title="订单状态分布" class="chart-card">
          <div class="chart-content">
            <div v-for="(count, status) in stats.statusStats" :key="status" class="chart-bar-item">
              <div class="bar-header">
                <span class="bar-label">{{ statusMap[status] || status }}</span>
                <span class="bar-value">{{ count }}单</span>
              </div>
              <a-progress :percent="stats.total > 0 ? Math.round(count / stats.total * 100) : 0" :stroke-color="statusColors[status] || '#1890ff'" :show-info="false" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 完成率统计 -->
    <a-card title="完成率统计" class="rate-card">
      <a-row :gutter="24">
        <a-col :xs="24" :md="8">
          <div class="rate-item">
            <a-progress type="dashboard" :percent="completionRate" :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }" />
            <p class="rate-label">订单完成率</p>
          </div>
        </a-col>
        <a-col :xs="24" :md="8">
          <div class="rate-item">
            <a-progress type="dashboard" :percent="acceptRate" :stroke-color="{ '0%': '#faad14', '100%': '#52c41a' }" />
            <p class="rate-label">接单率</p>
          </div>
        </a-col>
        <a-col :xs="24" :md="8">
          <div class="rate-item">
            <a-progress type="dashboard" :percent="cancelRate" :stroke-color="{ '0%': '#ff4d4f', '100%': '#faad14' }" />
            <p class="rate-label">取消率</p>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { UnorderedListOutlined, RiseOutlined, ClockCircleOutlined, CheckCircleOutlined, AlertOutlined } from '@ant-design/icons-vue'
import { adminApi } from '../../api/mock'
import { statusMap, statusColors } from '../../utils/constants'

const timeRange = ref('all')

const stats = ref({
  total: 0, today: 0, week: 0, month: 0, pending: 0, completed: 0, urgent: 0,
  categoryStats: {}, statusStats: {}
})

const categoryColors = { '水管': '#1890ff', '电路': '#faad14', '地暖': '#13c2c2', '其他': '#722ed1' }

const completionRate = computed(() => {
  if (!stats.value.total) return 0
  return Math.round((stats.value.statusStats.completed || 0) / stats.value.total * 100)
})

const acceptRate = computed(() => {
  if (!stats.value.total) return 0
  const pending = stats.value.statusStats.pending || 0
  return Math.round((stats.value.total - pending) / stats.value.total * 100)
})

const cancelRate = computed(() => {
  if (!stats.value.total) return 0
  return Math.round((stats.value.statusStats.cancelled || 0) / stats.value.total * 100)
})

const loadStats = async () => {
  const res = await adminApi.getStatistics()
  if (res.code === 200) stats.value = res.data
}

onMounted(() => { loadStats() })
</script>

<style scoped>
.statistics-container h2 { margin-bottom: 24px; font-size: 20px; }
.stat-overview { margin-bottom: 24px; }
.stat-card { text-align: center; border-radius: 8px; }
.stat-card.blue { border-top: 3px solid #1890ff; }
.stat-card.green { border-top: 3px solid #52c41a; }
.stat-card.orange { border-top: 3px solid #faad14; }
.stat-card.purple { border-top: 3px solid #722ed1; }
.stat-card.red { border-top: 3px solid #ff4d4f; }
.stat-card :deep(.ant-statistic-title) { color: #666; }
.stat-card :deep(.ant-statistic-content) { font-size: 28px; }
.chart-card { margin-bottom: 24px; border-radius: 8px; }
.chart-content { padding: 16px 0; }
.chart-bar-item { margin-bottom: 20px; }
.bar-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.bar-label { font-size: 14px; color: #333; }
.bar-value { font-size: 14px; color: #666; }
.rate-card { margin-bottom: 24px; border-radius: 8px; }
.rate-item { text-align: center; padding: 20px; }
.rate-label { margin-top: 12px; font-size: 14px; color: #666; }
.page-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-header-row h2 { margin: 0; font-size: 20px; }
</style>
