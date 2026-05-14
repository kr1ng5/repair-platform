<script setup>
import { ref, onMounted, watch } from 'vue'
import { BulbOutlined, BulbFilled } from '@ant-design/icons-vue'
import { initMockData } from './api/mock'

const isDark = ref(false)

onMounted(() => {
  initMockData()
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})

watch(isDark, (val) => {
  if (val) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'light')
  }
})
</script>

<template>
  <router-view />
  <div class="theme-toggle" @click="isDark = !isDark" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'">
    <BulbFilled v-if="isDark" style="color: #faad14" />
    <BulbOutlined v-else />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.theme-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  z-index: 9999;
  transition: all 0.3s;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .theme-toggle {
  background: #262626;
  color: #faad14;
}
</style>
