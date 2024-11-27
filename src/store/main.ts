import { createStore } from "vuex"
import page from './page.ts'
import user from './user.ts'

interface State {
  [key: string]: any, // 允许其他任意属性的写法
}
interface Set_state {
  name: string,
  value: number
}

export type {
  State,
  Set_state
}

export default createStore({
  state() {
    return {
      视窗宽度: 1,
      面板宽度: 1,
      视窗高度: 1,
      面板高度: 1,
      当前主页面: '', // 因为任意层级可以跳转主页面 因此设成全局属性
      通信数据: null,
      组件树: [],
      已登录: false
    }
  },
  mutations: {
    set_state(state: State, args: Set_state): void {
      state[args.name] = args.value
    },
    获取主页面(state: State, name?: string) {
      let t: any;
      if (name) {
        // 指定了名称 取名字相同的数据
        t = state.组件树?.find((e: any) => e.pagename === name);
      } else {
        // 没有指定名称 取第一个面板
        t = state.组件树[0]
      }
      // 保存当前面板宽度
      if (t) {
        state.面板宽度 = t.width
        state.面板高度 = t.height
        state.当前主页面 = t.pagename
      }
    },
    组件数据初始化(state: State, source) {// _占位符 表示该位置参数被忽略
      // 用层序遍历思路
      let result = [] // 结果数组
      let queue = [] // 辅助队列
      // 先将源数据中主页面装入队列
      for (let val of source) {
        if (val.ismainpage) {
          queue.push(val)
          result.push(val)
        }
      }
      // 队列不为空 则一直循环
      while (queue.length) {
        // 记录当前层节点数
        let size: number = queue.length
        // 出队列 将结果装入结果数组 并讲下一层节点添加到队列
        while (size--) {
          let node = queue.shift() // 从头部出队列 在尾部添加新元素
          for (let val of node.data || []) {
            if (val.RectText === "PAGECONTAINER") {
              for (let val2 of source) {
                if (val.ShowPage === val2.pagename) {
                  // val = { ...val, ...val2 } // 将属性拼在一起 并保留data组件索引
                  // 不能用 val = {...} 因为赋了新的对象地址 node.data中的该对象就与新的val没有关系了
                  // 所以得在原对象上修改
                  val['grondcolor'] = val2.grondcolor
                  val['pagename'] = val2.pagename // 区分普通组件和容器
                  val['data'] = val2.data || [] // 这里要保留data数组索引
                }
              }
              queue.push(val) // 将新构造的对象装入队列 作为下一层节点
            }
          }
        }
      }
      state.组件树 = result
      console.log('组件树', JSON.parse(JSON.stringify(result)))
    }
  },
  getters: {
    缩放比(state: State): object {
      // console.log('计算缩放比例', state.视窗宽度, state.面板宽度)
      let w = Math.round((state.视窗宽度 / state.面板宽度) * 100) / 100
      let h = Math.round((state.视窗高度 / state.面板高度) * 100) / 100
      return {
        宽度比: w,
        高度比: h
      }
    }
  },
  modules: {
    page,
    user,
  }
})