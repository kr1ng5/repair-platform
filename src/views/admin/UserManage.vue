<template>
  <div class="user-manage-container">
    <h2>用户管理</h2>

    <a-card>
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索用户昵称/手机号"
            style="width: 240px"
            allow-clear
            @search="handleSearch"
          />
          <a-button @click="handleExportCSV">
            <DownloadOutlined /> 导出CSV
          </a-button>
        </a-space>
      </template>
      <a-table
        :columns="columns"
        :data-source="users"
        :loading="loading"
        :pagination="{ pageSize: 10, showTotal: total => `共 ${total} 条` }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :style="{ backgroundColor: '#1890ff' }">
              {{ record.nickname?.charAt(0) || '用' }}
            </a-avatar>
          </template>
          <template v-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'red' : 'blue'">
              {{ record.role === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'order_count'">
            <a-tag color="green">{{ getOrderCount(record.id) }} 单</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="showDetail(record)">查看详情</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 用户详情弹窗 -->
    <a-modal v-model:open="detailVisible" title="用户详情" :footer="null" width="600px">
      <template v-if="currentUser">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="用户ID">{{ currentUser.id }}</a-descriptions-item>
          <a-descriptions-item label="昵称">{{ currentUser.nickname }}</a-descriptions-item>
          <a-descriptions-item label="手机号">{{ currentUser.phone }}</a-descriptions-item>
          <a-descriptions-item label="角色">
            <a-tag :color="currentUser.role === 'admin' ? 'red' : 'blue'">
              {{ currentUser.role === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="订单数">{{ getOrderCount(currentUser.id) }} 单</a-descriptions-item>
          <a-descriptions-item label="注册时间">{{ currentUser.created_at }}</a-descriptions-item>
        </a-descriptions>

        <h4 style="margin: 16px 0 8px">最近订单</h4>
        <a-table
          :columns="orderColumns"
          :data-source="getUserOrders(currentUser.id)"
          :pagination="{ pageSize: 5 }"
          size="small"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span :class="'status-' + record.status">{{ statusMap[record.status] }}</span>
            </template>
          </template>
        </a-table>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { adminApi } from '../../api/mock'
import { statusMap } from '../../utils/constants'

const loading = ref(false)
const users = ref([])
const allUsers = ref([])
const orders = ref([])
const detailVisible = ref(false)
const currentUser = ref(null)
const searchKeyword = ref('')

const columns = [
  { title: '头像', key: 'avatar', width: 60 },
  { title: '昵称', dataIndex: 'nickname', width: 120 },
  { title: '手机号', dataIndex: 'phone', width: 140 },
  { title: '角色', key: 'role', width: 100 },
  { title: '订单数', key: 'order_count', width: 100 },
  { title: '注册时间', dataIndex: 'created_at', width: 180 },
  { title: '操作', key: 'action', width: 100 }
]

const orderColumns = [
  { title: '订单号', dataIndex: 'order_no', width: 150 },
  { title: '问题类型', dataIndex: 'category', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '提交时间', dataIndex: 'created_at', width: 160 }
]

const getOrderCount = (userId) => {
  return orders.value.filter(o => o.user_id === userId).length
}

const getUserOrders = (userId) => {
  return orders.value.filter(o => o.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

const showDetail = (user) => {
  currentUser.value = user
  detailVisible.value = true
}

const loadData = async () => {
  loading.value = true
  try {
    const usersRes = await adminApi.getAllUsers()
    if (usersRes.code === 200) {
      users.value = usersRes.data
      allUsers.value = usersRes.data
    }
    const ordersRes = await adminApi.getAllOrders()
    if (ordersRes.code === 200) {
      orders.value = ordersRes.data
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    users.value = allUsers.value
    return
  }
  const kw = searchKeyword.value.toLowerCase()
  users.value = allUsers.value.filter(u =>
    u.nickname.toLowerCase().includes(kw) || u.phone.includes(kw)
  )
}

const handleExportCSV = async () => {
  const res = await adminApi.getAllUsersForExport()
  if (res.code !== 200) return
  const headers = ['用户ID', '昵称', '手机号', '角色', '注册时间']
  const rows = res.data.map(u => [
    u.id, u.nickname, u.phone, u.role === 'admin' ? '管理员' : '普通用户', u.created_at
  ])
  const csv = '﻿' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `用户数据_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  message.success('导出成功')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-manage-container h2 {
  margin-bottom: 24px;
  font-size: 20px;
}
</style>
