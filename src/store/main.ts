import { createStore } from "vuex"
import other from './other.ts'

interface State {
  [key: string]: any, // 允许其他任意属性的写法
}
interface Set_state {
  name: string,
  value: number
}

export type {
  State
}

export default createStore({
  state() {
    return {
      视窗宽度: 1,
      面板宽度: 1,
      当前主页面: null, // 因为任意层级可以跳转主页面 因此设成全局属性
    }
  },
  mutations: {
    set_state(state: State, args: Set_state): void {
      state[args.name] = args.value
    },
    获取主页面(state: State, name?: string) {
      console.log('读数据', state.other.test_data.data);
      let t: any;
      if (name) {
        // 指定了名称 取 是面板 且 名字相同的数据
        t = state.other.test_data.data.find((e: any) => e.ismainpage && e.pagename === name);
      } else {
        // 没有指定名称 取第一个面板
        t = state.other.test_data.data.find((e: any) => e.ismainpage === true);
      }
      // 保存当前面板宽度
      state.面板宽度 = t.width
      state.当前主页面 = t
    }
  },
  getters: {
    缩放比(state: State): number {
      console.log('计算缩放比例', state.视窗宽度, state.面板宽度)
      let t = Math.round((state.视窗宽度 / state.面板宽度) * 10) / 10
      return t
    }
  },
  modules: {
    other
  }
})