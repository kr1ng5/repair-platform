<template>
  <div class="admin-detail-container">
    <div class="page-header">
      <a-button type="link" @click="$router.push('/admin/orders')"><ArrowLeftOutlined /> 返回订单列表</a-button>
      <h2>订单详情</h2>
      <a-button :type="order?.is_urgent ? 'primary' : 'default'" :danger="order?.is_urgent" @click="handleToggleUrgent">
        <AlertOutlined /> {{ order?.is_urgent ? '取消紧急' : '标记紧急' }}
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <template v-if="order">
        <!-- 状态和操作 -->
        <a-card class="status-card">
          <a-row :gutter="24" align="middle">
            <a-col :flex="1">
              <div class="status-info">
                <span :class="'status-' + order.status" class="status-tag">{{ statusMap[order.status] }}</span>
                <span class="order-no">订单号：{{ order.order_no }}</span>
                <a-tag v-if="order.is_urgent" color="red">紧急</a-tag>
              </div>
            </a-col>
            <a-col>
              <a-space>
                <a-button v-if="order.status === 'pending'" type="primary" @click="showAcceptModal">接单</a-button>
                <a-button v-if="order.status === 'accepted'" type="primary" @click="handleUpdateStatus('repairing')">开始维修</a-button>
                <a-button v-if="order.status === 'repairing'" type="primary" @click="handleUpdateStatus('completed')">完成维修</a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-card>

        <!-- 订单信息 -->
        <a-card title="订单信息" class="info-card">
          <a-descriptions :column="{ xs: 1, sm: 2, md: 3 }">
            <a-descriptions-item label="问题类型">
              <a-tag color="blue">{{ order.category }}</a-tag> {{ order.sub_category }}
            </a-descriptions-item>
            <a-descriptions-item label="联系电话">
              <a :href="'tel:' + order.contact_phone" class="phone-link">
                <PhoneOutlined /> {{ order.contact_phone }}
              </a>
            </a-descriptions-item>
            <a-descriptions-item label="期望上门时间">{{ order.expect_time }}</a-descriptions-item>
            <a-descriptions-item label="预约时段">
              <a-tag color="cyan">{{ order.time_slot || '未设置' }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="预计维修时长">
              <a-space>
                <span>{{ order.expected_duration || 1 }} 小时</span>
                <a-button type="link" size="small" @click="showDurationModal">修改</a-button>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">{{ order.created_at }}</a-descriptions-item>
          </a-descriptions>

          <a-divider />
          <h4>问题描述</h4>
          <p class="description-text">{{ order.description }}</p>

          <template v-if="order.images && order.images.length > 0">
            <h4>现场照片</h4>
            <div class="image-list">
              <img v-for="(img, index) in order.images" :key="index" :src="img" class="preview-image" />
            </div>
          </template>
        </a-card>

        <!-- 客户信息 -->
        <a-card title="客户信息" class="info-card">
          <a-descriptions :column="{ xs: 1, sm: 2 }">
            <a-descriptions-item label="客户昵称">{{ order.user?.nickname || '-' }}</a-descriptions-item>
            <a-descriptions-item label="手机号">
              <a :href="'tel:' + (order.user?.phone || order.contact_phone)" class="phone-link">
                <PhoneOutlined /> {{ order.user?.phone || order.contact_phone }}
              </a>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 服务地址 -->
        <a-card title="服务地址" class="info-card">
          <p class="address-text">
            {{ order.address?.province }}{{ order.address?.city }}{{ order.address?.district }}{{ order.address?.detail }}
          </p>
          <a-button type="primary" size="small" style="margin-top: 8px" @click="handleOpenMap">
            <EnvironmentOutlined /> 导航到地址
          </a-button>
        </a-card>

        <!-- 维修进度照片 -->
        <a-card title="维修进度照片" class="info-card">
          <div v-if="order.progress_photos && order.progress_photos.length > 0" class="existing-photos">
            <a-timeline>
              <a-timeline-item v-for="(photo, index) in order.progress_photos" :key="index" :color="index === order.progress_photos.length - 1 ? 'blue' : 'gray'">
                <div class="photo-timeline-item">
                  <span class="photo-time">{{ photo.uploaded_at }}</span>
                  <span class="photo-by">{{ photo.uploaded_by }}</span>
                  <img :src="photo.url" class="photo-thumb" />
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
          <a-divider v-if="order.progress_photos && order.progress_photos.length > 0" />
          <div class="upload-section">
            <h4>上传进度照片</h4>
            <a-upload list-type="picture-card" :before-upload="beforePhotoUpload" :custom-request="handlePhotoUpload" :file-list="photoFileList" @change="handlePhotoListChange" :max-count="5">
              <div v-if="photoFileList.length < 5"><PlusOutlined /><div style="margin-top: 8px">上传照片</div></div>
            </a-upload>
            <a-button type="primary" style="margin-top: 12px" @click="handleSubmitPhotos" :loading="uploadingPhotos" :disabled="photoFileList.length === 0">
              提交照片（{{ photoFileList.length }}张）
            </a-button>
          </div>
        </a-card>

        <!-- 维修备注 -->
        <a-card title="维修备注" class="info-card">
          <a-textarea v-model:value="handleNote" placeholder="请输入维修备注..." :rows="3" />
          <a-button type="primary" style="margin-top: 12px" @click="handleSaveNote" :loading="savingNote">保存备注</a-button>
        </a-card>
      </template>
    </a-spin>

    <!-- 接单弹窗 -->
    <a-modal v-model:open="acceptVisible" title="确认接单" @ok="handleAccept" :confirmLoading="accepting">
      <a-form layout="vertical">
        <a-form-item label="预约时段">
          <a-select v-model:value="acceptForm.timeSlot" placeholder="选择时间段">
            <a-select-option v-for="slot in availableSlots" :key="slot.label" :value="slot.label">
              {{ slot.label }}
            </a-select-option>
          </a-select>
          <div v-if="conflictMessage" style="color: #ff4d4f; margin-top: 4px; font-size: 12px;">{{ conflictMessage }}</div>
        </a-form-item>
        <a-form-item label="预计维修时长（小时）">
          <a-input-number v-model:value="acceptForm.duration" :min="1" :max="8" style="width: 100%" />
        </a-form-item>
        <a-form-item label="接单备注">
          <a-textarea v-model:value="acceptForm.note" placeholder="已接单，将按时上门" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改时长弹窗 -->
    <a-modal v-model:open="durationVisible" title="修改维修时长" @ok="handleUpdateDuration" :confirmLoading="updatingDuration">
      <a-form layout="vertical">
        <a-form-item label="预计维修时长（小时）">
          <a-input-number v-model:value="editDuration" :min="1" :max="8" style="width: 100%" />
        </a-form-item>
        <a-form-item label="预约时段">
          <a-select v-model:value="editTimeSlot" placeholder="选择时间段">
            <a-select-option v-for="slot in availableSlots" :key="slot.label" :value="slot.label">
              {{ slot.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined, PlusOutlined, PhoneOutlined, EnvironmentOutlined, AlertOutlined } from '@ant-design/icons-vue'
import { orderApi, adminApi, scheduleApi, defaultTimeSlots } from '../../api/mock'
import { storage } from '../../utils/storage'
import { statusMap } from '../../utils/constants'

const route = useRoute()
const loading = ref(false)
const order = ref(null)
const handleNote = ref('')
const savingNote = ref(false)
const photoFileList = ref([])
const uploadingPhotos = ref(false)

// 接单弹窗
const acceptVisible = ref(false)
const accepting = ref(false)
const conflictMessage = ref('')
const availableSlots = ref([])
const acceptForm = ref({ timeSlot: '', duration: 1, note: '' })

// 时长修改弹窗
const durationVisible = ref(false)
const updatingDuration = ref(false)
const editDuration = ref(1)
const editTimeSlot = ref('')

const loadOrder = async () => {
  loading.value = true
  try {
    const res = await orderApi.getDetail(route.params.id)
    if (res.code === 200) {
      order.value = res.data
      handleNote.value = res.data.handle_note || ''
    } else {
      message.error('订单不存在')
    }
  } finally {
    loading.value = false
  }
}

const loadAvailableSlots = async () => {
  const date = order.value?.expect_time?.split(' ')[0]
  if (!date) {
    availableSlots.value = defaultTimeSlots
    return
  }
  const res = await scheduleApi.getAvailableSlots(date)
  if (res.code === 200) {
    availableSlots.value = res.data.length > 0 ? res.data : defaultTimeSlots
  }
}

const showAcceptModal = async () => {
  acceptForm.value = {
    timeSlot: order.value.time_slot || '',
    duration: order.value.expected_duration || 1,
    note: '已接单，将按时上门服务'
  }
  conflictMessage.value = ''
  await loadAvailableSlots()
  acceptVisible.value = true
}

const handleAccept = async () => {
  if (!acceptForm.value.timeSlot) {
    message.warning('请选择预约时段')
    return
  }
  // 检查冲突
  const date = order.value.expect_time?.split(' ')[0]
  const conflictRes = await scheduleApi.checkTimeConflict(date, acceptForm.value.timeSlot, order.value.id)
  if (conflictRes.conflict) {
    conflictMessage.value = conflictRes.message
    return
  }

  accepting.value = true
  try {
    const admin = storage.get('current_admin')
    const res = await adminApi.acceptOrder(order.value.id, admin.id, acceptForm.value.note, acceptForm.value.timeSlot, acceptForm.value.duration)
    if (res.code === 200) {
      message.success('接单成功')
      acceptVisible.value = false
      loadOrder()
    }
  } finally {
    accepting.value = false
  }
}

const handleUpdateStatus = async (status) => {
  const res = await adminApi.updateOrderStatus(order.value.id, status)
  if (res.code === 200) {
    message.success('状态更新成功')
    loadOrder()
  }
}

const handleToggleUrgent = async () => {
  const res = await adminApi.toggleUrgent(order.value.id)
  if (res.code === 200) {
    message.success(res.message)
    loadOrder()
  }
}

const handleSaveNote = async () => {
  savingNote.value = true
  try {
    const res = await adminApi.updateOrderStatus(order.value.id, order.value.status, handleNote.value)
    if (res.code === 200) message.success('备注保存成功')
  } finally {
    savingNote.value = false
  }
}

const showDurationModal = async () => {
  editDuration.value = order.value.expected_duration || 1
  editTimeSlot.value = order.value.time_slot || ''
  await loadAvailableSlots()
  durationVisible.value = true
}

const handleUpdateDuration = async () => {
  updatingDuration.value = true
  try {
    const res = await adminApi.updateOrderDuration(order.value.id, editDuration.value, editTimeSlot.value)
    if (res.code === 200) {
      message.success('更新成功')
      durationVisible.value = false
      loadOrder()
    }
  } finally {
    updatingDuration.value = false
  }
}

const handleOpenMap = () => {
  const addr = order.value?.address
  if (!addr) return
  const fullAddr = `${addr.province}${addr.city}${addr.district}${addr.detail}`
  window.open(`https://uri.amap.com/search?keyword=${encodeURIComponent(fullAddr)}`, '_blank')
}

const beforePhotoUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) message.error('只能上传图片文件')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) message.error('图片大小不能超过5MB')
  return isImage && isLt5M
}

