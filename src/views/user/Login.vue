<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.svg" alt="logo" style="width: 64px; height: 64px; margin-bottom: 12px;" />
        <h1>水电维修平台</h1>
        <p>专业水电维修服务，让生活更美好</p>
      </div>

      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="phone" tab="手机号登录">
          <a-form :model="phoneForm" @finish="handlePhoneLogin" layout="vertical">
            <a-form-item name="phone" :rules="[{ required: true, message: '请输入手机号' }, { pattern: phoneReg, message: '请输入正确的手机号' }]">
              <a-input
                v-model:value="phoneForm.phone"
                placeholder="请输入手机号"
                size="large"
                :maxlength="11"
              >
                <template #prefix>
                  <MobileOutlined />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
              <a-input-password
                v-model:value="phoneForm.password"
                placeholder="请输入密码"
                size="large"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" size="large" block :loading="loading">
                登录
              </a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="sms" tab="验证码登录">
          <a-form :model="smsForm" @finish="handleSmsLogin" layout="vertical">
            <a-form-item name="phone" :rules="[{ required: true, message: '请输入手机号' }, { pattern: phoneReg, message: '请输入正确的手机号' }]">
              <a-input
                v-model:value="smsForm.phone"
                placeholder="请输入手机号"
                size="large"
                :maxlength="11"
              >
                <template #prefix>
                  <MobileOutlined />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="code" :rules="[{ required: true, message: '请输入验证码' }]">
              <a-input-group compact>
                <a-input
                  v-model:value="smsForm.code"
                  placeholder="请输入验证码"
                  size="large"
                  style="width: 60%"
                  :maxlength="6"
                >
                  <template #prefix>
                    <SafetyOutlined />
                  </template>
                </a-input>
                <a-button
                  size="large"
                  style="width: 40%"
                  :disabled="countdown > 0"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </a-button>
              </a-input-group>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" size="large" block :loading="loading">
                登录
              </a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>

      <a-divider>其他登录方式</a-divider>
      <div class="third-login">
        <a-button disabled block size="large" class="wechat-btn">
          <template #icon><WechatOutlined /></template>
          微信登录（即将开放）
        </a-button>
      </div>

      <div class="login-footer">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
        <span class="divider">|</span>
        <router-link to="/admin/login">管理端登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { MobileOutlined, LockOutlined, SafetyOutlined, WechatOutlined } from '@ant-design/icons-vue'
import { userApi } from '../../api/mock'
import { phoneReg } from '../../utils/constants'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('phone')
const countdown = ref(0)

const phoneForm = reactive({
  phone: '',
  password: ''
})

const smsForm = reactive({
  phone: '',
  code: ''
})

// 密码登录
const handlePhoneLogin = async () => {
  loading.value = true
  try {
    const res = await userApi.login(phoneForm.phone, phoneForm.password)
    if (res.code === 200) {
      message.success('登录成功')
      router.push('/home')
    } else {
      message.error(res.message)
    }
  } finally {
    loading.value = false
  }
}

// 验证码登录（模拟）
const handleSmsLogin = async () => {
  if (smsForm.code !== '123456') {
    message.error('验证码错误，正确验证码为 123456')
    return
  }
  loading.value = true
  try {
    const res = await userApi.login(smsForm.phone, '123456')
    if (res.code === 200) {
      message.success('登录成功')
      router.push('/home')
    } else {
      // 自动注册并登录
      const regRes = await userApi.register(smsForm.phone, '123456')
      if (regRes.code === 200) {
        await userApi.login(smsForm.phone, '123456')
        message.success('登录成功')
        router.push('/home')
      }
    }
  } finally {
    loading.value = false
  }
}

// 发送验证码（模拟）
const handleSendCode = () => {
  if (!smsForm.phone) {
    message.warning('请先输入手机号')
    return
  }
  message.success('验证码已发送，测试验证码为 123456')
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 28px;
  color: #1890ff;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  color: #666;
  font-size: 14px;
}

.login-footer a {
  color: #1890ff;
  text-decoration: none;
  margin: 0 4px;
}

.login-footer a:hover {
  text-decoration: underline;
}

.login-footer .divider {
  margin: 0 8px;
  color: #d9d9d9;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.ant-tabs-tab) {
  font-size: 16px;
}

.third-login {
  margin-bottom: 16px;
}

.wechat-btn {
  background: #07c160 !important;
  border-color: #07c160 !important;
  color: #fff !important;
  opacity: 0.6;
}
</style>
