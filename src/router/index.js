import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  // 用户端路由
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/user/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/user/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/user/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/repair',
    name: 'Repair',
    component: () => import('../views/user/RepairForm.vue'),
    meta: { title: '提交报修', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/user/OrderList.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('../views/user/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/user/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('../views/user/Address.vue'),
    meta: { title: '地址管理', requiresAuth: true }
  },
  // 维修工后台路由
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/Login.vue'),
    meta: { title: '维修工登录' }
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/OrderManage.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'orders/:id',
        name: 'AdminOrderDetail',
        component: () => import('../views/admin/OrderDetail.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'schedule',
        name: 'AdminSchedule',
        component: () => import('../views/admin/Schedule.vue'),
        meta: { title: '日程管理' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/UserManage.vue'),
        meta: { title: '客户管理' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/Settings.vue'),
        meta: { title: '工作设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 水电维修平台` : '水电维修平台'

  const userToken = localStorage.getItem('user_token')
  const adminToken = localStorage.getItem('admin_token')

  if (to.meta.requiresAuth && !userToken) {
    next('/login')
  } else if (to.meta.requiresAdmin && !adminToken) {
    next('/admin/login')
  } else {
    next()
  }
})

export default router
