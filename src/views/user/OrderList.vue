<template>
  <div class="orders-container">
    <!-- 顶部导航 -->
    <header class="page-header-bar">
      <div class="header-content">
        <div class="header-left">
          <a-breadcrumb>
            <a-breadcrumb-item>
              <router-link to="/home">首页</router-link>
            </a-breadcrumb-item>
            <a-breadcrumb-item>我的订单</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <a-button type="primary" @click="$router.push('/repair')">
          <PlusOutlined /> 新建报修
        </a-button>
      </div>
    </header>

    <div class="orders-content">
      <!-- 搜索栏 -->
      <a-card :bordered="false" class="search-card" v-if="searchQuery">
        <div class="search-info">
          <span>搜索 "{{ searchQuery }}" 的结果</span>
          <a-button type="link" size="small" @click="clearSearch">清除搜索</a-button>
        </div>
      </a-card>

      <!-- 状态筛选 -->
      <a-card :bordered="false" class="filter-card">
        <a-radio-group v-model:value="currentStatus" button-style="solid" @change="handleFilter">
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button value="pending">待接单</a-radio-button>
          <a-radio-button value="accepted">已接单</a-radio-button>
          <a-radio-button value="repairing">维修中</a-radio-button>
          <a-radio-button value="completed">已完成</a-radio-button>
          <a-radio-button value="cancelled">已取消</a-radio-button>
        </a-radio-group>
      </a-card>

      <!-- 订单列表 -->
      <div class="order-list">
        <a-spin :spinning="loading">
          <a-empty v-if="orders.length === 0" description="暂无订单" />

          <a-card
            v-for="order in orders"
            :key="order.id"
            class="order-card"
            hoverable
            @click="$router.push(`/orders/${order.id}`)"
          >
            <div class="order-header">
              <span class="order-no">订单号：{{ order.order_no }}</span>
              <span :class="'status-' + order.status">
                {{ statusMap[order.status] }}
              </span>
            </div>

            <div class="order-body">
              <div class="order-info">
                <div class="info-item">
                  <span class="label">问题类型：</span>
                  <span>{{ order.category }} - {{ order.sub_category }}</span>
                </div>
                <div class="info-item">
                  <span class="label">问题描述：</span>
                  <span class="description">{{ order.description }}</span>
                </div>
                <div class="info-item">
                  <span class="label">服务地址：</span>
                  <span>{{ order.address?.province }}{{ order.address?.city }}{{ order.address?.district }}{{ order.address?.detail }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="footer-left">
                <span class="order-time">提交时间：{{ order.created_at }}</span>
                <a-tag v-if="order.time_slot" color="cyan" size="small">{{ order.time_slot }}</a-tag>
                <a-tag v-if="order.is_urgent" color="red" size="small">紧急</a-tag>
              </div>
              <a-button type="link" size="small">
                查看详情 <RightOutlined />
              </a-button>
            </div>
          </a-card>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons-vue'
import { orderApi } from '../../api/mock'
import { statusMap } from '../../utils/constants'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const orders = ref([])
const currentStatus = ref('all')
const searchQuery = ref('')

const loadOrders = async () => {
  loading.value = true
  try {
    let res
    if (searchQuery.value) {
      res = await orderApi.searchOrders(searchQuery.value)
    } else {
      res = await orderApi.getUserOrders(currentStatus.value)
    }
    if (res.code === 200) {
      orders.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  searchQuery.value = ''
  loadOrders()
}

const clearSearch = () => {
  searchQuery.value = ''
  loadOrders()
}

onMounted(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  loadOrders()
})

watch(() => route.query.search, (val) => {
  if (val) {
    searchQuery.value = val
    loadOrders()
  }
})
</script>

<style scoped>
.orders-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header-bar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.page-header-bar .header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header-bar h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.orders-content {
  max-width: 900px;
  margin: 24px auto;
  padding: 0 20px;
}

.search-card {
  margin-bottom: 12px;
  background: #e6f7ff;
}

.search-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #1890ff;
}

.filter-card {
  margin-bottom: 20px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.order-no {
  color: #666;
  font-size: 14px;
}

.order-body {
  margin-bottom: 16px;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.info-item .label {
  color: #999;
}

.info-item .description {
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.order-time {
  color: #999;
  font-size: 12px;
}
</style>
