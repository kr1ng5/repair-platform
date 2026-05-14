<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <header class="home-header">
      <div class="header-content">
        <div class="logo">
          <img src="/logo.svg" alt="logo" class="logo-img" />
          <span>水电维修平台</span>
        </div>
        <div class="header-right">
          <template v-if="isLoggedIn">
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索订单号、问题描述..."
              style="width: 240px; margin-right: 12px"
              @search="handleSearch"
              allow-clear
            />
            <a-popover placement="bottomRight" trigger="click">
              <template #content>
                <div class="notification-panel">
                  <div class="notif-header">
                    <span>消息通知</span>
                    <a-button type="link" size="small" @click="handleMarkAllRead">全部已读</a-button>
                  </div>
                  <div class="notif-list" v-if="notifications.length > 0">
                    <div v-for="n in notifications.slice(0, 8)" :key="n.id"
                      class="notif-item" :class="{ unread: !n.read }"
                      @click="handleNotifClick(n)">
                      <div class="notif-title">{{ n.title }}</div>
                      <div class="notif-content">{{ n.content }}</div>
                      <div class="notif-time">{{ n.created_at }}</div>
                    </div>
                  </div>
                  <div v-else class="notif-empty">暂无消息</div>
                </div>
              </template>
              <a-badge :count="unreadCount" :offset="[-4, 0]">
                <BellOutlined class="notification-bell" />
              </a-badge>
            </a-popover>
            <a-dropdown>
              <a class="user-info">
                <UserOutlined />
                <span>{{ currentUser?.nickname || '用户' }}</span>
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="orders" @click="$router.push('/orders')">
                    <UnorderedListOutlined /> 我的订单
                  </a-menu-item>
                  <a-menu-item key="profile" @click="$router.push('/profile')">
                    <SettingOutlined /> 个人中心
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout" @click="handleLogout">
                    <LogoutOutlined /> 退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <template v-else>
            <a-button type="primary" @click="$router.push('/login')">登录</a-button>
            <a-button @click="$router.push('/register')">注册</a-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主视觉区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>专业水电维修服务</h1>
        <p>快速响应，专业维修，让您的生活更安心</p>
        <a-button type="primary" size="large" @click="handleRepair">
          <FormOutlined /> 立即报修
        </a-button>
      </div>
    </section>

    <!-- 服务项目 -->
    <section class="services-section">
      <h2 class="section-title">服务项目</h2>
      <p class="section-subtitle">专业团队，为您提供全方位的水电维修服务</p>
      <div class="services-grid">
        <div class="service-card" v-for="service in services" :key="service.id" @click="goToRepair(service)" style="cursor: pointer">
          <div class="service-image-wrapper">
            <div class="service-image" :style="{ background: service.gradient }">
              <component :is="service.icon" class="service-icon-svg" />
            </div>
            <div class="service-badge" :style="{ background: service.color }">{{ service.badge }}</div>
          </div>
          <h3>{{ service.title }}</h3>
          <p>{{ service.desc }}</p>
          <ul class="service-features">
            <li v-for="(feature, idx) in service.features" :key="idx">
              <CheckCircleOutlined /> {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 平台优势 -->
    <section class="advantages-section">
      <h2 class="section-title">为什么选择我们</h2>
      <p class="section-subtitle">值得信赖的专业维修服务平台</p>
      <div class="advantages-grid">
        <div class="advantage-card" v-for="(item, index) in advantages" :key="index">
          <div class="advantage-image" :style="{ background: item.gradient }">
            <component :is="item.icon" class="advantage-icon-svg" />
          </div>
          <div class="advantage-content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
            <div class="advantage-stats">
              <span class="stats-number">{{ item.stats }}</span>
              <span class="stats-label">{{ item.statsLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 服务流程 -->
    <section class="process-section">
      <h2 class="section-title">服务流程</h2>
      <p class="section-subtitle">简单四步，轻松解决水电问题</p>
      <div class="process-grid">
        <div class="process-step" v-for="(step, index) in processSteps" :key="index">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-icon" :style="{ background: step.color }">
            <component :is="step.icon" />
          </div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 常见问题 -->
    <section class="faq-section">
      <h2 class="section-title">常见问题</h2>
      <p class="section-subtitle">您可能想了解的问题</p>
      <div class="faq-list">
        <a-collapse :bordered="false">
          <a-collapse-panel v-for="faq in faqs" :key="faq.key" :header="faq.question">
            {{ faq.answer }}
          </a-collapse-panel>
        </a-collapse>
      </div>
    </section>

    <!-- 用户评价 -->
    <section class="reviews-section">
      <h2 class="section-title">用户评价</h2>
      <p class="section-subtitle">
        平均评分 <span style="color: #faad14; font-weight: 600;">{{ homeStats.avgRating }}</span> 分，
        共 {{ homeStats.reviewCount }} 条评价
      </p>
      <div class="reviews-grid">
        <a-card v-for="review in reviews" :key="review.id" class="review-card">
          <a-rate :value="review.rating" disabled />
          <div class="review-tags" v-if="review.tags && review.tags.length > 0">
            <a-tag v-for="tag in review.tags" :key="tag" color="blue" size="small">{{ tag }}</a-tag>
          </div>
          <p class="review-content">{{ review.content }}</p>
          <div class="review-user">
            <a-avatar :style="{ backgroundColor: review.color }">
              {{ review.name.charAt(0) }}
            </a-avatar>
            <span>{{ review.name }}</span>
          </div>
        </a-card>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="home-footer">
      <p>© 2026 水电维修平台 - 专业水电维修服务</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ToolOutlined,
  UserOutlined,
  FormOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  LogoutOutlined,
  DropboxOutlined,
  ThunderboltOutlined,
  HomeOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UserSwitchOutlined,
  ToolOutlined as ToolIcon,
  SmileOutlined,
  BellOutlined
} from '@ant-design/icons-vue'
import { storage } from '../../utils/storage'
import { notificationApi, orderApi, adminApi } from '../../api/mock'

const router = useRouter()
const currentUser = ref(null)
const searchKeyword = ref('')
const notifications = ref([])
const unreadCount = ref(0)
const dynamicReviews = ref([])
const homeStats = ref({
  completedOrders: 0,
  workerCount: 0,
  avgRating: 5.0,
  reviewCount: 0
})

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user_token')
})

