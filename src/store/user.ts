// 引入本地测试数据
// 报错！不能用 import导入 public目录下 非资源文件 如JSON
// 只能通过HTML中的 <script> 或 <link> 标签引用 public下的JSON文件
// import 界面 from './界面.json'
// 可以用fetch获取public下的JSON文件
// async function 获取测试数据() {
//   return fetch('/test_data.json').then(r => r.json())
// }
import type { Set_state } from './main'

export default {
  // 启用 命名空间
  // 作用 避免 不同模块间 命名冲突
  // 如 A模块和B模块 都有 state变量名为xx 启用命名空间后就可以 在mapState等方法中指定模块下的state
  // 如 computed: { ...mapState('user', ['userInfo']), ...mapState('product', ['products']) }
  // 如 methods: { ...mapActions('user', ['fetchUserInfo']), ...mapActions('product', ['fetchProducts']) }
  namespace: true,
  // 注意 模块中state 可以简写 不用 return {}
  state: {
    记住账号: false,
    记住密码: false,
    用户名: '',
    密码: ''
  },
  mutations: {
    set_state(state: any, args: Set_state): void {
      state[args.name] = args.value
    }
  }
}