const handlePhotoUpload = ({ file, onSuccess }) => {
  const reader = new FileReader()
  reader.onload = (e) => onSuccess(e.target.result)
  reader.readAsDataURL(file)
}

const handlePhotoListChange = ({ fileList }) => { photoFileList.value = fileList }

const handleSubmitPhotos = async () => {
  if (photoFileList.value.length === 0) return
  uploadingPhotos.value = true
  try {
    const photos = photoFileList.value.filter(f => f.status === 'done' && f.response).map(f => f.response)
    if (photos.length === 0) {
      message.warning('照片尚未上传完成')
      return
    }
    const res = await adminApi.uploadProgressPhotos(order.value.id, photos)
    if (res.code === 200) {
      message.success('照片上传成功')
      photoFileList.value = []
      loadOrder()
    }
  } finally {
    uploadingPhotos.value = false
  }
}

onMounted(() => { loadOrder() })
</script>

<style scoped>
.admin-detail-container { padding: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-header h2 { font-size: 20px; margin: 0; }
.status-card { margin-bottom: 20px; }
.status-info { display: flex; align-items: center; gap: 16px; }
.status-tag { padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 500; }
.order-no { color: #666; }
.info-card { margin-bottom: 20px; }
.info-card h4 { font-size: 16px; margin-bottom: 12px; color: #333; }
.description-text { color: #666; line-height: 1.6; }
.address-text { font-size: 16px; color: #333; }
.phone-link { color: #1890ff; font-weight: 500; }
.image-list { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
.preview-image { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #e8e8e8; }
.existing-photos { margin-bottom: 16px; }
.photo-timeline-item { display: flex; align-items: center; gap: 12px; }
.photo-time { font-size: 14px; color: #333; font-weight: 500; }
.photo-by { font-size: 12px; color: #999; }
.photo-thumb { width: 100px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid #e8e8e8; margin-left: auto; }
.upload-section h4 { font-size: 14px; color: #333; margin-bottom: 12px; }
</style>
