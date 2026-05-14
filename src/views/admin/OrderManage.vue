<template>
  <div class="order-manage-container">
    <h2>订单管理</h2>

    <!-- 筛选条件 -->
    <a-card class="filter-card">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="6">
          <a-select v-model:value="filters.status" placeholder="订单状态" allow-clear style="width: 100%" @change="handleFilter">
            <a-select-option value="all">全部状态</a-select-option>
            <a-select-option value="pending">待接单</a-select-option>
            <a-select-option value="accepted">已接单</a-select-option>
            <a-select-option value="repairing">维修中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="6">
          <a-select v-model:value="filters.category" placeholder="问题类型" allow-clear style="width: 100%" @change="handleFilter">
            <a-select-option value="all">全部类型</a-select-option>
            <a-select-option value="水管">水管</a-select-option>
            <a-select-option value="电路">电路</a-select-option>
            <a-select-option value="地暖">地暖</a-select-option>
            <a-select-option value="其他">其他</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="6">
          <a-checkbox v-model:checked="filters.urgentOnly" @change="handleFilter">仅紧急</a-checkbox>
        </a-col>
        <a-col :xs="24" :sm="6">
          <a-input-search v-model:value="filters.keyword" placeholder="搜索订单号/手机号" allow-clear @search="handleFilter" />
        </a-col>
      </a-row>
    </a-card>

    <!-- 订单列表 -->
    <a-card class="table-card">
      <template #extra>
        <a-button @click="handleExportCSV"><DownloadOutlined /> 导出CSV</a-button>
      </template>
      <a-table :columns="columns" :data-source="orders" :loading="loading" :pagination="{ pageSize: 10, showTotal: total => `共 ${total} 条` }" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'order_no'">
            <a-space>
              <a @click="$router.push(`/admin/orders/${record.id}`)">{{ record.order_no }}</a>
              <a-tag v-if="record.is_urgent" color="red" size="small">紧急</a-tag>
            </a-space>
          </template>
          <template v-if="column.key === 'category'">
            <a-tag color="blue">{{ record.category }}</a-tag>
            <span>{{ record.sub_category }}</span>
          </template>
          <template v-if="column.key === 'status'">
            <span :class="'status-' + record.status">{{ statusMap[record.status] }}</span>
          </template>
          <template v-if="column.key === 'user'">
            {{ record.user?.nickname || '-' }}
          </template>
          <template v-if="column.key === 'time'">
            <div>{{ record.expect_time }}</div>
            <div style="color: #999; font-size: 12px;">{{ record.time_slot }}</div>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button v-if="record.status === 'pending'" type="primary" size="small" @click="handleAccept(record.id)">
                接单
              </a-button>
              <a-dropdown v-if="canUpdateStatus(record.status)">
                <a-button size="small">更新状态 <DownOutlined /></a-button>
                <template #overlay>
                  <a-menu @click="({ key }) => handleUpdateStatus(record.id, key)">
                    <a-menu-item v-if="record.status === 'accepted'" key="repairing">标记为维修中</a-menu-item>
                    <a-menu-item v-if="record.status === 'repairing'" key="completed">标记为已完成</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <a-button size="small" @click="$router.push(`/admin/orders/${record.id}`)">详情</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { DownOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { adminApi } from '../../api/mock'
import { storage } from '../../utils/storage'
import { statusMap } from '../../utils/constants'

const loading = ref(false)
const orders = ref([])

const filters = reactive({
  status: 'all',
  category: 'all',
  keyword: '',
  urgentOnly: false
})

const columns = [
  { title: '订单号', key: 'order_no', width: 180 },
  { title: '问题类型', key: 'category', width: 130 },
  { title: '用户', key: 'user', width: 80 },
  { title: '联系电话', dataIndex: 'contact_phone', width: 120 },
  { title: '状态', key: 'status', width: 90 },
  { title: '上门时间', key: 'time', width: 160 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

const canUpdateStatus = (status) => ['accepted', 'repairing'].includes(status)

const loadOrders = async () => {
  loading.value = true
  try {
    const params = { ...filters }
    if (filters.urgentOnly) params.is_urgent = true
    delete params.urgentOnly
    const res = await adminApi.getAllOrders(params)
    if (res.code === 200) orders.value = res.data
  } finally {
    loading.value = false
  }
}

const handleFilter = () => loadOrders()

const handleAccept = async (orderId) => {
  const admin = storage.get('current_admin')
  const res = await adminApi.acceptOrder(orderId, admin.id)
  if (res.code === 200) {
    message.success('接单成功')
    loadOrders()
  } else {
    message.error(res.message)
  }
}

const handleUpdateStatus = async (orderId, status) => {
  const res = await adminApi.updateOrderStatus(orderId, status)
  if (res.code === 200) {
    message.success('状态更新成功')
    loadOrders()
  } else {
    message.error(res.message)
  }
}

const handleExportCSV = async () => {
  const res = await adminApi.getAllOrdersForExport()
  if (res.code !== 200) return
  const headers = ['订单号', '用户', '问题类型', '子类型', '描述', '联系电话', '地址', '状态', '紧急', '时间段', '预计时长', '提交时间']
  const rows = res.data.map(o => [
    o.order_no, o.user_nickname, o.category, o.sub_category,
    `"${o.description}"`, o.contact_phone,
    `"${o.address?.province || ''}${o.address?.city || ''}${o.address?.district || ''}${o.address?.detail || ''}"`,
    statusMap[o.status] || o.status, o.is_urgent ? '是' : '否',
    o.time_slot || '', o.expected_duration ? `${o.expected_duration}小时` : '', o.created_at
  ])
  const csv = '﻿' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `订单数据_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  message.success('导出成功')
}

onMounted(() => { loadOrders() })
</script>

<style scoped>
.order-manage-container h2 {
  margin-bottom: 24px;
  font-size: 20px;
}
.filter-card { margin-bottom: 20px; }
.table-card { border-radius: 8px; }
</style>
