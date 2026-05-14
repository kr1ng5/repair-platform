<template>
  <div class="worker-dashboard">
    <header class="worker-header">
      <div class="header-content">
        <div class="logo">
          <ToolOutlined />
          <span>维修工工作台</span>
        </div>
        <div class="header-right">
          <span class="worker-name">{{ worker?.name || '维修师傅' }}</span>
          <a-dropdown>
            <a class="worker-info">
              <a-avatar :style="{ backgroundColor: '#52c41a' }">
                {{ worker?.name?.charAt(0) || '师' }}
              </a-avatar>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </header>

    <div class="worker-content">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <a-card class="stat-card">
          <a-statistic title="我的订单" :value="stats.totalOrders" />
        </a-card>
        <a-card class="stat-card">
          <a-statistic title="已完成" :value="stats.completedOrders" :value-style="{ color: '#52c41a' }" />
        </a-card>
        <a-card class="stat-card">
          <a-statistic title="待处理" :value="stats.pendingOrders" :value-style="{ color: '#faad14' }" />
        </a-card>
        <a-card class="stat-card">
          <a-statistic title="总收入" :value="stats.revenue" prefix="¥" :value-style="{ color: '#ff4d4f' }" />
        </a-card>
      </div>

      <!-- 我的订单 -->
      <a-card title="我的订单" class="orders-card">
        <template #extra>
          <a-radio-group v-model:value="statusFilter" button-style="solid" @change="loadOrders">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="accepted">待上门</a-radio-button>
            <a-radio-button value="going">上门中</a-radio-button>
            <a-radio-button value="repairing">维修中</a-radio-button>
            <a-radio-button value="completed">已完成</a-radio-button>
          </a-radio-group>
        </template>

        <a-table
          :columns="columns"
          :data-source="orders"
          :loading="loading"
          :pagination="{ pageSize: 10, showTotal: total => `共 ${total} 条` }"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'order_no'">
              <a @click="$router.push(`/admin/orders/${record.id}`)">{{ record.order_no }}</a>
            </template>
            <template v-if="column.key === 'category'">
              <a-tag color="blue">{{ record.category }}</a-tag>
              {{ record.sub_category }}
            </template>
            <template v-if="column.key === 'status'">
              <span :class="'status-' + record.status">{{ statusMap[record.status] }}</span>
            </template>
            <template v-if="column.key === 'user'">
              {{ record.user?.nickname || '-' }}
            </template>
            <template v-if="column.key === 'price'">
              <span v-if="record.price > 0" style="color: #ff4d4f; font-weight: 600;">¥{{ record.price }}</span>
              <span v-else style="color: #999;">-</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button
                  v-if="record.status === 'accepted'"
                  type="primary"
                  size="small"
                  @click="updateStatus(record.id, 'going')"
                >
                  出发
                </a-button>
                <a-button
                  v-if="record.status === 'going'"
                  type="primary"
                  size="small"
                  @click="updateStatus(record.id, 'repairing')"
                >
                  开始维修
                </a-button>
                <a-button
                  v-if="record.status === 'repairing'"
                  type="primary"
                  size="small"
                  @click="updateStatus(record.id, 'completed')"
                >
                  完成
                </a-button>
                <a-button size="small" @click="$router.push(`/admin/orders/${record.id}`)">
                  详情
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { ToolOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { adminApi } from '../../api/mock'
import { storage } from '../../utils/storage'
import { statusMap } from '../../utils/constants'

const router = useRouter()
const worker = ref(null)
const loading = ref(false)
const orders = ref([])
const statusFilter = ref('all')

const stats = reactive({
  totalOrders: 0,
  completedOrders: 0,
  pendingOrders: 0,
  revenue: 0
})

const columns = [
  { title: '订单号', key: 'order_no', width: 160 },
  { title: '问题类型', key: 'category', width: 150 },
  { title: '用户', key: 'user', width: 100 },
  { title: '联系电话', dataIndex: 'contact_phone', width: 120 },
  { title: '地址', dataIndex: ['address', 'detail'], width: 200, ellipsis: true },
  { title: '状态', key: 'status', width: 100 },
  { title: '费用', key: 'price', width: 80 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' }
]

const loadOrders = async () => {
  loading.value = true
  try {
    const params = { status: statusFilter.value }
    const res = await adminApi.getAllOrders(params)
    if (res.code === 200) {
      // 只显示分配给当前维修工的订单
      orders.value = res.data.filter(o => o.handler_id === worker.value?.id)
    }
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  const allRes = await adminApi.getAllOrders()
  if (allRes.code === 200) {
    const myOrders = allRes.data.filter(o => o.handler_id === worker.value?.id)
    stats.totalOrders = myOrders.length
    stats.completedOrders = myOrders.filter(o => ['completed', 'reviewed'].includes(o.status)).length
    stats.pendingOrders = myOrders.filter(o => ['accepted', 'going', 'repairing'].includes(o.status)).length
    stats.revenue = myOrders
      .filter(o => ['completed', 'reviewed'].includes(o.status))
      .reduce((sum, o) => sum + (o.price || 0), 0)
  }
}

const updateStatus = async (orderId, status) => {
  const res = await adminApi.updateOrderStatus(orderId, status)
  if (res.code === 200) {
    message.success('状态更新成功')
    loadOrders()
    loadStats()
  }
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('current_admin')
  message.success('已退出登录')
  router.push('/admin/login')
}

onMounted(() => {
  worker.value = storage.get('current_admin')
  if (!worker.value || worker.value.role !== 'worker') {
    router.push('/admin/login')
    return
  }
  // 从 settings 同步最新的维修工姓名
  const settings = storage.get('settings')
  if (settings?.worker_name) {
    worker.value = { ...worker.value, name: settings.worker_name }
  }
  loadOrders()
  loadStats()
})
</script>

<style scoped>
.worker-dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.worker-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #52c41a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.worker-name {
  font-size: 14px;
  color: #333;
}

.worker-info {
  cursor: pointer;
}

.worker-content {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
}

.orders-card {
  border-radius: 8px;
}
</style>
