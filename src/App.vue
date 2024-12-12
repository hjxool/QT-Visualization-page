<template>
	<div id="root" v-loading="加载">
		<main_page></main_page>
	</div>
</template>

<script lang="ts" setup>
import { computed, provide, watch } from 'vue';
import main_page from './components/主页.vue';
import { websocket地址 } from '@/vue引入配置';
import { 消息 } from './api/消息';
import { useStore } from 'vuex';
import { 功能 } from '@/store/main';

interface 指令参数 {
	类型: string;
	组件名: string;
	页面名: string;
	[key: string]: any;
}

export type { 指令参数 };

const store = useStore();
const 加载 = computed(() => store.state.加载);
// 页面一启动生成唯一ID 用于过滤通信数据
const uuid = 生成uuid();
// 向子组件注入 公共方法
provide('发送指令', 发送指令);
store.dispatch('获取界面数据');
const 工程id = computed(() => store.state.工程ID);
// 监听websocket返回消息
// 区分消息类型 根据不同类型解析数据
let 初始化or更新: string = '初始化';
let ws: WebSocket;
watch(
	() => store.state.已登录,
	(now: boolean) => {
		if (now) {
			ws = 创建websocket连接(websocket地址);
		}
	}
);

// 方法
function 发送指令(args: 指令参数) {
	if (!store.state.已登录) {
		消息('请先登录', 'info');
		return;
	}
	// 接收 对象 对象中必须有 类型 组件名 页面名 以及 其他任意字段
	let order: any = {
		senderip: uuid,
		Username: store.state.user.用户名,
		Password: store.state.user.密码,
		cmd_type: 'ControlCommand',
		projectid: 工程id.value,
		rectname: args.组件名,
		pagename: args.页面名,
		value: [],
		ispress: -1,
	};
	switch (args.类型) {
		case '按钮':
			order.ispress = args.按下; // 0非按下 1按下 -1 ignore
			switch (args.功能类型) {
				case 功能.下发矩阵值:
					order.type = 'matrix';
					for (let val of store.state.依赖数据) {
						if (val.采集者 == args.组件名 && val.采集者所在页面 == args.页面名) {
							// 找到依赖的矩阵数据 收集并下发
							args.data[val.是否为输入端 ? 'input' : 'output'] = val.激活序列;
						}
					}
					break;
				case 功能.切换轮播图:
					order.type = 'mutiimage';
					for (let val of store.state.依赖数据) {
						if (val.组件名 == args.目标组件 && val.页面名 == args.目标页面) {
							// 当前按钮控的是 对应组件依赖
							// 根据加/减 操作依赖值
							if (args.加或减 == '加') {
								val.当前显示 < val.total - 1 && val.当前显示++;
							} else {
								val.当前显示 > 0 && val.当前显示--;
							}
							break;
						}
					}
					break;
				default:
					order.type = 'btn';
					break;
			}
			break;
		case '滑块':
			switch (args.功能类型) {
				case 功能.控制窗帘:
					order.type = 'curtain';
					break;
				default:
					order.type = 'slider';
					break;
			}
			break;
	}
	let body = {
		data: { ...order, ...args.data },
	};
	console.log('发送指令', body);
	ws.send(JSON.stringify(body));
}
function 创建websocket连接(url: string, reconnect_count: number = 0, max_count: number = 3) {
	store.commit('set_state', { name: '加载', value: true });
	let ws = new WebSocket(url);
	ws.onopen = () => {
		store.commit('set_state', { name: '加载', value: false });
		消息('连接成功');
		ws.send('hello');
	};
	ws.onmessage = (e: any) => {
		let { data: data } = JSON.parse(e.data);
		console.log('通信', data);
		if (data.projectid === 工程id.value) {
			// 工程id对应才解析
			if (初始化or更新 === '初始化') {
				// 初始化没有uuid
				store.commit('set_state', {
					name: '通信数据',
					value: { 类型: 初始化or更新, data },
				});
				// 只有第一次来的数据才是 初始化数据 后续都是更新
				初始化or更新 = '更新';
			} else {
				if (uuid !== data.senderip) {
					// senderip 不是本机uuid 才解析数据 说明是从其他端推过来的数据
					store.commit('set_state', {
						name: '通信数据',
						value: { 类型: 初始化or更新, data },
					});
				}
			}
		}
	};
	ws.onerror = () => {
		store.commit('set_state', { name: '加载', value: false });
		if (++reconnect_count <= max_count) {
			消息(`连接失败，尝试 第${reconnect_count}次 重连`, 'error');
			ws = 创建websocket连接(url, reconnect_count);
		} else {
			消息('重连失败', 'error');
		}
	};
	return ws;
}
function 生成uuid(): string {
	// 基于 时间戳 和 随机数 组合生成
	// 时间戳 和 随机数 都用 toString(36) 转换成 36进制 字符串
	let 时间戳 = Date.now().toString(36);
	let 随机数 = Math.random().toString(36).substring(2, 11); // 截取一部分字符串即可
	return `${时间戳}-${随机数}`;
}
</script>

<style lang="less" scoped>
#root {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
