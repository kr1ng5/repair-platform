<template>
  <div class="schedule-container">
    <h2>日程管理</h2>

    <a-row :gutter="24">
      <!-- 日历区域 -->
      <a-col :xs="24" :md="16">
        <a-card class="calendar-card" :bordered="false">
          <template #extra>
            <a-space>
              <a-button size="small" @click="goToToday">今天</a-button>
              <a-button size="small" @click="prevWeek"><LeftOutlined /></a-button>
              <a-button size="small" @click="nextWeek"><RightOutlined /></a-button>
              <span class="week-title">{{ weekTitle }}</span>
            </a-space>
          </template>

          <!-- 周视图 -->
          <div class="week-view">
            <div class="week-header">
              <div class="time-col">时间</div>
              <div v-for="day in weekDays" :key="day.date" class="day-col" :class="{ today: day.isToday, rest: day.isRestDay }">
                <div class="day-name">{{ day.dayName }}</div>
                <div class="day-date" :class="{ 'today-badge': day.isToday }">{{ day.dayNum }}</div>
                <a-tag v-if="day.isRestDay" color="orange" size="small">休息</a-tag>
              </div>
            </div>

            <div class="week-body">
              <div v-for="slot in timeSlots" :key="slot.label" class="time-row">
                <div class="time-label">{{ slot.label }}</div>
                <div v-for="day in weekDays" :key="day.date + slot.label" class="slot-cell" :class="{ 'is-today': day.isToday, 'is-rest': day.isRestDay }">
                  <template v-if="day.isRestDay">
                    <span class="rest-text">休息</span>
                  </template>
                  <template v-else>
                    <div
                      v-for="order in getOrdersForSlot(day.date, slot.label)"
                      :key="order.id"
                      class="slot-order"
                      :class="{ urgent: order.is_urgent, completed: order.status === 'completed' }"
                      @click="$router.push(`/admin/orders/${order.id}`)"
                    >
                      <div class="slot-order-title">{{ order.category }}-{{ order.sub_category }}</div>
                      <div class="slot-order-user">{{ order.user?.nickname }}</div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧面板 -->
      <a-col :xs="24" :md="8">
        <!-- 选中日期详情 -->
        <a-card :title="selectedDateTitle" class="detail-card" :bordered="false">
          <template #extra>
            <a-button size="small" :type="isSelectedRestDay ? 'default' : 'primary'" @click="toggleRestDay">
              {{ isSelectedRestDay ? '取消休息' : '设为休息日' }}
            </a-button>
          </template>

          <div v-if="isSelectedRestDay" class="rest-day-info">
            <CoffeeOutlined style="font-size: 24px; color: #faad14;" />
            <p>该日为休息日</p>
          </div>
          <template v-else>
            <div class="day-summary">
              <a-statistic title="订单数" :value="selectedDayOrders.length" style="display: inline-block; margin-right: 24px;" />
              <a-statistic title="紧急" :value="selectedDayOrders.filter(o => o.is_urgent).length" :value-style="{ color: '#ff4d4f' }" style="display: inline-block;" />
            </div>
            <a-divider />
            <a-list :data-source="selectedDayOrders" size="small" :split="true">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <a-space>
                        <a-tag :color="item.is_urgent ? 'red' : 'blue'" size="small">{{ item.time_slot }}</a-tag>
                        <a @click="$router.push(`/admin/orders/${item.id}`)">{{ item.order_no }}</a>
                        <a-tag v-if="item.is_urgent" color="red" size="small">紧急</a-tag>
                      </a-space>
                    </template>
                    <template #description>
                      <div>{{ item.category }} - {{ item.sub_category }}</div>
                      <div style="font-size: 12px; color: #999;">{{ item.user?.nickname }} · {{ item.contact_phone }}</div>
                    </template>
                  </a-list-item-meta>
                  <span :class="'status-' + item.status">{{ statusMap[item.status] }}</span>
                </a-list-item>
              </template>
              <template #empty>
                <a-empty description="当天暂无订单" />
              </template>
            </a-list>
          </template>
        </a-card>

        <!-- 休息日设置 -->
        <a-card title="休息日设置" class="rest-card" :bordered="false">
          <div v-if="restDays.length === 0" style="color: #999; text-align: center; padding: 16px;">暂无休息日</div>
          <div v-for="date in restDays" :key="date" class="rest-day-item">
            <span>{{ date }}</span>
            <a-button type="link" size="small" danger @click="handleRemoveRestDay(date)">移除</a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { LeftOutlined, RightOutlined, CoffeeOutlined } from '@ant-design/icons-vue'
import { scheduleApi } from '../../api/mock'
import { statusMap } from '../../utils/constants'

const weekOffset = ref(0)
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const scheduleData = ref({}) // { date: { orders: [], is_rest_day } }
const restDays = ref([])
const timeSlots = ref([])

