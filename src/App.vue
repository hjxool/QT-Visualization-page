<template>
	<div id="root">
		<main_page></main_page>
	</div>
</template>

<script lang="ts" setup>
import { provide } from 'vue';
import main_page from './components/主页.vue';
import { websocket地址 } from './vue引入配置';

interface 指令参数 {
	类型: string;
	组件名: string;
	页面名: string;
	[key: string]: any;
}
export type { 指令参数 };

// 向子组件注入 公共方法
provide('发送指令', 发送指令);
// 连接websocket 获取数据 保存工程id
let 工程id: string = '111';
const ws = new WebSocket(websocket地址);
// 监听websocket返回消息
// 区分消息类型 根据不同类型解析数据
ws.onopen = 连接成功;
ws.onmessage = 通信;

// 方法
function 发送指令(args: 指令参数) {
	// 接收 对象 对象中必须有 类型 组件名 页面名 以及 其他任意字段
	let order: any = {
		senderip: 'admin',
		Password: 'admin',
		Username: 'admin',
		cmd_type: 'ControlCommand',
		projectid: 工程id, //工程id
		rectname: args.组件名,
		pagename: args.页面名,
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
	// let ws: any;
	// ws.send(order);
	console.log('发送指令', { ...order, ...args.data });
}
function 连接成功(e: any) {
	console.log('websocket已连接', e);
}
function 通信(e: any) {
	console.log('通信', e);
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
