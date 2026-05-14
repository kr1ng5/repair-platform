import { storage, generateId, generateOrderNo } from '../utils/storage'

// 初始化 Mock 数据
export const initMockData = () => {
  if (!storage.get('users')) {
    storage.set('users', [
      { id: '1', phone: '13800138000', password: '123456', nickname: '张三', avatar: '', role: 'user', created_at: '2026-01-15 10:30:00' },
      { id: '2', phone: '13900139000', password: '123456', nickname: '李四', avatar: '', role: 'user', created_at: '2026-02-20 14:20:00' },
      { id: '3', phone: '15800158000', password: '123456', nickname: '王芳', avatar: '', role: 'user', created_at: '2026-03-05 09:10:00' },
      { id: '4', phone: '18600186000', password: '123456', nickname: '赵明', avatar: '', role: 'user', created_at: '2026-03-18 16:45:00' },
      { id: '5', phone: '13500135000', password: '123456', nickname: '陈静', avatar: '', role: 'user', created_at: '2026-04-02 11:20:00' },
      { id: '6', phone: '17700177000', password: '123456', nickname: '刘伟', avatar: '', role: 'user', created_at: '2026-04-20 08:30:00' }
    ])
  }

  if (!storage.get('admins')) {
    storage.set('admins', [
      { id: '1', username: 'admin', password: 'admin123', name: '系统管理员', role: 'super_admin', phone: '13100131000', created_at: '2026-01-01 00:00:00' },
      { id: '2', username: 'dad', password: '123456', name: '王建国', role: 'worker', phone: '13700137000', skills: ['水管维修', '电路维修', '地暖安装', '卫浴安装'], created_at: '2026-01-10 00:00:00' }
    ])
  }

  if (!storage.get('orders')) {
    storage.set('orders', [
      {
        id: '1', order_no: 'WX20260428001', user_id: '1', category: '水管', sub_category: '漏水',
        description: '厨房水龙头下方管道漏水，已经持续两天了，地板都有些渗水',
        images: [], address: { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园南区翠谷居3栋502' },
        contact_phone: '13800138000', expect_time: '2026-04-29 09:00', time_slot: '09:00-11:00',
        status: 'completed', handler_id: '2', handle_note: '已更换密封圈和连接管，问题解决，建议定期检查',
        expected_duration: 2, is_urgent: false, progress_photos: [],
        created_at: '2026-04-28 10:30:00', updated_at: '2026-04-30 17:00:00'
      },
      {
        id: '2', order_no: 'WX20260502002', user_id: '2', category: '电路', sub_category: '开关不灵',
        description: '卧室灯开关按下去弹不回来，时好时坏，已经影响正常使用',
        images: [], address: { province: '广东省', city: '深圳市', district: '福田区', detail: '华强北赛格广场后面荔村小区12栋301' },
        contact_phone: '13900139000', expect_time: '2026-05-03 14:00', time_slot: '14:00-16:00',
        status: 'completed', handler_id: '2', handle_note: '开关内部弹簧老化，已更换新开关面板',
        expected_duration: 1, is_urgent: false, progress_photos: [],
        created_at: '2026-05-02 08:15:00', updated_at: '2026-05-04 11:00:00'
      },
      {
        id: '3', order_no: 'WX20260505003', user_id: '3', category: '水管', sub_category: '堵塞',
        description: '卫生间下水道堵塞，排水很慢，洗澡时积水严重',
        images: [], address: { province: '广东省', city: '广州市', district: '天河区', detail: '天河城东侧天河新苑B座804' },
        contact_phone: '15800158000', expect_time: '2026-05-06 10:00', time_slot: '10:00-12:00',
        status: 'completed', handler_id: '2', handle_note: '使用专业疏通设备清理，管道恢复正常排水',
        expected_duration: 2, is_urgent: false, progress_photos: [],
        created_at: '2026-05-05 09:20:00', updated_at: '2026-05-07 15:30:00'
      },
      {
        id: '4', order_no: 'WX20260508004', user_id: '4', category: '电路', sub_category: '插座故障',
        description: '客厅电视墙插座没电了，其他插座正常，怀疑线路问题',
        images: [], address: { province: '广东省', city: '深圳市', district: '南山区', detail: '后海大道海月花园二期6栋1503' },
        contact_phone: '18600186000', expect_time: '2026-05-09 15:00', time_slot: '15:00-17:00',
        status: 'completed', handler_id: '2', handle_note: '插座内部接线松动，已重新接线并测试正常',
        expected_duration: 1, is_urgent: false, progress_photos: [],
        created_at: '2026-05-08 11:00:00', updated_at: '2026-05-10 10:00:00'
      },
      {
        id: '5', order_no: 'WX20260509005', user_id: '5', category: '其他', sub_category: '卫浴安装',
        description: '新买的智能马桶需要安装，旧马桶需要拆除',
        images: [], address: { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园南区翠谷居5栋102' },
        contact_phone: '13500135000', expect_time: '2026-05-10 09:00', time_slot: '09:00-12:00',
        status: 'completed', handler_id: '2', handle_note: '旧马桶已拆除，新智能马桶安装完成，测试冲水和加热功能正常',
        expected_duration: 3, is_urgent: false, progress_photos: [],
        created_at: '2026-05-09 14:30:00', updated_at: '2026-05-11 12:00:00'
      },
      {
        id: '6', order_no: 'WX20260510006', user_id: '1', category: '电路', sub_category: '线路老化',
        description: '老房子电路经常跳闸，尤其开空调的时候，担心有安全隐患',
        images: [], address: { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园南区翠谷居3栋502' },
        contact_phone: '13800138000', expect_time: '2026-05-12 09:00', time_slot: '09:00-12:00',
        status: 'completed', handler_id: '2', handle_note: '主线路老化严重，已更换入户主线和配电箱空开，安全隐患排除',
        expected_duration: 3, is_urgent: true,
        progress_photos: [
          { url: 'https://via.placeholder.com/300x200/ff6b6b/fff?text=老化线路', uploaded_at: '2026-05-12 10:30:00', uploaded_by: '王建国' },
          { url: 'https://via.placeholder.com/300x200/4ecdc4/fff?text=更换主线', uploaded_at: '2026-05-12 14:00:00', uploaded_by: '王建国' },
          { url: 'https://via.placeholder.com/300x200/45b7d1/fff?text=新配电箱', uploaded_at: '2026-05-12 17:00:00', uploaded_by: '王建国' }
        ],
        created_at: '2026-05-10 10:30:00', updated_at: '2026-05-12 18:00:00'
      },
      {
        id: '7', order_no: 'WX20260511007', user_id: '6', category: '水管', sub_category: '漏水',
        description: '卫生间天花板漏水，楼上说不是他们的问题，需要排查原因',
        images: [], address: { province: '广东省', city: '深圳市', district: '福田区', detail: '景田北路天健花园2栋701' },
        contact_phone: '17700177000', expect_time: '2026-05-13 10:00', time_slot: '10:00-12:00',
        status: 'completed', handler_id: '2', handle_note: '排查发现是楼上防水层破损导致，已协助业主沟通并修复防水',
        expected_duration: 2, is_urgent: false, progress_photos: [],
        created_at: '2026-05-11 16:00:00', updated_at: '2026-05-13 14:00:00'
      },
      {
        id: '8', order_no: 'WX20260512008', user_id: '2', category: '电路', sub_category: '灯具维修',
        description: '客厅吊灯有一个灯泡不亮了，换过新灯泡还是不亮，应该是线路问题',
        images: [], address: { province: '广东省', city: '深圳市', district: '福田区', detail: '华强北赛格广场后面荔村小区12栋301' },
        contact_phone: '13900139000', expect_time: '2026-05-14 14:00', time_slot: '14:00-16:00',
        status: 'accepted', handler_id: '2', handle_note: '已接单，预计明天下午上门检修',
        expected_duration: 1, is_urgent: false, progress_photos: [],
        created_at: '2026-05-12 08:15:00', updated_at: '2026-05-12 09:30:00'
      },
      {
        id: '9', order_no: 'WX20260512009', user_id: '3', category: '水管', sub_category: '安装',
        description: '厨房需要安装一个新的洗碗机，需要改水路和电路',
        images: [], address: { province: '广东省', city: '广州市', district: '天河区', detail: '天河城东侧天河新苑B座804' },
        contact_phone: '15800158000', expect_time: '2026-05-15 09:00', time_slot: '09:00-12:00',
        status: 'accepted', handler_id: '2', handle_note: '已接单，需要先上门查看水路情况再施工',
        expected_duration: 3, is_urgent: false, progress_photos: [],
        created_at: '2026-05-12 11:00:00', updated_at: '2026-05-12 14:00:00'
      },
      {
        id: '10', order_no: 'WX20260513010', user_id: '4', category: '水管', sub_category: '更换',
        description: '厨房水龙头用了好几年了，出水越来越小，想换个新的',
        images: [], address: { province: '广东省', city: '深圳市', district: '南山区', detail: '后海大道海月花园二期6栋1503' },
        contact_phone: '18600186000', expect_time: '2026-05-15 14:00', time_slot: '14:00-16:00',
        status: 'repairing', handler_id: '2', handle_note: '正在维修中',
        expected_duration: 1, is_urgent: false,
        progress_photos: [
          { url: 'https://via.placeholder.com/300x200/ff9a9e/fff?text=旧水龙头', uploaded_at: '2026-05-15 14:20:00', uploaded_by: '王建国' }
        ],
        created_at: '2026-05-13 08:00:00', updated_at: '2026-05-15 14:20:00'
      },
      {
        id: '11', order_no: 'WX20260513011', user_id: '5', category: '电路', sub_category: '开关不灵',
        description: '卫生间浴霸开关坏了，灯暖和换气都开不了',
        images: [], address: { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园南区翠谷居5栋102' },
        contact_phone: '13500135000', expect_time: '2026-05-16 10:00', time_slot: '10:00-12:00',
        status: 'repairing', handler_id: '2', handle_note: '正在更换浴霸开关面板',
        expected_duration: 1, is_urgent: false,
        progress_photos: [
          { url: 'https://via.placeholder.com/300x200/a18cd1/fff?text=拆卸中', uploaded_at: '2026-05-16 10:30:00', uploaded_by: '王建国' }
        ],
        created_at: '2026-05-13 09:30:00', updated_at: '2026-05-16 10:30:00'
      },
      {
        id: '12', order_no: 'WX20260513012', user_id: '6', category: '其他', sub_category: '龙头更换',
        description: '阳台洗衣机水龙头漏水，关不紧，需要更换',
        images: [], address: { province: '广东省', city: '深圳市', district: '福田区', detail: '景田北路天健花园2栋701' },
        contact_phone: '17700177000', expect_time: '2026-05-16 15:00', time_slot: '15:00-17:00',
        status: 'pending', handler_id: '', handle_note: '',
        expected_duration: 1, is_urgent: false, progress_photos: [],
        created_at: '2026-05-13 10:00:00', updated_at: '2026-05-13 10:00:00'
      },
      {
        id: '13', order_no: 'WX20260513013', user_id: '1', category: '水管', sub_category: '堵塞',
        description: '厨房洗菜池下水慢，用了管道疏通剂效果不好',
        images: [], address: { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园南区翠谷居3栋502' },
        contact_phone: '13800138000', expect_time: '2026-05-17 09:00', time_slot: '09:00-11:00',
        status: 'pending', handler_id: '', handle_note: '',
        expected_duration: 2, is_urgent: false, progress_photos: [],
        created_at: '2026-05-13 11:30:00', updated_at: '2026-05-13 11:30:00'
      },
      {
        id: '14', order_no: 'WX20260511014', user_id: '4', category: '电路', sub_category: '插座故障',
        description: '卧室床头插座松动，充电器插上去容易掉',
        images: [], address: { province: '广东省', city: '深圳市', district: '南山区', detail: '后海大道海月花园二期6栋1503' },
        contact_phone: '18600186000', expect_time: '2026-05-12 10:00', time_slot: '10:00-12:00',
        status: 'cancelled', handler_id: '', handle_note: '',
        expected_duration: 1, is_urgent: false, progress_photos: [],
        created_at: '2026-05-11 19:00:00', updated_at: '2026-05-12 08:00:00'
      },
      {
        id: '15', order_no: 'WX20260513015', user_id: '2', category: '其他', sub_category: '卫浴安装',
        description: '想在卫生间加装一个毛巾架和置物架，需要打孔安装',
        images: [], address: { province: '广东省', city: '深圳市', district: '福田区', detail: '华强北赛格广场后面荔村小区12栋301' },
        contact_phone: '13900139000', expect_time: '2026-05-18 14:00', time_slot: '14:00-16:00',
        status: 'pending', handler_id: '', handle_note: '',
        expected_duration: 1, is_urgent: false, progress_photos: [],
        created_at: '2026-05-13 12:00:00', updated_at: '2026-05-13 12:00:00'
      },
      {
        id: '16', order_no: 'WX20260506016', user_id: '6', category: '水管', sub_category: '漏水',
        description: '热水器连接处有滴水现象，需要检查维修',
        images: [], address: { province: '广东省', city: '深圳市', district: '福田区', detail: '景田北路天健花园2栋701' },
        contact_phone: '17700177000', expect_time: '2026-05-07 10:00', time_slot: '10:00-12:00',
        status: 'completed', handler_id: '2', handle_note: '热水器接口密封垫老化，已更换并加固',
        expected_duration: 1, is_urgent: false, progress_photos: [],
        created_at: '2026-05-06 15:00:00', updated_at: '2026-05-08 11:00:00'
      },
      {
        id: '17', order_no: 'WX20260503017', user_id: '3', category: '电路', sub_category: '灯具维修',
        description: '卧室吸顶灯闪烁，换了灯管还是闪，可能是镇流器问题',
        images: [], address: { province: '广东省', city: '广州市', district: '越秀区', detail: '北京路步行街附近惠福东路小区5栋702' },
        contact_phone: '15800158000', expect_time: '2026-05-04 14:00', time_slot: '14:00-16:00',
        status: 'completed', handler_id: '2', handle_note: '镇流器损坏，已更换LED驱动电源，灯光明亮稳定',
        expected_duration: 1, is_urgent: false, progress_photos: [],
        created_at: '2026-05-03 16:00:00', updated_at: '2026-05-05 10:00:00'
      },
      {
        id: '18', order_no: 'WX20260513018', user_id: '5', category: '水管', sub_category: '漏水',
        description: '马桶水箱一直在漏水，水费都多了不少',
        images: [], address: { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园南区翠谷居5栋102' },
        contact_phone: '13500135000', expect_time: '2026-05-17 10:00', time_slot: '10:00-12:00',
        status: 'pending', handler_id: '', handle_note: '',
        expected_duration: 1, is_urgent: true, progress_photos: [],
        created_at: '2026-05-13 13:00:00', updated_at: '2026-05-13 13:00:00'
      }
    ])
  }

  if (!storage.get('reviews')) {
    storage.set('reviews', [
      { id: '1', order_id: '1', user_id: '1', rating: 5, content: '王师傅很专业，上门准时，很快就找到了漏水原因并修好了。还帮忙检查了其他水管，非常负责！', tags: ['技术专业', '上门准时', '维修彻底'], created_at: '2026-04-30 17:30:00' },
      { id: '2', order_id: '2', user_id: '2', rating: 5, content: '王师傅技术很好，开关修好了，还顺便帮我检查了其他几个插座，服务很周到。', tags: ['技术专业', '态度友好', '耐心解答'], created_at: '2026-05-04 12:00:00' },
      { id: '3', order_id: '3', user_id: '3', rating: 4, content: '疏通效果不错，下水现在很顺畅。师傅态度也很好，就是等了一会儿才到。', tags: ['态度友好', '维修彻底'], created_at: '2026-05-07 16:00:00' },
      { id: '4', order_id: '4', user_id: '4', rating: 5, content: '排查很仔细，发现是接线松动的问题，重新接好后一切正常了。', tags: ['技术专业', '值得推荐'], created_at: '2026-05-10 11:00:00' },
      { id: '5', order_id: '5', user_id: '5', rating: 5, content: '王师傅安装智能马桶非常专业，调试了很久确保所有功能正常，还教我怎么使用。强烈推荐！', tags: ['技术专业', '耐心解答', '值得推荐', '工具齐全'], created_at: '2026-05-11 13:00:00' },
      { id: '6', order_id: '6', user_id: '1', rating: 4, content: '电路改造很彻底，现在开空调再也不跳闸了。师傅干活很利索。', tags: ['维修彻底', '清理干净'], created_at: '2026-05-12 19:00:00' },
      { id: '7', order_id: '7', user_id: '6', rating: 5, content: '漏水问题困扰了我好久，王师傅一次就排查出了原因，还帮我跟楼上业主沟通，服务太好了！', tags: ['技术专业', '沟通顺畅', '值得推荐'], created_at: '2026-05-13 15:00:00' },
      { id: '8', order_id: '16', user_id: '6', rating: 4, content: '维修速度快，热水器修好后没有再漏水。师傅还提醒我定期检查，很贴心。', tags: ['态度友好', '耐心解答'], created_at: '2026-05-08 12:00:00' },
      { id: '9', order_id: '17', user_id: '3', rating: 5, content: '换了驱动电源后灯再也不闪了，师傅还帮我调整了灯光角度，效果很好！', tags: ['技术专业', '值得推荐'], created_at: '2026-05-05 11:00:00' }
    ])
  }

  if (!storage.get('addresses')) {
    storage.set('addresses', [
      { id: '1', user_id: '1', province: '广东省', city: '深圳市', district: '南山区', detail: '科技园南区翠谷居3栋502', is_default: true },
      { id: '2', user_id: '2', province: '广东省', city: '深圳市', district: '福田区', detail: '华强北赛格广场后面荔村小区12栋301', is_default: true },
      { id: '3', user_id: '3', province: '广东省', city: '广州市', district: '天河区', detail: '天河城东侧天河新苑B座804', is_default: true },
      { id: '4', user_id: '3', province: '广东省', city: '广州市', district: '越秀区', detail: '北京路步行街附近惠福东路小区5栋702', is_default: false },
      { id: '5', user_id: '4', province: '广东省', city: '深圳市', district: '南山区', detail: '后海大道海月花园二期6栋1503', is_default: true },
      { id: '6', user_id: '5', province: '广东省', city: '深圳市', district: '南山区', detail: '科技园南区翠谷居5栋102', is_default: true },
      { id: '7', user_id: '6', province: '广东省', city: '深圳市', district: '福田区', detail: '景田北路天健花园2栋701', is_default: true }
    ])
  }

  if (!storage.get('settings')) {
    storage.set('settings', {
      platform_name: '水电维修平台',
      worker_name: '王建国',
      worker_phone: '13700137000',
      service_phone: '13700137000',
      service_hours: '08:00 - 18:00',
      service_areas: '深圳市',
      description: '专业家庭水电维修服务，快速响应，持证上岗，售后保障。',
      work_days: [1, 2, 3, 4, 5, 6],
      time_slots: [
        { label: '09:00-11:00', start: '09:00', end: '11:00' },
        { label: '11:00-13:00', start: '11:00', end: '13:00' },
        { label: '14:00-16:00', start: '14:00', end: '16:00' },
        { label: '16:00-18:00', start: '16:00', end: '18:00' }
      ],
      rest_days: ['2026-05-20', '2026-05-27']
    })
  }

  if (!storage.get('notifications')) {
    storage.set('notifications', [
      { id: '1', user_id: '1', type: 'order_status', title: '订单已接单', content: '您的订单 WX20260512008 已被王建国师傅接单，将按时上门服务。', order_id: '8', read: false, created_at: '2026-05-12 09:30:00' },
      { id: '2', user_id: '1', type: 'order_status', title: '维修已完成', content: '您的订单 WX20260510006 已维修完成，请确认并评价。', order_id: '6', read: false, created_at: '2026-05-12 18:00:00' },
      { id: '3', user_id: '1', type: 'order_status', title: '订单已评价', content: '感谢您对订单 WX20260428001 的评价，您的反馈是我们前进的动力！', order_id: '1', read: true, created_at: '2026-04-30 17:30:00' },
      { id: '4', user_id: '2', type: 'order_status', title: '订单已接单', content: '您的订单 WX20260512008 已被王建国师傅接单。', order_id: '8', read: false, created_at: '2026-05-12 09:30:00' },
      { id: '5', user_id: '3', type: 'order_status', title: '订单已接单', content: '您的订单 WX20260512009 已被王建国师傅接单。', order_id: '9', read: true, created_at: '2026-05-12 14:00:00' },
      { id: '6', user_id: '5', type: 'order_status', title: '维修进度更新', content: '您的订单 WX20260513011 维修师傅正在更换浴霸开关面板。', order_id: '11', read: false, created_at: '2026-05-13 14:30:00' }
    ])
  }
}

// 通知相关API
export const notificationApi = {
  async getNotifications() {
    await delay(100)
    const user = storage.get('current_user')
    if (!user) return { code: 401, message: '未登录' }
    const notifications = (storage.get('notifications') || [])
      .filter(n => n.user_id === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return { code: 200, data: notifications }
  },

  async getUnreadCount() {
    const user = storage.get('current_user')
    if (!user) return { code: 200, data: 0 }
    const notifications = (storage.get('notifications') || [])
      .filter(n => n.user_id === user.id && !n.read)
    return { code: 200, data: notifications.length }
  },

  async markAsRead(id) {
    await delay(100)
    const notifications = storage.get('notifications') || []
    const index = notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications[index].read = true
      storage.set('notifications', notifications)
    }
    return { code: 200, message: '已读' }
  },

  async markAllRead() {
    await delay()
    const user = storage.get('current_user')
    if (!user) return { code: 401, message: '未登录' }
    const notifications = storage.get('notifications') || []
    notifications.forEach(n => { if (n.user_id === user.id) n.read = true })
    storage.set('notifications', notifications)
    return { code: 200, message: '全部已读' }
  },

  async create(userId, type, title, content, orderId) {
    const notifications = storage.get('notifications') || []
    const newNotif = {
      id: generateId(), user_id: userId, type, title, content,
      order_id: orderId || '', read: false, created_at: new Date().toLocaleString()
    }
    notifications.push(newNotif)
    storage.set('notifications', notifications)
    return newNotif
  }
}

// 评价标签预设
export const reviewTags = [
  '技术专业', '态度友好', '上门准时', '维修彻底',
  '沟通顺畅', '工具齐全', '清理干净', '耐心解答', '值得推荐'
]

// 可用时间段
export const defaultTimeSlots = [
  { label: '09:00-11:00', start: '09:00', end: '11:00' },
  { label: '11:00-13:00', start: '11:00', end: '13:00' },
  { label: '14:00-16:00', start: '14:00', end: '16:00' },
  { label: '16:00-18:00', start: '16:00', end: '18:00' }
]

// 模拟API延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 用户相关API
export const userApi = {
  async login(phone, password) {
    await delay()
    const users = storage.get('users') || []
    const user = users.find(u => u.phone === phone && u.password === password)
    if (user) {
      const token = 'user_' + generateId()
      storage.set('user_token', token)
      storage.set('current_user', user)
      return { code: 200, data: { token, user }, message: '登录成功' }
    }
    return { code: 401, message: '手机号或密码错误' }
  },

  async register(phone, password, nickname) {
    await delay()
    const users = storage.get('users') || []
    if (users.find(u => u.phone === phone)) {
      return { code: 400, message: '该手机号已注册' }
    }
    const newUser = {
      id: generateId(), phone, password,
      nickname: nickname || `用户${phone.slice(-4)}`,
      avatar: '', role: 'user', created_at: new Date().toLocaleString()
    }
    users.push(newUser)
    storage.set('users', users)
    return { code: 200, data: newUser, message: '注册成功' }
  },

  async getUserInfo() {
    await delay(100)
    const user = storage.get('current_user')
    return user ? { code: 200, data: user } : { code: 401, message: '未登录' }
  },

  async updateUserInfo(data) {
    await delay()
    const user = storage.get('current_user')
    if (!user) return { code: 401, message: '未登录' }
    const users = storage.get('users') || []
    const index = users.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users[index] = { ...users[index], ...data }
      storage.set('users', users)
      storage.set('current_user', users[index])
      return { code: 200, data: users[index], message: '更新成功' }
    }
    return { code: 400, message: '更新失败' }
  }
}

// 地址相关API
export const addressApi = {
  async getList() {
    await delay()
    const user = storage.get('current_user')
    if (!user) return { code: 401, message: '未登录' }
    const addresses = storage.get('addresses') || []
    return { code: 200, data: addresses.filter(a => a.user_id === user.id) }
  },

  async add(data) {
    await delay()
    const user = storage.get('current_user')
    if (!user) return { code: 401, message: '未登录' }
    const addresses = storage.get('addresses') || []
    const newAddr = {
      id: generateId(), user_id: user.id, ...data,
      is_default: addresses.filter(a => a.user_id === user.id).length === 0
    }
    addresses.push(newAddr)
    storage.set('addresses', addresses)
    return { code: 200, data: newAddr, message: '添加成功' }
  },

  async update(id, data) {
    await delay()
    const addresses = storage.get('addresses') || []
    const index = addresses.findIndex(a => a.id === id)
    if (index !== -1) {
      addresses[index] = { ...addresses[index], ...data }
      storage.set('addresses', addresses)
      return { code: 200, data: addresses[index], message: '更新成功' }
    }
    return { code: 400, message: '地址不存在' }
  },

  async remove(id) {
    await delay()
    const addresses = storage.get('addresses') || []
    storage.set('addresses', addresses.filter(a => a.id !== id))
    return { code: 200, message: '删除成功' }
  },

  async setDefault(id) {
    await delay()
    const user = storage.get('current_user')
    if (!user) return { code: 401, message: '未登录' }
    const addresses = storage.get('addresses') || []
    addresses.forEach(a => { if (a.user_id === user.id) a.is_default = a.id === id })
    storage.set('addresses', addresses)
    return { code: 200, message: '设置成功' }
  }
}

// 订单相关API
export const orderApi = {
  async create(data) {
    await delay()
    const user = storage.get('current_user')
    if (!user) return { code: 401, message: '未登录' }
    const orders = storage.get('orders') || []
    const newOrder = {
      id: generateId(), order_no: generateOrderNo(), user_id: user.id, ...data,
      status: 'pending', handler_id: '', handle_note: '',
      expected_duration: data.expected_duration || 1,
      is_urgent: data.is_urgent || false,
      progress_photos: [],
      created_at: new Date().toLocaleString(), updated_at: new Date().toLocaleString()
    }
    orders.push(newOrder)
    storage.set('orders', orders)
    return { code: 200, data: newOrder, message: '报修提交成功' }
  },

  async getUserOrders(status) {
    await delay()
    const user = storage.get('current_user')
    if (!user) return { code: 401, message: '未登录' }
    const orders = storage.get('orders') || []
    let list = orders.filter(o => o.user_id === user.id)
    if (status && status !== 'all') list = list.filter(o => o.status === status)
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return { code: 200, data: list }
  },

  async getDetail(id) {
    await delay()
    const orders = storage.get('orders') || []
    const order = orders.find(o => o.id === id)
    if (order) {
      const users = storage.get('users') || []
      const admins = storage.get('admins') || []
      order.user = users.find(u => u.id === order.user_id)
      order.handler = admins.find(a => a.id === order.handler_id)
    }
    return order ? { code: 200, data: order } : { code: 404, message: '订单不存在' }
  },

  async cancel(id) {
    await delay()
    const orders = storage.get('orders') || []
    const index = orders.findIndex(o => o.id === id)
    if (index !== -1 && orders[index].status === 'pending') {
      orders[index].status = 'cancelled'
      orders[index].updated_at = new Date().toLocaleString()
      storage.set('orders', orders)
      return { code: 200, message: '订单已取消' }
    }
    return { code: 400, message: '无法取消该订单' }
  },

  async addReview(orderId, rating, content, tags) {
    await delay()
    const reviews = storage.get('reviews') || []
    const user = storage.get('current_user')
    const newReview = { id: generateId(), order_id: orderId, user_id: user.id, rating, content, tags: tags || [], created_at: new Date().toLocaleString() }
    reviews.push(newReview)
    storage.set('reviews', reviews)
    return { code: 200, data: newReview, message: '评价成功' }
  },

  async getAllReviews() {
    await delay()
    const reviews = storage.get('reviews') || []
    const users = storage.get('users') || []
    const orders = storage.get('orders') || []
    const enriched = reviews.map(r => {
      const user = users.find(u => u.id === r.user_id)
      const order = orders.find(o => o.id === r.order_id)
      return { ...r, user_nickname: user?.nickname || '匿名', order_no: order?.order_no || '', category: order?.category || '' }
    })
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return { code: 200, data: enriched }
  },

  async getReview(orderId) {
    await delay()
    const reviews = storage.get('reviews') || []
    return { code: 200, data: reviews.find(r => r.order_id === orderId) || null }
  },

  async searchOrders(keyword) {
    await delay()
    const user = storage.get('current_user')
    if (!user) return { code: 401, message: '未登录' }
    const orders = storage.get('orders') || []
    const users = storage.get('users') || []
    const admins = storage.get('admins') || []
    let list = orders.filter(o => o.user_id === user.id)
    if (keyword) {
      const kw = keyword.toLowerCase()
      list = list.filter(o =>
        o.order_no.toLowerCase().includes(kw) ||
        o.description.toLowerCase().includes(kw) ||
        o.category.includes(kw) ||
        o.sub_category.includes(kw) ||
        (o.address?.detail || '').includes(kw)
      )
    }
    list = list.map(order => ({
      ...order,
      user: users.find(u => u.id === order.user_id),
      handler: admins.find(a => a.id === order.handler_id)
    }))
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return { code: 200, data: list }
  }
}

// 工作日程相关API
export const scheduleApi = {
  async getWorkSchedule() {
    await delay(100)
    const settings = storage.get('settings') || {}
    return {
      code: 200,
      data: {
        work_days: settings.work_days || [1, 2, 3, 4, 5, 6],
        time_slots: settings.time_slots || defaultTimeSlots,
        rest_days: settings.rest_days || []
      }
    }
  },

  async updateWorkSchedule(data) {
    await delay()
    const settings = storage.get('settings') || {}
    if (data.work_days !== undefined) settings.work_days = data.work_days
    if (data.time_slots !== undefined) settings.time_slots = data.time_slots
    storage.set('settings', settings)
    return { code: 200, message: '工作日程更新成功' }
  },

  async getRestDays() {
    await delay(100)
    const settings = storage.get('settings') || {}
    return { code: 200, data: settings.rest_days || [] }
  },

  async setRestDay(date) {
    await delay()
    const settings = storage.get('settings') || {}
    if (!settings.rest_days) settings.rest_days = []
    if (!settings.rest_days.includes(date)) {
      settings.rest_days.push(date)
      settings.rest_days.sort()
    }
    storage.set('settings', settings)
    return { code: 200, message: '休息日设置成功' }
  },

  async removeRestDay(date) {
    await delay()
    const settings = storage.get('settings') || {}
    settings.rest_days = (settings.rest_days || []).filter(d => d !== date)
    storage.set('settings', settings)
    return { code: 200, message: '休息日已取消' }
  },

  async checkTimeConflict(date, timeSlot, excludeOrderId) {
    await delay(100)
    const settings = storage.get('settings') || {}
    const restDays = settings.rest_days || []

    // 检查是否为休息日
    if (restDays.includes(date)) {
      return { code: 409, message: '该日期为休息日，请选择其他日期', conflict: true }
    }

    // 检查是否为工作日
    const dayOfWeek = new Date(date).getDay()
    const workDays = settings.work_days || [1, 2, 3, 4, 5, 6]
    if (!workDays.includes(dayOfWeek)) {
      return { code: 409, message: '该日期非工作日，请选择其他日期', conflict: true }
    }

    // 检查时间段冲突
    const orders = storage.get('orders') || []
    const slots = settings.time_slots || defaultTimeSlots
    const targetSlot = slots.find(s => s.label === timeSlot)
    if (!targetSlot) {
      return { code: 400, message: '无效的时间段', conflict: true }
    }

    // 获取该日期已有的订单（排除当前订单）
    const dayOrders = orders.filter(o => {
      if (excludeOrderId && o.id === excludeOrderId) return false
      if (['cancelled'].includes(o.status)) return false
      const orderDate = o.expect_time?.split(' ')[0]
      return orderDate === date
    })

    // 检查时间段是否已被占用
    const conflictOrder = dayOrders.find(o => o.time_slot === timeSlot)
    if (conflictOrder) {
      return {
        code: 409,
        message: `该时间段已被订单 ${conflictOrder.order_no} 占用`,
        conflict: true,
        conflictOrder: conflictOrder.order_no
      }
    }

    // 检查时间是否已过
    const now = new Date()
    const slotDate = new Date(`${date} ${targetSlot.start}`)
    if (slotDate < now) {
      return { code: 409, message: '该时间段已过期，请选择其他时间', conflict: true }
    }

    return { code: 200, message: '时间段可用', conflict: false }
  },

  async getAvailableSlots(date) {
    await delay(100)
    const settings = storage.get('settings') || {}
    const restDays = settings.rest_days || []
    const slots = settings.time_slots || defaultTimeSlots

    // 检查是否为休息日
    if (restDays.includes(date)) {
      return { code: 200, data: [], message: '该日期为休息日' }
    }

    // 检查是否为工作日
    const dayOfWeek = new Date(date).getDay()
    const workDays = settings.work_days || [1, 2, 3, 4, 5, 6]
    if (!workDays.includes(dayOfWeek)) {
      return { code: 200, data: [], message: '该日期非工作日' }
    }

    // 获取已占用的时间段
    const orders = storage.get('orders') || []
    const dayOrders = orders.filter(o => {
      if (['cancelled'].includes(o.status)) return false
      const orderDate = o.expect_time?.split(' ')[0]
      return orderDate === date
    })
    const occupiedSlots = dayOrders.map(o => o.time_slot)

    // 过滤已过期的时间段
    const now = new Date()
    const available = slots.filter(s => {
      if (occupiedSlots.includes(s.label)) return false
      const slotDate = new Date(`${date} ${s.start}`)
      if (slotDate < now) return false
      return true
    })

    return { code: 200, data: available }
  },

  async getDaySchedule(date) {
    await delay(100)
    const orders = storage.get('orders') || []
    const users = storage.get('users') || []
    const settings = storage.get('settings') || {}
    const restDays = settings.rest_days || []
    const isRestDay = restDays.includes(date)

    const dayOrders = orders.filter(o => {
      if (['cancelled'].includes(o.status)) return false
      const orderDate = o.expect_time?.split(' ')[0]
      return orderDate === date
    }).map(o => ({
      ...o,
      user: users.find(u => u.id === o.user_id)
    })).sort((a, b) => {
      const slots = settings.time_slots || defaultTimeSlots
      const aIdx = slots.findIndex(s => s.label === a.time_slot)
      const bIdx = slots.findIndex(s => s.label === b.time_slot)
      return aIdx - bIdx
    })

    return {
      code: 200,
      data: {
        date,
        is_rest_day: isRestDay,
        orders: dayOrders,
        total_orders: dayOrders.length,
        urgent_count: dayOrders.filter(o => o.is_urgent).length
      }
    }
  }
}

// 管理端/维修工API
export const adminApi = {
  async login(username, password) {
    await delay()
    const admins = storage.get('admins') || []
    const admin = admins.find(a => a.username === username && a.password === password)
    if (admin) {
      const token = 'admin_' + generateId()
      storage.set('admin_token', token)
      storage.set('current_admin', admin)
      return { code: 200, data: { token, admin }, message: '登录成功' }
    }
    return { code: 401, message: '用户名或密码错误' }
  },

  async getAdminInfo() {
    await delay(100)
    const admin = storage.get('current_admin')
    return admin ? { code: 200, data: admin } : { code: 401, message: '未登录' }
  },

  async getAllOrders(params = {}) {
    await delay()
    const orders = storage.get('orders') || []
    let list = [...orders]
    if (params.status && params.status !== 'all') list = list.filter(o => o.status === params.status)
    if (params.category && params.category !== 'all') list = list.filter(o => o.category === params.category)
    if (params.is_urgent !== undefined) list = list.filter(o => o.is_urgent === params.is_urgent)
    if (params.keyword) {
      list = list.filter(o =>
        o.order_no.includes(params.keyword) ||
        o.description.includes(params.keyword) ||
        o.contact_phone.includes(params.keyword)
      )
    }
    const users = storage.get('users') || []
    const admins = storage.get('admins') || []
    list = list.map(order => ({
      ...order,
      user: users.find(u => u.id === order.user_id),
      handler: admins.find(a => a.id === order.handler_id)
    }))
    list.sort((a, b) => {
      if (a.is_urgent !== b.is_urgent) return b.is_urgent ? 1 : -1
      return new Date(b.created_at) - new Date(a.created_at)
    })
    return { code: 200, data: list }
  },

  async acceptOrder(orderId, adminId, note, timeSlot, expectedDuration) {
    await delay()
    const orders = storage.get('orders') || []
    const index = orders.findIndex(o => o.id === orderId)
    if (index !== -1) {
      orders[index].status = 'accepted'
      orders[index].handler_id = adminId
      orders[index].handle_note = note || '已接单'
      if (timeSlot) orders[index].time_slot = timeSlot
      if (expectedDuration) orders[index].expected_duration = expectedDuration
      orders[index].updated_at = new Date().toLocaleString()
      storage.set('orders', orders)
      notificationApi.create(orders[index].user_id, 'order_status', '订单已接单',
        `您的订单 ${orders[index].order_no} 已被王建国师傅接单，将按时上门服务。`, orderId)
      return { code: 200, message: '接单成功' }
    }
    return { code: 400, message: '订单不存在' }
  },

  async updateOrderStatus(orderId, status, note) {
    await delay()
    const orders = storage.get('orders') || []
    const index = orders.findIndex(o => o.id === orderId)
    if (index !== -1) {
      const oldStatus = orders[index].status
      orders[index].status = status
      if (note) orders[index].handle_note = note
      orders[index].updated_at = new Date().toLocaleString()
      storage.set('orders', orders)
      const statusLabels = { repairing: '维修中', completed: '已完成' }
      if (statusLabels[status] && status !== oldStatus) {
        notificationApi.create(orders[index].user_id, 'order_status', `订单状态更新`,
          `您的订单 ${orders[index].order_no} 状态已更新为：${statusLabels[status]}`, orderId)
      }
      return { code: 200, message: '状态更新成功' }
    }
    return { code: 400, message: '订单不存在' }
  },

  async updateOrderDuration(orderId, duration, timeSlot) {
    await delay()
    const orders = storage.get('orders') || []
    const index = orders.findIndex(o => o.id === orderId)
    if (index !== -1) {
      if (duration !== undefined) orders[index].expected_duration = duration
      if (timeSlot) orders[index].time_slot = timeSlot
      orders[index].updated_at = new Date().toLocaleString()
      storage.set('orders', orders)
      return { code: 200, message: '维修时长更新成功' }
    }
    return { code: 400, message: '订单不存在' }
  },

  async toggleUrgent(orderId) {
    await delay()
    const orders = storage.get('orders') || []
    const index = orders.findIndex(o => o.id === orderId)
    if (index !== -1) {
      orders[index].is_urgent = !orders[index].is_urgent
      orders[index].updated_at = new Date().toLocaleString()
      storage.set('orders', orders)
      return { code: 200, data: orders[index], message: orders[index].is_urgent ? '已标记紧急' : '已取消紧急标记' }
    }
    return { code: 400, message: '订单不存在' }
  },

  async uploadProgressPhotos(orderId, photos) {
    await delay()
    const orders = storage.get('orders') || []
    const index = orders.findIndex(o => o.id === orderId)
    if (index !== -1) {
      if (!orders[index].progress_photos) orders[index].progress_photos = []
      const newPhotos = photos.map(url => ({
        url, uploaded_at: new Date().toLocaleString(),
        uploaded_by: (storage.get('current_admin')?.name) || '维修师傅'
      }))
      orders[index].progress_photos.push(...newPhotos)
      orders[index].updated_at = new Date().toLocaleString()
      storage.set('orders', orders)
      notificationApi.create(orders[index].user_id, 'order_status', '维修进度更新',
        `您的订单 ${orders[index].order_no} 有新的维修进度照片，请查看。`, orderId)
      return { code: 200, data: orders[index].progress_photos, message: '上传成功' }
    }
    return { code: 400, message: '订单不存在' }
  },

  async searchUsers(keyword) {
    await delay()
    const users = storage.get('users') || []
    if (!keyword) return { code: 200, data: users }
    const kw = keyword.toLowerCase()
    const filtered = users.filter(u =>
      u.nickname.toLowerCase().includes(kw) ||
      u.phone.includes(kw)
    )
    return { code: 200, data: filtered }
  },

  async getAllOrdersForExport() {
    await delay()
    const orders = storage.get('orders') || []
    const users = storage.get('users') || []
    return {
      code: 200,
      data: orders.map(o => ({
        ...o,
        user_nickname: users.find(u => u.id === o.user_id)?.nickname || ''
      }))
    }
  },

  async getAllUsersForExport() {
    await delay()
    return { code: 200, data: storage.get('users') || [] }
  },

  async getHomeStats() {
    await delay(100)
    const orders = storage.get('orders') || []
    const reviews = storage.get('reviews') || []
    const completedOrders = orders.filter(o => o.status === 'completed')
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0'
    return {
      code: 200,
      data: {
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        avgRating: Number(avgRating),
        reviewCount: reviews.length,
        recentReviews: reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6).map(r => {
          const user = storage.get('users')?.find(u => u.id === r.user_id)
          return { ...r, user_nickname: user?.nickname || '匿名用户' }
        })
      }
    }
  },

  async changePassword(oldPassword, newPassword) {
    await delay()
    const admin = storage.get('current_admin')
    if (!admin) return { code: 401, message: '未登录' }
    const admins = storage.get('admins') || []
    const index = admins.findIndex(a => a.id === admin.id)
    if (index !== -1 && admins[index].password === oldPassword) {
      admins[index].password = newPassword
      storage.set('admins', admins)
      return { code: 200, message: '密码修改成功' }
    }
    return { code: 400, message: '原密码错误' }
  },

  async getAllUsers() {
    await delay()
    return { code: 200, data: storage.get('users') || [] }
  },

  async getStatistics() {
    await delay()
    const orders = storage.get('orders') || []
    const now = new Date()
    const today = now.toDateString()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
    const weekOrders = orders.filter(o => new Date(o.created_at) >= weekStart)
    const monthOrders = orders.filter(o => new Date(o.created_at) >= monthStart)
    const pendingOrders = orders.filter(o => o.status === 'pending')
    const completedOrders = orders.filter(o => o.status === 'completed')
    const urgentOrders = orders.filter(o => o.is_urgent && !['completed', 'cancelled'].includes(o.status))

    const categoryStats = {}
    orders.forEach(o => { categoryStats[o.category] = (categoryStats[o.category] || 0) + 1 })

    const statusStats = {}
    orders.forEach(o => { statusStats[o.status] = (statusStats[o.status] || 0) + 1 })

    return {
      code: 200,
      data: {
        total: orders.length, today: todayOrders.length, week: weekOrders.length, month: monthOrders.length,
        pending: pendingOrders.length, completed: completedOrders.length,
        urgent: urgentOrders.length,
        categoryStats, statusStats
      }
    }
  },

  async getSettings() {
    await delay(100)
    return { code: 200, data: storage.get('settings') || {} }
  },

  async updateSettings(data) {
    await delay()
    storage.set('settings', data)
    return { code: 200, data, message: '保存成功' }
  }
}
