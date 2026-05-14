<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <img src="/logo.svg" alt="logo" style="width: 64px; height: 64px; margin-bottom: 12px;" />
        <h1>注册账号</h1>
        <p>创建您的账号，享受便捷的水电维修服务</p>
      </div>

      <a-form :model="form" @finish="handleRegister" layout="vertical">
        <a-form-item name="phone" :rules="[{ required: true, message: '请输入手机号' }, { pattern: phoneReg, message: '请输入正确的手机号' }]">
          <a-input
            v-model:value="form.phone"
            placeholder="请输入手机号"
            size="large"
            :maxlength="11"
          >
            <template #prefix>
              <MobileOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="nickname">
          <a-input
            v-model:value="form.nickname"
            placeholder="请输入昵称（选填）"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]">
          <a-input-password
            v-model:value="form.password"
            placeholder="请输入密码（至少6位）"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="confirmPassword" :rules="[{ required: true, message: '请确认密码' }, { validator: checkPassword }]">
          <a-input-password
            v-model:value="form.confirmPassword"
            placeholder="请再次输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            注册
          </a-button>
        </a-form-item>
      </a-form>

      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { MobileOutlined, UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userApi } from '../../api/mock'
import { phoneReg } from '../../utils/constants'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  phone: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const checkPassword = async (_rule, value) => {
  if (value && value !== form.password) {
    throw new Error('两次输入的密码不一致')
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    const res = await userApi.register(form.phone, form.password, form.nickname)
    if (res.code === 200) {
      message.success('注册成功，请登录')
      router.push('/login')
    } else {
      message.error(res.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h1 {
  font-size: 28px;
  color: #1890ff;
  margin-bottom: 8px;
}

.register-header p {
  color: #666;
  font-size: 14px;
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  color: #666;
  font-size: 14px;
}

.register-footer a {
  color: #1890ff;
  text-decoration: none;
  margin-left: 4px;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
