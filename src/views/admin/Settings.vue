<template>
  <div class="settings-container">
    <h2>工作设置</h2>

    <a-tabs v-model:activeKey="activeTab">
      <!-- 个人信息 -->
      <a-tab-pane key="profile" tab="个人信息">
        <a-card>
          <a-form :model="profile" layout="vertical" @finish="handleSaveProfile">
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item label="姓名">
                  <a-input v-model:value="profile.worker_name" placeholder="请输入姓名" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="联系电话">
                  <a-input v-model:value="profile.worker_phone" placeholder="请输入联系电话" :maxlength="11" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="客服电话">
                  <a-input v-model:value="profile.service_phone" placeholder="请输入客服电话" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="服务区域">
                  <a-input v-model:value="profile.service_areas" placeholder="如：深圳市" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="个人简介">
                  <a-textarea v-model:value="profile.description" :rows="3" placeholder="请输入个人简介" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-button type="primary" html-type="submit" :loading="savingProfile">保存</a-button>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 工作日设置 -->
      <a-tab-pane key="workdays" tab="工作日设置">
        <a-card>
          <a-form layout="vertical">
            <a-form-item label="每周工作日">
              <a-checkbox-group v-model:value="workSchedule.work_days" :options="dayOptions" />
            </a-form-item>
            <a-form-item label="可用时间段">
              <div v-for="(slot, index) in workSchedule.time_slots" :key="index" class="slot-item">
                <a-input v-model:value="slot.label" placeholder="如 09:00-11:00" style="width: 200px;" />
                <a-input v-model:value="slot.start" placeholder="开始时间" style="width: 120px;" />
                <span style="margin: 0 8px;">至</span>
                <a-input v-model:value="slot.end" placeholder="结束时间" style="width: 120px;" />
                <a-button type="link" danger @click="removeSlot(index)">删除</a-button>
              </div>
              <a-button type="dashed" @click="addSlot" style="margin-top: 8px;">
                <PlusOutlined /> 添加时间段
              </a-button>
            </a-form-item>
            <a-button type="primary" @click="handleSaveWorkSchedule" :loading="savingSchedule">保存工作日设置</a-button>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 休息日管理 -->
      <a-tab-pane key="restdays" tab="休息日管理">
        <a-card>
          <a-form layout="vertical" @finish="handleAddRestDay">
            <a-form-item label="添加休息日">
              <a-row :gutter="16">
                <a-col :span="16">
                  <a-date-picker v-model:value="newRestDay" style="width: 100%;" placeholder="选择日期" />
                </a-col>
                <a-col :span="8">
                  <a-button type="primary" html-type="submit" block>添加</a-button>
                </a-col>
              </a-row>
            </a-form-item>
          </a-form>

          <a-divider />

          <h4>已设置的休息日</h4>
          <div v-if="restDays.length === 0" style="color: #999; text-align: center; padding: 24px;">暂无休息日</div>
          <div v-for="date in restDays" :key="date" class="rest-day-item">
            <span>{{ date }}</span>
            <a-button type="link" size="small" danger @click="handleRemoveRestDay(date)">移除</a-button>
          </div>
        </a-card>
      </a-tab-pane>

      <!-- 修改密码 -->
      <a-tab-pane key="password" tab="修改密码">
        <a-card>
          <a-form :model="passwordForm" layout="vertical" @finish="handleChangePassword">
            <a-form-item label="原密码" required>
              <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入原密码" />
            </a-form-item>
            <a-form-item label="新密码" required>
              <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码（至少6位）" />
            </a-form-item>
            <a-form-item label="确认新密码" required>
              <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
            </a-form-item>
            <a-button type="primary" html-type="submit" :loading="changingPassword">修改密码</a-button>
          </a-form>
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { adminApi, scheduleApi } from '../../api/mock'

const activeTab = ref('profile')
const savingProfile = ref(false)
const savingSchedule = ref(false)
const changingPassword = ref(false)
const newRestDay = ref(null)
const restDays = ref([])

const profile = reactive({
  platform_name: '', worker_name: '', worker_phone: '',
  service_phone: '', service_areas: '', description: ''
})

const workSchedule = reactive({
  work_days: [1, 2, 3, 4, 5, 6],
  time_slots: []
})

const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const dayOptions = [
  { label: '周一', value: 1 }, { label: '周二', value: 2 }, { label: '周三', value: 3 },
  { label: '周四', value: 4 }, { label: '周五', value: 5 }, { label: '周六', value: 6 },
  { label: '周日', value: 0 }
]

const loadSettings = async () => {
  const res = await adminApi.getSettings()
  if (res.code === 200 && res.data) {
    Object.assign(profile, res.data)
    if (res.data.work_days) workSchedule.work_days = res.data.work_days
    if (res.data.time_slots) workSchedule.time_slots = [...res.data.time_slots]
  }
}

const loadRestDays = async () => {
  const res = await scheduleApi.getRestDays()
  if (res.code === 200) restDays.value = res.data
}

const handleSaveProfile = async () => {
  savingProfile.value = true
  try {
    const res = await adminApi.updateSettings({ ...profile })
    if (res.code === 200) message.success('保存成功')
  } finally {
    savingProfile.value = false
  }
}

const addSlot = () => {
  workSchedule.time_slots.push({ label: '', start: '', end: '' })
}

const removeSlot = (index) => {
  workSchedule.time_slots.splice(index, 1)
}

const handleSaveWorkSchedule = async () => {
  savingSchedule.value = true
  try {
    const res = await scheduleApi.updateWorkSchedule({
      work_days: workSchedule.work_days,
      time_slots: workSchedule.time_slots.filter(s => s.label && s.start && s.end)
    })
    if (res.code === 200) message.success('保存成功')
  } finally {
    savingSchedule.value = false
  }
}

const handleAddRestDay = async () => {
  if (!newRestDay.value) { message.warning('请选择日期'); return }
  const dateStr = dayjs(newRestDay.value).format('YYYY-MM-DD')
  const res = await scheduleApi.setRestDay(dateStr)
  if (res.code === 200) {
    message.success('添加成功')
    newRestDay.value = null
    loadRestDays()
  }
}

const handleRemoveRestDay = async (date) => {
  const res = await scheduleApi.removeRestDay(date)
  if (res.code === 200) {
    message.success('已移除')
    loadRestDays()
  }
}

const handleChangePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) { message.warning('请填写完整信息'); return }
  if (passwordForm.newPassword.length < 6) { message.warning('新密码至少6位'); return }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) { message.warning('两次输入的密码不一致'); return }
  changingPassword.value = true
  try {
    const res = await adminApi.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    if (res.code === 200) {
      message.success('密码修改成功')
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      message.error(res.message)
    }
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadSettings()
  loadRestDays()
})
</script>

<style scoped>
.settings-container h2 { margin-bottom: 24px; font-size: 20px; }
.slot-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.rest-day-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.rest-day-item:last-child { border-bottom: none; }
</style>