const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const getWeekStart = (offset) => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

const weekStartDate = computed(() => getWeekStart(weekOffset.value))

const weekDays = computed(() => {
  const days = []
  const start = new Date(weekStartDate.value)
  const today = new Date().toISOString().slice(0, 10)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    days.push({
      date: dateStr,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      isToday: dateStr === today,
      isRestDay: restDays.value.includes(dateStr)
    })
  }
  return days
})

const weekTitle = computed(() => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  if (!start || !end) return ''
  return `${start.date.slice(5)} ~ ${end.date.slice(5)}`
})

const selectedDateTitle = computed(() => {
  const d = new Date(selectedDate.value)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${dayNames[d.getDay()]}`
})

const isSelectedRestDay = computed(() => restDays.value.includes(selectedDate.value))

const selectedDayOrders = computed(() => {
  const data = scheduleData.value[selectedDate.value]
  return data?.orders || []
})

const getOrdersForSlot = (date, slotLabel) => {
  const data = scheduleData.value[date]
  if (!data || data.is_rest_day) return []
  return data.orders.filter(o => o.time_slot === slotLabel)
}

const loadSchedule = async () => {
  const scheduleRes = await scheduleApi.getWorkSchedule()
  if (scheduleRes.code === 200) {
    timeSlots.value = scheduleRes.data.time_slots
    restDays.value = scheduleRes.data.rest_days
  }

  // Load each day of the week
  for (const day of weekDays.value) {
    const res = await scheduleApi.getDaySchedule(day.date)
    if (res.code === 200) {
      scheduleData.value[day.date] = res.data
    }
  }
}

const goToToday = () => {
  weekOffset.value = 0
  selectedDate.value = new Date().toISOString().slice(0, 10)
  loadSchedule()
}

const prevWeek = () => {
  weekOffset.value--
  loadSchedule()
}

const nextWeek = () => {
  weekOffset.value++
  loadSchedule()
}

const toggleRestDay = async () => {
  if (isSelectedRestDay.value) {
    await handleRemoveRestDay(selectedDate.value)
  } else {
    const res = await scheduleApi.setRestDay(selectedDate.value)
    if (res.code === 200) {
      message.success('已设为休息日')
      loadSchedule()
    }
  }
}

const handleRemoveRestDay = async (date) => {
  const res = await scheduleApi.removeRestDay(date)
  if (res.code === 200) {
    message.success('已取消休息日')
    loadSchedule()
  }
}

onMounted(() => { loadSchedule() })
</script>

<style scoped>
.schedule-container h2 { margin-bottom: 24px; font-size: 20px; }
.calendar-card, .detail-card, .rest-card { margin-bottom: 20px; border-radius: 8px; }
.week-title { font-size: 14px; color: #666; margin-left: 8px; }

.week-view { overflow-x: auto; }
.week-header { display: flex; border-bottom: 2px solid #f0f0f0; }
.time-col { width: 80px; flex-shrink: 0; padding: 8px; text-align: center; font-size: 12px; color: #999; }
.day-col { flex: 1; text-align: center; padding: 8px 4px; min-width: 80px; }
.day-col.today { background: #e6f7ff; }
.day-col.rest { background: #fff7e6; }
.day-name { font-size: 12px; color: #999; }
.day-date { font-size: 18px; font-weight: 600; margin: 4px 0; }
.today-badge { color: #1890ff; }

.week-body { border: 1px solid #f0f0f0; }
.time-row { display: flex; min-height: 60px; }
.time-row + .time-row { border-top: 1px solid #f0f0f0; }
.time-label { width: 80px; flex-shrink: 0; padding: 8px; text-align: center; font-size: 12px; color: #666; border-right: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: center; }
.slot-cell { flex: 1; padding: 4px; min-width: 80px; border-right: 1px solid #f0f0f0; cursor: pointer; }
.slot-cell:last-child { border-right: none; }
.slot-cell.is-today { background: #f6ffed; }
.slot-cell.is-rest { background: #fff7e6; display: flex; align-items: center; justify-content: center; }
.rest-text { color: #faad14; font-size: 12px; }

.slot-order {
  background: #e6f7ff; border-radius: 4px; padding: 4px 6px; margin-bottom: 2px;
  font-size: 11px; cursor: pointer; border-left: 3px solid #1890ff;
}
.slot-order:hover { background: #bae7ff; }
.slot-order.urgent { background: #fff1f0; border-left-color: #ff4d4f; }
.slot-order.completed { background: #f6ffed; border-left-color: #52c41a; }
.slot-order-title { font-weight: 500; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.slot-order-user { color: #666; font-size: 10px; }

.rest-day-info { text-align: center; padding: 24px 0; }
.rest-day-info p { margin-top: 8px; color: #999; }
.day-summary { display: flex; gap: 16px; }

.rest-day-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.rest-day-item:last-child { border-bottom: none; }
</style>
