import type { Set_state } from './main'

export default {
  namespace: true,
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