onMounted(async () => {
  currentUser.value = storage.get('current_user')
  if (isLoggedIn.value) {
    loadNotifications()
  }
  loadHomeData()
})

const loadNotifications = async () => {
  const [notifRes, countRes] = await Promise.all([
    notificationApi.getNotifications(),
    notificationApi.getUnreadCount()
  ])
  if (notifRes.code === 200) notifications.value = notifRes.data
  if (countRes.code === 200) unreadCount.value = countRes.data
}

const handleMarkAllRead = async () => {
  await notificationApi.markAllRead()
  loadNotifications()
}

const handleNotifClick = async (n) => {
  if (!n.read) {
    await notificationApi.markAsRead(n.id)
    loadNotifications()
  }
  if (n.order_id) {
    router.push(`/orders/${n.order_id}`)
  }
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    message.warning('请输入搜索关键词')
    return
  }
  router.push({ path: '/orders', query: { search: searchKeyword.value } })
}

const loadHomeData = async () => {
  const statsRes = await adminApi.getHomeStats()
  if (statsRes.code === 200) {
    homeStats.value = statsRes.data
    dynamicReviews.value = statsRes.data.recentReviews || []
  }
}

const services = [
  {
    id: 1,
    title: '水管维修',
    desc: '专业解决各种水管问题，保障家庭用水安全',
    icon: 'DropboxOutlined',
    color: '#1890ff',
    gradient: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    badge: '热门',
    features: ['漏水修复', '管道疏通', '水管安装'],
    category: '水管'
  },
  {
    id: 2,
    title: '电路维修',
    desc: '持证电工，快速排查电路故障隐患',
    icon: 'ThunderboltOutlined',
    color: '#faad14',
    gradient: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
    badge: '推荐',
    features: ['开关维修', '插座更换', '线路检修'],
    category: '电路'
  },
  {
    id: 3,
    title: '卫浴安装',
    desc: '专业卫浴设备安装与维修服务',
    icon: 'HomeOutlined',
    color: '#52c41a',
    gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    badge: '优质',
    features: ['马桶安装', '花洒更换', '洗手盆维修'],
    category: '其他',
    sub_category: '卫浴安装'
  },
  {
    id: 4,
    title: '地暖服务',
    desc: '专业地暖安装、维修、清洗一条龙服务',
    icon: 'SafetyOutlined',
    color: '#722ed1',
    gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
    badge: '新增',
    features: ['地暖安装', '地暖维修', '地暖清洗'],
    category: '地暖'
  }
]

