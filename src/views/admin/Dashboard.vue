<template>
  <div class="dashboard-container">
    <h2>工作台</h2>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stat-cards">
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card">
          <a-statistic title="待接单" :value="statistics.pending" :value-style="{ color: '#faad14' }">
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card">
          <a-statistic title="紧急订单" :value="statistics.urgent" :value-style="{ color: '#ff4d4f' }">
            <template #prefix><AlertOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card">
          <a-statistic title="今日订单" :value="statistics.today" :value-style="{ color: '#1890ff' }">
            <template #prefix><RiseOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card">
          <a-statistic title="已完成" :value="statistics.completed" :value-style="{ color: '#52c41a' }">
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <!-- 今日日程 -->
      <a-col :xs="24" :md="14">
        <a-card title="今日日程" class="schedule-card" :bordered="false">
          <template #extra>
            <a-button type="link" size="small" @click="$router.push('/admin/schedule')">查看完整日程</a-button>
          </template>
          <a-spin :spinning="loading">
            <div v-if="todaySchedule.is_rest_day" class="rest-day-banner">
              <CoffeeOutlined /> 今天是休息日
            </div>
            <template v-else>
              <div class="schedule-summary">
                <span>共 <strong>{{ todaySchedule.total_orders }}</strong> 个订单</span>
                <a-tag v-if="todaySchedule.urgent_count > 0" color="red">
                  {{ todaySchedule.urgent_count }} 个紧急
                </a-tag>
              </div>
              <a-timeline v-if="todaySchedule.orders && todaySchedule.orders.length > 0">
                <a-timeline-item
                  v-for="order in todaySchedule.orders"
                  :key="order.id"
                  :color="getTimelineColor(order)"
                >
                  <div class="schedule-item" @click="$router.push(`/admin/orders/${order.id}`)">
                    <div class="schedule-time">
                      <a-tag :color="order.is_urgent ? 'red' : 'blue'" size="small">
                        {{ order.time_slot }}
                      </a-tag>
                      <a-tag v-if="order.is_urgent" color="red" size="small">紧急</a-tag>
                    </div>
                    <div class="schedule-info">
                      <span class="schedule-title">{{ order.category }} - {{ order.sub_category }}</span>
                      <span class="schedule-user">{{ order.user?.nickname }} · {{ order.contact_phone }}</span>
                      <span class="schedule-address">{{ order.address?.detail }}</span>
                    </div>
                    <div class="schedule-status">
                      <span :class="'status-' + order.status">{{ statusMap[order.status] }}</span>
                    </div>
                  </div>
                </a-timeline-item>
              </a-timeline>
              <a-empty v-else description="今天暂无订单" />
            </template>
          </a-spin>
        </a-card>
      </a-col>

      <!-- 待处理订单 -->
      <a-col :xs="24" :md="10">
        <a-card title="待接单" class="pending-card" :bordered="false">
          <a-list :data-source="pendingOrders" :loading="loading" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a-space>
                      <a @click="$router.push(`/admin/orders/${item.id}`)">{{ item.order_no }}</a>
                      <a-tag v-if="item.is_urgent" color="red" size="small">紧急</a-tag>
                    </a-space>
                  </template>
                  <template #description>
                    <div>{{ item.category }} - {{ item.sub_category }}</div>
                    <div style="color: #999; font-size: 12px;">
                      {{ item.user?.nickname }} · {{ item.expect_time }}
                    </div>
                  </template>
                </a-list-item-meta>
                <a-button type="primary" size="small" @click="handleAccept(item.id)">
                  接单
                </a-button>
              </a-list-item>
            </template>
            <template #empty>
              <a-empty description="暂无待处理订单" />
            </template>
          </a-list>
        </a-card>

        <!-- 问题类型分布 -->
        <a-card title="问题类型分布" class="chart-card" :bordered="false">
          <div class="chart-container">
            <div v-for="(count, category) in statistics.categoryStats" :key="category" class="chart-item">
              <div class="chart-label">{{ category }}</div>
              <a-progress
                :percent="statistics.total > 0 ? Math.round(count / statistics.total * 100) : 0"
                :stroke-color="categoryColors[category] || '#1890ff'"
              />
              <div class="chart-count">{{ count }}单</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  ClockCircleOutlined, CheckCircleOutlined, RiseOutlined,
  AlertOutlined, CoffeeOutlined
} from '@ant-design/icons-vue'
import { adminApi, scheduleApi } from '../../api/mock'
import { storage } from '../../utils/storage'
import { statusMap } from '../../utils/constants'

const loading = ref(false)
const statistics = ref({
  total: 0, today: 0, week: 0, pending: 0, completed: 0, urgent: 0,
  categoryStats: {}, statusStats: {}
})
const pendingOrders = ref([])
const todaySchedule = ref({ orders: [], total_orders: 0, urgent_count: 0, is_rest_day: false })

const categoryColors = {
  '水管': '#1890ff',
  '电路': '#faad14',
  '地暖': '#13c2c2',
  '其他': '#722ed1'
}

const today = new Date().toISOString().slice(0, 10)

const getTimelineColor = (order) => {
  if (order.is_urgent) return 'red'
  if (order.status === 'completed') return 'green'
  if (order.status === 'repairing') return 'blue'
  return 'gray'
}

const loadData = async () => {
  loading.value = true
  try {
    const [statsRes, ordersRes, scheduleRes] = await Promise.all([
      adminApi.getStatistics(),
      adminApi.getAllOrders({ status: 'pending' }),
      scheduleApi.getDaySchedule(today)
    ])
    if (statsRes.code === 200) statistics.value = statsRes.data
    if (ordersRes.code === 200) pendingOrders.value = ordersRes.data.slice(0, 8)
    if (scheduleRes.code === 200) todaySchedule.value = scheduleRes.data
  } finally {
    loading.value = false
  }
}

const handleAccept = async (orderId) => {
  const admin = storage.get('current_admin')
  const res = await adminApi.acceptOrder(orderId, admin.id)
  if (res.code === 200) {
    message.success('接单成功')
    loadData()
  } else {
    message.error(res.message)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-container h2 {
  margin-bottom: 24px;
  font-size: 20px;
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
}

.stat-card :deep(.ant-statistic-title) {
  font-size: 14px;
  color: #666;
}

.stat-card :deep(.ant-statistic-content) {
  font-size: 28px;
}

.schedule-card,
.pending-card,
.chart-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.rest-day-banner {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}

.schedule-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.schedule-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 8px 0;
}

.schedule-item:hover {
  opacity: 0.8;
}

.schedule-time {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.schedule-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.schedule-title {
  font-weight: 500;
  color: #333;
}

.schedule-user {
  font-size: 12px;
  color: #666;
}

.schedule-address {
  font-size: 12px;
  color: #999;
}

.schedule-status {
  flex-shrink: 0;
}

.chart-container {
  padding: 8px 0;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-label {
  width: 50px;
  font-size: 14px;
}

.chart-item :deep(.ant-progress) {
  flex: 1;
}

.chart-count {
  width: 50px;
  text-align: right;
  color: #666;
  font-size: 14px;
}
</style>
