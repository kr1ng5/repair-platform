<template>
  <div class="repair-container">
    <!-- 顶部导航 -->
    <header class="page-header-bar">
      <div class="header-content">
        <a-breadcrumb>
          <a-breadcrumb-item><router-link to="/home">首页</router-link></a-breadcrumb-item>
          <a-breadcrumb-item>提交报修</a-breadcrumb-item>
        </a-breadcrumb>
        <div></div>
      </div>
    </header>

    <div class="repair-content">
      <a-card title="填写报修信息" :bordered="false">
        <a-form :model="form" :rules="rules" ref="formRef" layout="vertical" @finish="handleSubmit">
          <!-- 问题分类 -->
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="问题大类" name="category">
                <a-select v-model:value="form.category" placeholder="请选择问题大类" size="large" @change="handleCategoryChange">
                  <a-select-option value="水管">水管类</a-select-option>
                  <a-select-option value="电路">电路类</a-select-option>
                  <a-select-option value="地暖">地暖类</a-select-option>
                  <a-select-option value="其他">其他</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="问题小类" name="sub_category">
                <a-select v-model:value="form.sub_category" placeholder="请选择具体问题" size="large">
                  <a-select-option v-for="item in subCategories" :key="item" :value="item">{{ item }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 问题描述 -->
          <a-form-item label="问题描述" name="description">
            <a-textarea v-model:value="form.description" placeholder="请详细描述您遇到的问题，例如：厨房水龙头下方管道漏水，已经持续两天..." :rows="4" :maxlength="500" show-count />
          </a-form-item>

          <!-- 图片上传 -->
          <a-form-item label="现场照片（选填）">
            <a-upload v-model:file-list="fileList" list-type="picture-card" :before-upload="beforeUpload" :max-count="5">
              <div v-if="fileList.length < 5"><PlusOutlined /><div style="margin-top: 8px">上传照片</div></div>
            </a-upload>
            <div class="upload-tip">支持上传1-5张现场照片，帮助师傅更好地了解问题</div>
          </a-form-item>

          <!-- 地址信息 -->
          <a-form-item label="服务地址">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-select v-model:value="form.address.province" placeholder="省份" size="large" @change="handleProvinceChange">
                  <a-select-option v-for="p in provinces" :key="p" :value="p">{{ p }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="8">
                <a-select v-model:value="form.address.city" placeholder="城市" size="large" @change="handleCityChange">
                  <a-select-option v-for="c in cities" :key="c" :value="c">{{ c }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="8">
                <a-select v-model:value="form.address.district" placeholder="区/县" size="large">
                  <a-select-option v-for="d in districts" :key="d" :value="d">{{ d }}</a-select-option>
                </a-select>
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item label="详细地址" name="detail">
            <a-input v-model:value="form.address.detail" placeholder="请输入详细地址，如：XX小区XX栋XX室" size="large" />
          </a-form-item>

          <!-- 已有地址选择 -->
          <a-form-item label="常用地址" v-if="addressList.length > 0">
            <a-space>
              <a-tag v-for="addr in addressList" :key="addr.id" :color="selectedAddressId === addr.id ? 'blue' : 'default'" @click="selectAddress(addr)" style="cursor: pointer">
                {{ addr.detail }}
              </a-tag>
            </a-space>
          </a-form-item>

          <!-- 联系方式 -->
          <a-form-item label="联系电话" name="contact_phone">
            <a-input v-model:value="form.contact_phone" placeholder="请输入联系电话" size="large" :maxlength="11" />
          </a-form-item>

          <!-- 预约时间 -->
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="期望上门日期" name="expect_date">
                <a-date-picker v-model:value="form.expect_date" format="YYYY-MM-DD" placeholder="选择日期" size="large" style="width: 100%" :disabled-date="disabledDate" @change="handleDateChange" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="预约时段" name="time_slot">
                <a-select v-model:value="form.time_slot" placeholder="选择时间段" size="large" :disabled="!form.expect_date">
                  <a-select-option v-for="slot in availableSlots" :key="slot.label" :value="slot.label">
                    {{ slot.label }}
                  </a-select-option>
                </a-select>
                <div v-if="form.expect_date && availableSlots.length === 0" style="color: #ff4d4f; font-size: 12px; margin-top: 4px;">
                  该日期无可用时段，请选择其他日期
                </div>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 提交按钮 -->
          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" :loading="loading" block>
              提交报修
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { orderApi, addressApi, scheduleApi, defaultTimeSlots } from '../../api/mock'
import { categoryMap } from '../../utils/constants'
import { storage } from '../../utils/storage'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)
const fileList = ref([])
const addressList = ref([])
const selectedAddressId = ref('')
const availableSlots = ref(defaultTimeSlots)

const form = reactive({
  category: undefined,
  sub_category: undefined,
  description: '',
  images: [],
  address: { province: '广东省', city: '深圳市', district: '南山区', detail: '' },
  contact_phone: '',
  expect_date: null,
  time_slot: undefined
})

const rules = {
  category: [{ required: true, message: '请选择问题大类' }],
  sub_category: [{ required: true, message: '请选择具体问题' }],
  description: [{ required: true, message: '请描述问题' }],
  contact_phone: [{ required: true, message: '请输入联系电话' }],
  expect_date: [{ required: true, message: '请选择上门日期' }],
  time_slot: [{ required: true, message: '请选择预约时段' }]
}

const subCategories = computed(() => categoryMap[form.category] || [])

const provinces = ['广东省', '北京市', '上海市', '浙江省', '江苏省']
const cities = computed(() => {
  const cityMap = {
    '广东省': ['深圳市', '广州市', '东莞市', '佛山市'],
    '北京市': ['北京市'], '上海市': ['上海市'],
    '浙江省': ['杭州市', '宁波市', '温州市'],
    '江苏省': ['南京市', '苏州市', '无锡市']
  }
  return cityMap[form.address.province] || []
})
const districts = computed(() => {
  const districtMap = {
    '深圳市': ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'],
    '广州市': ['天河区', '越秀区', '海珠区', '白云区'],
    '东莞市': ['莞城区', '南城区', '东城区'],
    '佛山市': ['禅城区', '南海区', '顺德区'],
    '北京市': ['朝阳区', '海淀区', '东城区', '西城区'],
    '上海市': ['浦东新区', '黄浦区', '静安区', '徐汇区'],
    '杭州市': ['西湖区', '上城区', '下城区', '拱墅区'],
    '宁波市': ['海曙区', '江北区', '鄞州区'],
    '温州市': ['鹿城区', '龙湾区', '瓯海区'],
    '南京市': ['玄武区', '秦淮区', '鼓楼区', '建邺区'],
    '苏州市': ['姑苏区', '吴中区', '相城区', '虎丘区'],
    '无锡市': ['梁溪区', '锡山区', '惠山区', '滨湖区']
  }
  return districtMap[form.address.city] || []
})

onMounted(async () => {
  const user = storage.get('current_user')
  if (user) {
    form.contact_phone = user.phone
    const res = await addressApi.getList()
    if (res.code === 200) {
      addressList.value = res.data
      const defaultAddr = res.data.find(a => a.is_default)
      if (defaultAddr) selectAddress(defaultAddr)
    }
  }
  const { category, sub_category } = route.query
  if (category && categoryMap[category]) {
    form.category = category
    if (sub_category && categoryMap[category].includes(sub_category)) form.sub_category = sub_category
  }
})

const handleCategoryChange = () => { form.sub_category = undefined }
const handleCityChange = () => { form.district = undefined }

const selectAddress = (addr) => {
  selectedAddressId.value = addr.id
  form.address.province = addr.province
  form.address.city = addr.city
  form.address.district = addr.district
  form.address.detail = addr.detail
}

const handleProvinceChange = () => {
  form.address.city = cities.value[0] || ''
  form.address.district = districts.value[0] || ''
}

const disabledDate = (current) => current && current < dayjs().startOf('day')

const handleDateChange = async (date) => {
  form.time_slot = undefined
  if (!date) {
    availableSlots.value = defaultTimeSlots
    return
  }
  const dateStr = dayjs(date).format('YYYY-MM-DD')
  const res = await scheduleApi.getAvailableSlots(dateStr)
  if (res.code === 200) {
    availableSlots.value = res.data.length > 0 ? res.data : defaultTimeSlots
  }
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) { message.error('只能上传图片文件'); return false }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) { message.error('图片大小不能超过5MB'); return false }
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => { form.images.push(reader.result) }
  return false
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const dateStr = dayjs(form.expect_date).format('YYYY-MM-DD')
    // 检查时间段冲突
    const conflictRes = await scheduleApi.checkTimeConflict(dateStr, form.time_slot)
    if (conflictRes.conflict) {
      message.error(conflictRes.message)
      return
    }
    const data = {
      category: form.category,
      sub_category: form.sub_category,
      description: form.description,
      images: form.images,
      address: form.address,
      contact_phone: form.contact_phone,
      expect_time: `${dateStr} ${form.time_slot.split('-')[0]}`,
      time_slot: form.time_slot
    }
    const res = await orderApi.create(data)
    if (res.code === 200) {
      message.success('报修提交成功！')
      router.push('/orders')
    } else {
      message.error(res.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.repair-container { min-height: 100vh; background: #f5f5f5; }
.page-header-bar { background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); position: sticky; top: 0; z-index: 100; }
.page-header-bar .header-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
.page-header-bar h2 { font-size: 18px; font-weight: 600; margin: 0; }
.repair-content { max-width: 800px; margin: 24px auto; padding: 0 20px; }
.upload-tip { color: #999; font-size: 12px; margin-top: 8px; }
:deep(.ant-upload-select) { width: 120px !important; height: 120px !important; }
</style>
