<template>
  <div class="detail-container">
    <!-- 顶部导航 -->
    <header class="page-header-bar">
      <div class="header-content">
        <a-breadcrumb>
          <a-breadcrumb-item>
            <router-link to="/home">首页</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <router-link to="/orders">我的订单</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>订单详情</a-breadcrumb-item>
        </a-breadcrumb>
        <div></div>
      </div>
    </header>

    <div class="detail-content">
      <a-spin :spinning="loading">
        <template v-if="order">
          <!-- 订单状态卡片 -->
          <a-card class="status-card">
            <div class="status-info">
              <div class="status-icon" :class="'status-bg-' + order.status">
                <CheckCircleOutlined v-if="order.status === 'completed'" />
                <ClockCircleOutlined v-else-if="order.status === 'pending'" />
                <SyncOutlined v-else spin />
              </div>
              <div class="status-text">
                <h3>{{ statusMap[order.status] }}</h3>
                <p v-if="order.status === 'pending'">请耐心等待，维修师傅将尽快接单</p>
                <p v-else-if="order.status === 'accepted'">维修师傅已接单，将按时上门服务</p>
                <p v-else-if="order.status === 'completed'">维修已完成，感谢您的信任</p>
                <p v-else>维修正在进行中...</p>
              </div>
            </div>

            <!-- 状态时间线 -->
            <a-steps
              :current="getCurrentStep()"
              size="small"
              :items="stepsItems"
            />
          </a-card>

          <!-- 订单信息 -->
          <a-card title="订单信息" class="info-card">
            <a-descriptions :column="{ xs: 1, sm: 2 }">
              <a-descriptions-item label="订单号">{{ order.order_no }}</a-descriptions-item>
              <a-descriptions-item label="提交时间">{{ order.created_at }}</a-descriptions-item>
              <a-descriptions-item label="问题类型">
                <a-tag color="blue">{{ order.category }}</a-tag>
                <a-tag>{{ order.sub_category }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="联系电话">
                <a :href="'tel:' + order.contact_phone">{{ order.contact_phone }}</a>
              </a-descriptions-item>
              <a-descriptions-item label="期望上门时间">{{ order.expect_time }}</a-descriptions-item>
              <a-descriptions-item label="预约时段">
                <a-tag color="cyan">{{ order.time_slot || '待确认' }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="维修师傅">
                {{ order.handler?.name || '待分配' }}
              </a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <h4>问题描述</h4>
            <p class="description-text">{{ order.description }}</p>

            <template v-if="order.images && order.images.length > 0">
              <h4>现场照片</h4>
              <div class="image-list">
                <img
                  v-for="(img, index) in order.images"
                  :key="index"
                  :src="img"
                  class="preview-image"
                  @click="previewImage(img)"
                />
              </div>
            </template>
          </a-card>

          <!-- 地址信息 -->
          <a-card title="服务地址" class="info-card">
            <p class="address-text">
              {{ order.address?.province }}{{ order.address?.city }}{{ order.address?.district }}{{ order.address?.detail }}
            </p>
          </a-card>

          <!-- 维修进度照片 -->
          <a-card v-if="order.progress_photos && order.progress_photos.length > 0" title="维修进度" class="info-card">
            <a-timeline>
              <a-timeline-item
                v-for="(photo, index) in order.progress_photos"
                :key="index"
                :color="index === order.progress_photos.length - 1 ? 'blue' : 'gray'"
              >
                <div class="progress-photo-item">
                  <div class="progress-photo-info">
                    <span class="progress-photo-time">{{ photo.uploaded_at }}</span>
                    <span class="progress-photo-by">{{ photo.uploaded_by }} 上传</span>
                  </div>
                  <img
                    :src="photo.url"
                    class="progress-photo-img"
                    @click="previewImage(photo.url)"
                  />
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-card>

          <!-- 维修备注 -->
          <a-card v-if="order.handle_note" title="维修备注" class="info-card">
            <p>{{ order.handle_note }}</p>
          </a-card>

          <!-- 评价区域 -->
          <a-card v-if="canReview" title="服务评价" class="info-card">
            <template v-if="review">
              <a-rate :value="review.rating" disabled />
              <div class="review-tags-display" v-if="review.tags && review.tags.length > 0">
                <a-tag v-for="tag in review.tags" :key="tag" color="blue">{{ tag }}</a-tag>
              </div>
              <p class="review-text">{{ review.content }}</p>
              <p class="review-time">评价时间：{{ review.created_at }}</p>
            </template>
            <template v-else>
              <a-form :model="reviewForm" layout="vertical">
                <a-form-item label="服务评分">
                  <a-rate v-model:value="reviewForm.rating" />
                </a-form-item>
                <a-form-item label="服务标签（可多选）">
                  <div class="tag-selection">
                    <a-checkable-tag
                      v-for="tag in presetTags"
                      :key="tag"
                      :checked="reviewForm.tags.includes(tag)"
                      @change="(checked) => handleTagChange(tag, checked)"
                    >
                      {{ tag }}
                    </a-checkable-tag>
                  </div>
                </a-form-item>
                <a-form-item label="评价内容">
                  <a-textarea
                    v-model:value="reviewForm.content"
                    placeholder="请对本次服务进行评价..."
                    :rows="3"
                  />
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" @click="handleSubmitReview" :loading="reviewLoading">
                    提交评价
                  </a-button>
                </a-form-item>
              </a-form>
            </template>
          </a-card>

          <!-- 操作按钮 -->
          <div class="action-buttons" v-if="order.status === 'pending'">
            <a-button danger size="large" @click="handleCancel" :loading="cancelLoading">
              取消订单
            </a-button>
          </div>
        </template>
      </a-spin>
    </div>

    <!-- 图片预览 -->
    <a-modal v-model:open="previewVisible" :footer="null" width="80%">
      <img :src="previewImageUrl" style="width: 100%" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons-vue'
import { orderApi, reviewTags } from '../../api/mock'
import { statusMap } from '../../utils/constants'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const order = ref(null)
const review = ref(null)
const reviewLoading = ref(false)
const cancelLoading = ref(false)
const previewVisible = ref(false)
const previewImageUrl = ref('')
const presetTags = reviewTags

const reviewForm = reactive({
  rating: 5,
  content: '',
  tags: []
})

const stepsItems = [
  { title: '提交订单' },
  { title: '师傅接单' },
  { title: '上门服务' },
  { title: '维修完成' }
]

const canReview = computed(() => {
  return order.value?.status === 'completed'
})

const getCurrentStep = () => {
  const stepMap = {
    pending: 1,
    accepted: 2,
    repairing: 3,
    completed: 4,
    cancelled: 1
  }
  return stepMap[order.value?.status] || 0
}

const loadOrder = async () => {
  loading.value = true
  try {
    const res = await orderApi.getDetail(route.params.id)
    if (res.code === 200) {
      order.value = res.data
      // 加载评价
      if (canReview.value) {
        const reviewRes = await orderApi.getReview(route.params.id)
        if (reviewRes.code === 200) {
          review.value = reviewRes.data
        }
      }
    } else {
      message.error('订单不存在')
      router.push('/orders')
    }
  } finally {
    loading.value = false
  }
}

const previewImage = (url) => {
  previewImageUrl.value = url
  previewVisible.value = true
}

const handleTagChange = (tag, checked) => {
  if (checked) {
    reviewForm.tags.push(tag)
  } else {
    reviewForm.tags = reviewForm.tags.filter(t => t !== tag)
  }
}

const handleCancel = () => {
  Modal.confirm({
    title: '确认取消',
    content: '确定要取消这个订单吗？',
    onOk: async () => {
      cancelLoading.value = true
      try {
        const res = await orderApi.cancel(order.value.id)
        if (res.code === 200) {
          message.success('订单已取消')
          loadOrder()
        } else {
          message.error(res.message)
        }
      } finally {
        cancelLoading.value = false
      }
    }
  })
}

const handleSubmitReview = async () => {
  if (!reviewForm.content) {
    message.warning('请输入评价内容')
    return
  }
  reviewLoading.value = true
  try {
    const res = await orderApi.addReview(
      order.value.id,
      reviewForm.rating,
      reviewForm.content,
      reviewForm.tags
    )
    if (res.code === 200) {
      message.success('评价成功')
      review.value = res.data
      loadOrder()
    }
  } finally {
    reviewLoading.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.detail-container {
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

.detail-content {
  max-width: 800px;
  margin: 24px auto;
  padding: 0 20px;
}

.status-card {
  margin-bottom: 20px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.status-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.status-bg-pending {
  background: #faad14;
}

.status-bg-accepted,
.status-bg-going,
.status-bg-repairing {
  background: #1890ff;
}

.status-bg-completed,
.status-bg-reviewed {
  background: #52c41a;
}

.status-bg-cancelled {
  background: #999;
}

.status-text h3 {
  font-size: 20px;
  margin-bottom: 4px;
}

.status-text p {
  color: #666;
  margin: 0;
}

.info-card {
  margin-bottom: 20px;
}

.info-card h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
}

.description-text {
  color: #666;
  line-height: 1.6;
}

.address-text {
  font-size: 16px;
  color: #333;
}

.image-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #e8e8e8;
}

.preview-image:hover {
  border-color: #1890ff;
}

.review-text {
  margin: 12px 0;
  color: #333;
  line-height: 1.6;
}

.review-time {
  color: #999;
  font-size: 12px;
}

.action-buttons {
  text-align: center;
  margin-top: 24px;
}

.progress-photo-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-photo-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.progress-photo-time {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.progress-photo-by {
  font-size: 12px;
  color: #999;
}

.progress-photo-img {
  width: 200px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #e8e8e8;
  transition: border-color 0.2s;
}

.progress-photo-img:hover {
  border-color: #1890ff;
}

.review-tags-display {
  margin: 8px 0;
}

.tag-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