const advantages = computed(() => [
  {
    icon: 'ClockCircleOutlined',
    title: '准时上门',
    desc: '预约时间准时到达，不浪费您的等待时间，有变动提前沟通',
    gradient: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    stats: '准时',
    statsLabel: '守时守信'
  },
  {
    icon: 'ToolOutlined',
    title: '手艺过硬',
    desc: '从事水电维修多年，水管、电路、地暖各类问题都能搞定',
    gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    stats: '200+',
    statsLabel: '维修案例'
  },
  {
    icon: 'CustomerServiceOutlined',
    title: '售后放心',
    desc: '维修后有问题随时联系，负责到底，让您没有后顾之忧',
    gradient: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
    stats: '负责',
    statsLabel: '全程跟踪'
  },
  {
    icon: 'SmileOutlined',
    title: '口碑相传',
    desc: '老客户推荐为主，实实在在做事，明明白白沟通',
    gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
    stats: `${homeStats.value.avgRating || 5.0}`,
    statsLabel: '客户评分'
  }
])

const reviewColors = ['#1890ff', '#52c41a', '#722ed1', '#faad14', '#13c2c2', '#ff4d4f']

const reviews = computed(() => {
  if (dynamicReviews.value.length > 0) {
    return dynamicReviews.value.map((r, i) => ({
      id: r.id,
      name: r.user_nickname || '匿名用户',
      rating: r.rating,
      content: r.content,
      color: reviewColors[i % reviewColors.length],
      tags: r.tags || []
    }))
  }
  return [
    { id: 1, name: '张三', rating: 5, content: '王师傅很专业，上门准时，很快就找到了漏水原因并修好了。', color: '#1890ff', tags: ['技术专业', '上门准时'] },
    { id: 2, name: '李四', rating: 5, content: '李师傅技术很好，开关修好了，还顺便帮我检查了其他几个插座。', color: '#52c41a', tags: ['技术专业', '态度友好'] },
    { id: 3, name: '王芳', rating: 4, content: '疏通效果不错，下水现在很顺畅。师傅态度也很好。', color: '#722ed1', tags: ['态度友好'] }
  ]
})

const processSteps = [
  { title: '提交报修', desc: '在线填写问题描述、上传照片、选择上门时间', icon: 'EditOutlined', color: '#1890ff' },
  { title: '师傅接单', desc: '专业维修师傅确认接单，提前联系沟通', icon: 'UserSwitchOutlined', color: '#52c41a' },
  { title: '上门维修', desc: '师傅准时上门，专业工具，规范操作', icon: 'ToolOutlined', color: '#faad14' },
  { title: '完成评价', desc: '维修完成，确认满意后评价，积累口碑', icon: 'SmileOutlined', color: '#722ed1' }
]

const faqs = [
  { key: '1', question: '维修师傅都是持证上岗吗？', answer: '是的，我们平台所有维修师傅都经过严格审核，持有相关职业资格证书，平均从业经验5年以上，您可以放心选择我们的服务。' },
  { key: '2', question: '维修费用怎么计算？', answer: '维修费用根据具体问题而定，师傅上门检查后会与您沟通确认费用，满意后再施工。' },
  { key: '3', question: '维修后有质保吗？', answer: '所有维修服务享受30天免费质保期，质保期内如因维修质量问题导致的故障，我们免费返修。' },
  { key: '4', question: '可以指定上门时间吗？', answer: '可以的，提交报修时您可以选择期望的上门时间，我们会尽量安排师傅在您指定的时间段上门服务。' },
  { key: '5', question: '如何取消订单？', answer: '在订单状态为"待接单"时，您可以直接在订单详情页取消订单。如果师傅已经接单，请联系客服处理。' },
  { key: '6', question: '服务覆盖哪些区域？', answer: '目前我们支持深圳市、广州市、北京市、上海市的主城区服务，后续会陆续开通更多城市。' }
]

