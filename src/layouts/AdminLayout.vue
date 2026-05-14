<template>
  <a-layout class="admin-layout">
    <!-- 侧边栏 -->
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible breakpoint="lg" :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }">
      <div class="logo">
        <img src="/logo.svg" alt="logo" class="logo-img" />
        <span v-if="!collapsed">维修工作台</span>
      </div>

      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" @click="handleMenuClick">
        <a-menu-item key="dashboard">
          <DashboardOutlined />
          <span>工作台</span>
        </a-menu-item>
        <a-menu-item key="orders">
          <UnorderedListOutlined />
          <span>订单管理</span>
        </a-menu-item>
        <a-menu-item key="schedule">
          <CalendarOutlined />
          <span>日程管理</span>
        </a-menu-item>
        <a-menu-item key="users">
          <TeamOutlined />
          <span>客户管理</span>
        </a-menu-item>
        <a-menu-item key="settings">
          <SettingOutlined />
          <span>工作设置</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 右侧内容区 -->
    <a-layout :style="{ marginLeft: collapsed ? '80px' : '200px', transition: 'all 0.2s' }">
      <!-- 顶部栏 -->
      <a-layout-header class="admin-header">
        <div class="header-left">
          <a-button type="text" @click="collapsed = !collapsed" class="trigger-btn">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
          <a-breadcrumb>
            <a-breadcrumb-item>工作台</a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentTitle }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <a-dropdown>
            <a class="admin-info">
              <a-avatar :size="32" :style="{ backgroundColor: '#1890ff' }">
                {{ admin?.name?.charAt(0) || '王' }}
              </a-avatar>
              <span>{{ admin?.name || '王建国' }}</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="password" @click="passwordVisible = true">
                  <LockOutlined /> 修改密码
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="admin-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>

  <!-- 修改密码弹窗 -->
  <a-modal v-model:open="passwordVisible" title="修改密码" @ok="handleChangePassword" :confirmLoading="changingPassword" @cancel="resetPasswordForm">
    <a-form :model="passwordForm" layout="vertical">
      <a-form-item label="原密码" required>
        <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入原密码" />
      </a-form-item>
      <a-form-item label="新密码" required>
        <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码（至少6位）" />
      </a-form-item>
      <a-form-item label="确认新密码" required>
        <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ToolOutlined, DashboardOutlined, UnorderedListOutlined, CalendarOutlined,
  TeamOutlined, SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  DownOutlined, LogoutOutlined, LockOutlined
} from '@ant-design/icons-vue'
import { adminApi } from '../api/mock'
import { storage } from '../utils/storage'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const admin = ref(null)
const passwordVisible = ref(false)
const changingPassword = ref(false)
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const selectedKeys = computed(() => {
  const path = route.path
  if (path.includes('dashboard')) return ['dashboard']
  if (path.includes('orders')) return ['orders']
  if (path.includes('schedule')) return ['schedule']
  if (path.includes('users')) return ['users']
  if (path.includes('settings')) return ['settings']
  return ['dashboard']
})

const currentTitle = computed(() => {
  const path = route.path
  if (path.includes('dashboard')) return '工作台'
  if (path.includes('orders')) return '订单管理'
  if (path.includes('schedule')) return '日程管理'
  if (path.includes('users')) return '客户管理'
  if (path.includes('settings')) return '工作设置'
  return '工作台'
})

const loadAdmin = () => {
  const current = storage.get('current_admin')
  const settings = storage.get('settings')
  if (current && settings?.worker_name) {
    admin.value = { ...current, name: settings.worker_name }
  } else {
    admin.value = current
  }
}

onMounted(loadAdmin)

watch(() => route.path, loadAdmin)

const handleMenuClick = ({ key }) => { router.push(`/admin/${key}`) }

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('current_admin')
  message.success('已退出登录')
  router.push('/admin/login')
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const handleChangePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    message.warning('请填写完整信息')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    message.warning('新密码至少6位')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.warning('两次输入的密码不一致')
    return
  }
  changingPassword.value = true
  try {
    const res = await adminApi.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    if (res.code === 200) {
      message.success('密码修改成功')
      passwordVisible.value = false
      resetPasswordForm()
    } else {
      message.error(res.message)
    }
  } finally {
    changingPassword.value = false
  }
}
</script>

<style scoped>
.admin-layout { min-height: 100vh; }
.logo {
  height: 64px; display: flex; align-items: center; justify-content: center;
  gap: 8px; color: #fff; font-size: 18px; font-weight: 600; background: rgba(255, 255, 255, 0.1);
}
.logo-img { width: 32px; height: 32px; }
.admin-header {
  background: #fff; padding: 0 24px; display: flex; align-items: center;
  justify-content: space-between; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky; top: 0; z-index: 10;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.trigger-btn { font-size: 18px; cursor: pointer; }
.header-right { display: flex; align-items: center; }
.admin-info { display: flex; align-items: center; gap: 8px; color: #333; cursor: pointer; }
.admin-info:hover { color: #1890ff; }
.admin-content { margin: 24px; padding: 24px; background: #fff; border-radius: 8px; min-height: 280px; }
:deep(.ant-layout-sider-trigger) { background: #001529; }
</style>
