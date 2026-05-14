<template>
  <div class="profile-container">
    <!-- 顶部导航 -->
    <header class="page-header-bar">
      <div class="header-content">
        <a-breadcrumb>
          <a-breadcrumb-item>
            <router-link to="/home">首页</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>个人中心</a-breadcrumb-item>
        </a-breadcrumb>
        <div></div>
      </div>
    </header>

    <div class="profile-content">
      <!-- 用户信息卡片 -->
      <a-card class="user-card">
        <div class="user-info">
          <a-avatar :size="80" :style="{ backgroundColor: '#1890ff' }">
            {{ user?.nickname?.charAt(0) || '用' }}
          </a-avatar>
          <div class="user-detail">
            <h3>{{ user?.nickname || '用户' }}</h3>
            <p>手机号：{{ user?.phone }}</p>
            <p>注册时间：{{ user?.created_at }}</p>
          </div>
        </div>
      </a-card>

      <!-- 功能菜单 -->
      <a-card class="menu-card">
        <a-menu mode="vertical" @click="handleMenuClick">
          <a-menu-item key="orders">
            <UnorderedListOutlined />
            <span>我的订单</span>
          </a-menu-item>
          <a-menu-item key="address">
            <EnvironmentOutlined />
            <span>地址管理</span>
          </a-menu-item>
          <a-menu-item key="edit">
            <EditOutlined />
            <span>编辑资料</span>
          </a-menu-item>
          <a-menu-item key="feedback">
            <MessageOutlined />
            <span>意见反馈</span>
          </a-menu-item>
          <a-menu-item key="about">
            <InfoCircleOutlined />
            <span>关于我们</span>
          </a-menu-item>
          <a-menu-item key="terms">
            <FileTextOutlined />
            <span>服务条款</span>
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item key="logout" danger>
            <LogoutOutlined />
            <span>退出登录</span>
          </a-menu-item>
        </a-menu>
      </a-card>
    </div>

    <!-- 编辑资料弹窗 -->
    <a-modal
      v-model:open="editVisible"
      title="编辑资料"
      @ok="handleSaveProfile"
      :confirmLoading="saving"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="昵称">
          <a-input v-model:value="editForm.nickname" placeholder="请输入昵称" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 意见反馈弹窗 -->
    <a-modal
      v-model:open="feedbackVisible"
      title="意见反馈"
      @ok="handleFeedback"
    >
      <a-form layout="vertical">
        <a-form-item label="反馈内容">
          <a-textarea
            v-model:value="feedbackContent"
            placeholder="请输入您的意见或建议..."
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 关于我们弹窗 -->
    <a-modal v-model:open="aboutVisible" title="关于我们" :footer="null">
      <div class="about-content">
        <h3>水电维修平台</h3>
        <p>版本：v1.0.0</p>
        <a-divider />
        <p>我们致力于为用户提供专业、便捷的水电维修服务，连接有需求的用户和专业的维修服务人员。</p>
        <a-divider />
        <p><strong>客服电话：</strong>400-888-9999</p>
        <p><strong>服务时间：</strong>08:00 - 22:00</p>
        <p><strong>服务区域：</strong>深圳市、广州市、北京市、上海市</p>
        <p><strong>公司地址：</strong>深圳市南山区科技园南区创新大厦A座12层</p>
        <a-divider />
        <p style="color: #999; font-size: 12px;">© 2026 水电维修平台 版权所有</p>
      </div>
    </a-modal>

    <!-- 服务条款弹窗 -->
    <a-modal v-model:open="termsVisible" title="服务条款" :footer="null" width="600px">
      <div class="terms-content">
        <h4>一、服务说明</h4>
        <p>本平台提供家庭水电维修服务的在线预约功能，用户可通过平台提交维修需求，维修人员通过后台系统接收并处理订单。</p>
        <h4>二、用户责任</h4>
        <p>1. 用户应提供真实、准确的联系信息和服务地址；</p>
        <p>2. 用户应在预约时间内确保有人在场配合维修；</p>
        <p>3. 用户应按照报价确认后的金额支付维修费用。</p>
        <h4>三、服务保障</h4>
        <p>1. 所有维修师傅持证上岗，经过严格审核；</p>
        <p>2. 维修费用明码标价，维修前确认报价；</p>
        <p>3. 维修服务享受30天免费质保。</p>
        <h4>四、免责声明</h4>
        <p>因用户原因导致的维修延误或无法完成，平台不承担责任。因不可抗力导致的服务中断，平台将及时通知用户并协商解决。</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  UnorderedListOutlined,
  EnvironmentOutlined,
  EditOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import { userApi } from '../../api/mock'
import { storage } from '../../utils/storage'

const router = useRouter()
const user = ref(null)
const editVisible = ref(false)
const feedbackVisible = ref(false)
const aboutVisible = ref(false)
const termsVisible = ref(false)
const saving = ref(false)
const feedbackContent = ref('')

const editForm = reactive({
  nickname: ''
})

onMounted(() => {
  user.value = storage.get('current_user')
  if (user.value) {
    editForm.nickname = user.value.nickname
  }
})

const handleMenuClick = ({ key }) => {
  switch (key) {
    case 'orders':
      router.push('/orders')
      break
    case 'address':
      router.push('/address')
      break
    case 'edit':
      editVisible.value = true
      break
    case 'feedback':
      feedbackVisible.value = true
      break
    case 'about':
      aboutVisible.value = true
      break
    case 'terms':
      termsVisible.value = true
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleSaveProfile = async () => {
  saving.value = true
  try {
    const res = await userApi.updateUserInfo({ nickname: editForm.nickname })
    if (res.code === 200) {
      message.success('保存成功')
      user.value = res.data
      editVisible.value = false
    }
  } finally {
    saving.value = false
  }
}

const handleFeedback = () => {
  if (!feedbackContent.value) {
    message.warning('请输入反馈内容')
    return
  }
  message.success('感谢您的反馈！')
  feedbackContent.value = ''
  feedbackVisible.value = false
}

const handleLogout = () => {
  localStorage.removeItem('user_token')
  localStorage.removeItem('current_user')
  message.success('已退出登录')
  router.push('/home')
}
</script>

<style scoped>
.profile-container {
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

.profile-content {
  max-width: 600px;
  margin: 24px auto;
  padding: 0 20px;
}

.user-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-detail h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.user-detail p {
  color: #666;
  margin-bottom: 4px;
  font-size: 14px;
}

.menu-card {
  border-radius: 8px;
}

:deep(.ant-menu-item) {
  height: 50px;
  line-height: 50px;
  font-size: 16px;
}

:deep(.ant-menu-item svg) {
  margin-right: 12px;
}

.about-content {
  text-align: center;
}

.about-content h3 {
  font-size: 20px;
  margin-bottom: 16px;
}

.about-content p {
  color: #666;
  margin-bottom: 8px;
}

.terms-content h4 {
  font-size: 16px;
  margin: 16px 0 8px;
  color: #333;
}

.terms-content h4:first-child {
  margin-top: 0;
}

.terms-content p {
  color: #666;
  line-height: 1.8;
  margin-bottom: 4px;
}
</style>