const handleRepair = () => {
  if (!isLoggedIn.value) {
    message.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/repair')
}

const goToRepair = (service) => {
  if (!isLoggedIn.value) {
    message.warning('请先登录')
    router.push('/login')
    return
  }
  const query = { category: service.category }
  if (service.sub_category) query.sub_category = service.sub_category
  router.push({ path: '/repair', query })
}

const handleLogout = () => {
  localStorage.removeItem('user_token')
  localStorage.removeItem('current_user')
  message.success('已退出登录')
  router.push('/home')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 头部导航 */
.home-header {
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
  color: #1890ff;
}

.logo-img {
  width: 36px;
  height: 36px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  cursor: pointer;
}

.user-info:hover {
  color: #1890ff;
}

/* 主视觉区域 */
.hero-section {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 80px 20px;
  text-align: center;
  color: #fff;
}

.hero-content h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-content p {
  font-size: 20px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-content .ant-btn {
  height: 48px;
  padding: 0 40px;
  font-size: 18px;
  border-radius: 24px;
}

/* 服务项目 */
.services-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.section-subtitle {
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-bottom: 48px;
}

/* 服务项目 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.service-card {
  background: #fff;
  border-radius: 16px;
  padding: 0 24px 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.service-image-wrapper {
  position: relative;
  margin-bottom: 24px;
}

.service-image {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.service-image::before {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.service-icon-svg {
  font-size: 56px;
  color: #fff;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.service-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.service-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.service-card p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.service-features {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.service-features li {
  padding: 8px 0;
  color: #555;
  font-size: 14px;
  border-bottom: 1px dashed #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-features li:last-child {
  border-bottom: none;
}

.service-features li svg {
  color: #52c41a;
  font-size: 14px;
}

/* 平台优势 */
.advantages-section {
  background: #f8fafc;
  padding: 80px 20px;
}

.advantages-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.advantage-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.advantage-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.advantage-image {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.advantage-image::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.advantage-image::after {
  content: '';
  position: absolute;
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.advantage-icon-svg {
  font-size: 72px;
  color: #fff;
  z-index: 1;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

.advantage-content {
  padding: 24px;
}

.advantage-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.advantage-content p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.advantage-stats {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.stats-number {
  font-size: 28px;
  font-weight: 700;
  color: #1890ff;
}

.stats-label {
  font-size: 14px;
  color: #999;
}

/* 服务流程 */
.process-section {
  background: #f8fafc;
  padding: 80px 20px;
}

.process-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.process-step {
  text-align: center;
  position: relative;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.step-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 36px;
  color: #fff;
}

.process-step h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.process-step p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

/* 常见问题 */
.faq-section {
  max-width: 900px;
  margin: 0 auto;
  padding: 80px 20px;
}

.faq-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

:deep(.ant-collapse-header) {
  font-size: 16px !important;
  font-weight: 500 !important;
}

:deep(.ant-collapse-content-box) {
  color: #666;
  line-height: 1.8;
}

/* 用户评价 */
.reviews-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.review-card {
  border-radius: 12px;
}

.review-content {
  margin: 16px 0;
  color: #333;
  line-height: 1.6;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-user span {
  color: #666;
}

.review-tags {
  margin: 8px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 通知铃铛 */
.notification-bell {
  font-size: 20px;
  cursor: pointer;
  color: #333;
  padding: 4px 8px;
  transition: color 0.2s;
}

.notification-bell:hover {
  color: #1890ff;
}

.notification-panel {
  width: 360px;
  max-height: 400px;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
  font-weight: 600;
}

.notif-list {
  max-height: 320px;
  overflow-y: auto;
}

.notif-item {
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.notif-item:hover {
  background: #f5f7fa;
}

.notif-item.unread {
  background: #e6f7ff;
}

.notif-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.notif-content {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 4px;
}

.notif-time {
  font-size: 11px;
  color: #bbb;
}

.notif-empty {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

/* 底部 */
.home-footer {
  background: #001529;
  color: rgba(255, 255, 255, 0.65);
  text-align: center;
  padding: 24px 20px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .advantages-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .process-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 32px;
  }

  .hero-content p {
    font-size: 16px;
  }

  .section-title {
    font-size: 24px;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .advantages-grid {
    grid-template-columns: 1fr;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }

  .process-grid {
    grid-template-columns: 1fr;
  }

  .service-image {
    height: 140px;
  }

  .advantage-image {
    height: 150px;
  }
}
</style>
