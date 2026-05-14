<template>
  <div class="address-container">
    <!-- 顶部导航 -->
    <header class="page-header-bar">
      <div class="header-content">
        <a-breadcrumb>
          <a-breadcrumb-item>
            <router-link to="/home">首页</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <router-link to="/profile">个人中心</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>地址管理</a-breadcrumb-item>
        </a-breadcrumb>
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined /> 新增地址
        </a-button>
      </div>
    </header>

    <div class="address-content">
      <a-spin :spinning="loading">
        <a-empty v-if="addresses.length === 0" description="暂无地址" />

        <a-card
          v-for="addr in addresses"
          :key="addr.id"
          class="address-card"
        >
          <div class="address-info">
            <div class="address-detail">
              <a-tag v-if="addr.is_default" color="red">默认</a-tag>
              <span class="address-text">
                {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
              </span>
            </div>
            <div class="address-actions">
              <a-button
                v-if="!addr.is_default"
                type="link"
                size="small"
                @click="handleSetDefault(addr.id)"
              >
                设为默认
              </a-button>
              <a-button type="link" size="small" @click="showEditModal(addr)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定删除该地址吗？"
                @confirm="handleDelete(addr.id)"
              >
                <a-button type="link" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </a-card>
      </a-spin>
    </div>

    <!-- 新增/编辑地址弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑地址' : '新增地址'"
      @ok="handleSubmit"
      :confirmLoading="submitting"
    >
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="省份">
              <a-select v-model:value="form.province" @change="handleProvinceChange">
                <a-select-option v-for="p in provinces" :key="p" :value="p">{{ p }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="城市">
              <a-select v-model:value="form.city" @change="handleCityChange">
                <a-select-option v-for="c in cities" :key="c" :value="c">{{ c }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="区/县">
              <a-select v-model:value="form.district">
                <a-select-option v-for="d in districts" :key="d" :value="d">{{ d }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="详细地址">
          <a-input v-model:value="form.detail" placeholder="请输入详细地址，如：XX小区XX栋XX室" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { addressApi } from '../../api/mock'

const loading = ref(false)
const addresses = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editId = ref('')

const form = reactive({
  province: '广东省',
  city: '深圳市',
  district: '南山区',
  detail: ''
})

const provinces = ['广东省', '北京市', '上海市', '浙江省', '江苏省']
const cities = computed(() => {
  const cityMap = {
    '广东省': ['深圳市', '广州市', '东莞市', '佛山市'],
    '北京市': ['北京市'],
    '上海市': ['上海市'],
    '浙江省': ['杭州市', '宁波市', '温州市'],
    '江苏省': ['南京市', '苏州市', '无锡市']
  }
  return cityMap[form.province] || []
})

const districts = computed(() => {
  const districtMap = {
    '深圳市': ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'],
    '广州市': ['天河区', '越秀区', '海珠区', '白云区'],
    '东莞市': ['莞城区', '南城区', '东城区'],
    '佛山市': ['禅城区', '南海区', '顺德区'],
    '北京市': ['朝阳区', '海淀区', '东城区', '西城区'],
    '上海市': ['浦东新区', '黄浦区', '静安区', '徐汇区'],
    '杭州市': ['西湖区', '上城区', '下城区', '拱墅区'],
    '宁波市': ['海曙区', '江北区', '鄞州区'],
    '温州市': ['鹿城区', '龙湾区', '瓯海区'],
    '南京市': ['玄武区', '秦淮区', '鼓楼区', '建邺区'],
    '苏州市': ['姑苏区', '吴中区', '相城区', '虎丘区'],
    '无锡市': ['梁溪区', '锡山区', '惠山区', '滨湖区']
  }
  return districtMap[form.city] || []
})

const loadAddresses = async () => {
  loading.value = true
  try {
    const res = await addressApi.getList()
    if (res.code === 200) {
      addresses.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const showAddModal = () => {
  isEdit.value = false
  editId.value = ''
  form.province = '广东省'
  form.city = '深圳市'
  form.district = '南山区'
  form.detail = ''
  modalVisible.value = true
}

const showEditModal = (addr) => {
  isEdit.value = true
  editId.value = addr.id
  form.province = addr.province
  form.city = addr.city
  form.district = addr.district
  form.detail = addr.detail
  modalVisible.value = true
}

const handleProvinceChange = () => {
  form.city = cities.value[0] || ''
  form.district = districts.value[0] || ''
}

const handleCityChange = () => {
  form.district = districts.value[0] || ''
}

const handleSubmit = async () => {
  if (!form.detail) {
    message.warning('请输入详细地址')
    return
  }
  submitting.value = true
  try {
    let res
    if (isEdit.value) {
      res = await addressApi.update(editId.value, { ...form })
    } else {
      res = await addressApi.add({ ...form })
    }
    if (res.code === 200) {
      message.success(isEdit.value ? '编辑成功' : '添加成功')
      modalVisible.value = false
      loadAddresses()
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  const res = await addressApi.remove(id)
  if (res.code === 200) {
    message.success('删除成功')
    loadAddresses()
  }
}

const handleSetDefault = async (id) => {
  const res = await addressApi.setDefault(id)
  if (res.code === 200) {
    message.success('设置成功')
    loadAddresses()
  }
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.address-container {
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

.address-content {
  max-width: 800px;
  margin: 24px auto;
  padding: 0 20px;
}

.address-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.address-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-detail {
  display: flex;
  align-items: center;
  gap: 12px;
}

.address-text {
  font-size: 16px;
  color: #333;
}

.address-actions {
  display: flex;
  gap: 8px;
}
</style>
