<template>
  <div class="admin-login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.svg" alt="logo" style="width: 64px; height: 64px; margin-bottom: 12px;" />
        <h1>维修工作台</h1>
        <p>水电维修平台</p>
      </div>

      <a-form :model="form" @finish="handleLogin" layout="vertical">
        <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input
            v-model:value="form.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password
            v-model:value="form.password"
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

      <div class="login-footer">
        <a-divider>测试账号</a-divider>
        <p>管理员：admin / admin123</p>
        <p>维修工：dad / 123456</p>
      </div>

      <div class="back-link">
        <router-link to="/home">← 返回用户端</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { adminApi } from '../../api/mock'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await adminApi.login(form.username, form.password)
    if (res.code === 200) {
      message.success('登录成功')
      router.push('/admin/dashboard')
    } else {
      message.error(res.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #001529 0%, #002140 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  margin-top: 24px;
  text-align: center;
}

.login-footer p {
  color: #666;
  font-size: 13px;
  margin-bottom: 4px;
}

.back-link {
  text-align: center;
  margin-top: 24px;
}

.back-link a {
  color: #1890ff;
  text-decoration: none;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>
