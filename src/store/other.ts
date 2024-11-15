// 引入本地测试数据
// 报错！不能用 import导入 public目录下 非资源文件 如JSON
// 只能通过HTML中的 <script> 或 <link> 标签引用 public下的JSON文件
import test_data from './test_data.json'
// 可以用fetch获取public下的JSON文件
// async function 获取测试数据() {
//   return fetch('/test_data.json').then(r => r.json())
// }

export default {
  // 启用 命名空间
  // 作用 避免 不同模块间 命名冲突
  // 如 A模块和B模块 都有 state变量名为xx 启用命名空间后就可以 在mapState等方法中指定模块下的state
  // 如 computed: { ...mapState('user', ['userInfo']), ...mapState('product', ['products']) }
  // 如 methods: { ...mapActions('user', ['fetchUserInfo']), ...mapActions('product', ['fetchProducts']) }
  namespaced: true,
  // 注意 模块中state 可以简写 不用 return {}
  state: {
    test_data: test_data
  },
}