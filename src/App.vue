<template>
	<div id="root" v-loading="加载">
		<main_page></main_page>
	</div>
</template>

<script lang="ts" setup>
import { provide, ref } from 'vue';
import main_page from './components/主页.vue';
import { websocket地址 } from './vue引入配置';
import { 消息 } from './api/消息';
import { useStore } from 'vuex';

interface 指令参数 {
	类型: string;
	组件名: string;
	页面名: string;
	[key: string]: any;
}
export type { 指令参数 };

const store = useStore();
const 加载 = ref<boolean>(true);
// 向子组件注入 公共方法
provide('发送指令', 发送指令);
// 取本地JSON界面数据的工程ID 回显根据工程id筛选
let 工程id: string = store.state.page.界面.projectid;
// 监听websocket返回消息
// 区分消息类型 根据不同类型解析数据
let 初始化or更新: string = '初始化';
const ws = 创建websocket连接(websocket地址);

// 方法
function 发送指令(args: 指令参数) {
	// 接收 对象 对象中必须有 类型 组件名 页面名 以及 其他任意字段
	let order: any = {
		senderip: 'admin',
		Username: store.state.user.用户名,
		Password: store.state.user.密码,
		cmd_type: 'ControlCommand',
		projectid: 工程id,
		rectname: args.组件名,
		pagename: args.页面名,
		value: [],
		ispress: -1,
	};
	switch (args.类型) {
		case '按钮':
			order.type = 'btn'; //btn:按钮 slider:滑块 matrix：矩阵 login:登录验证
			order.ispress = args.按下; // 0非按下 1按下 -1 ignore
			break;
		case '滑块':
			order.type = 'slider';
			break;
	}
	let body = {
		data: { ...order, ...args.data },
	};
	console.log('发送指令', body);
	ws.send(JSON.stringify(body));
}
function 创建websocket连接(url: string, reconnect_count: number = 0, max_count: number = 3) {
	加载.value = true;
	let ws = new WebSocket(url);
	ws.onopen = () => {
		加载.value = false;
		消息('连接成功');
		ws.send('hello');
	};
	ws.onmessage = (e: any) => {
		let { data: data } = JSON.parse(e.data);
		console.log('通信', data);
		if (data.projectid === 工程id) {
			// 工程id对应才解析数据
			store.commit('set_state', { name: '通信数据', value: { 类型: 初始化or更新, data } });
			// 只有第一次来的数据才是 初始化数据 后续都是更新
			初始化or更新 === '初始化' && (初始化or更新 = '更新');
		}
	};
	ws.onerror = () => {
		加载.value = false;
		if (++reconnect_count <= max_count) {
			消息(`连接失败，尝试 第${reconnect_count}次 重连`, 'error');
			ws = 创建websocket连接(url, reconnect_count);
		} else {
			消息('重连失败', 'error');
		}
	};
	return ws;
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
