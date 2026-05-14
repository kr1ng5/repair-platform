export const statusMap = {
  pending: '待接单',
  accepted: '已接单',
  repairing: '维修中',
  completed: '已完成',
  cancelled: '已取消'
}

export const statusColors = {
  pending: '#faad14',
  accepted: '#1890ff',
  repairing: '#13c2c2',
  completed: '#52c41a',
  cancelled: '#999'
}

export const categoryMap = {
  '水管': ['漏水', '堵塞', '安装', '更换', '其他'],
  '电路': ['开关不灵', '插座故障', '线路老化', '灯具维修', '其他'],
  '地暖': ['地暖安装', '地暖维修', '地暖清洗', '管道改造', '其他'],
  '其他': ['卫浴安装', '龙头更换', '安全检测', '其他']
}

export const phoneReg = /^1[3-9]\d{9}$/
