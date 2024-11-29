<template>
	<div class="text" :style="文字样式()">{{ data.RectText }}</div>
</template>

<script setup lang="ts">
import { computed, defineProps, watch } from 'vue';
import { useStore } from 'vuex';
import 农历 from 'chinese-lunar';
import { http地址 } from '@/vue引入配置';
import { http请求 } from '@/api/请求';

// 属性
const store = useStore();
const { 组件数据: data, 页面名 } = defineProps(['组件数据', '页面名']);
const 缩放比 = computed(() => store.getters.缩放比);
组件功能();

// 方法
function 文字样式() {
	let style: any = {
		// borderColor: data.RectColor,
		// borderWidth: `${data.RectWidth}px`,
		// borderStyle: 'solid',
		fontSize: `${data.FontSize * 缩放比.value.高度比}px`,
		fontFamily: data.FontFormat,
		color: data.FontColor,
		writingMode: data.FontDirection == '横' ? 'horizontal-tb' : 'vertical-lr',
		left: `${data.X1 * 缩放比.value.宽度比}px`,
		top: `${data.Y1 * 缩放比.value.高度比}px`,
		zIndex: data.zValue,
		letterSpacing: `${data.Spacing}px`,
	};
	switch (data.FontStyle) {
		case '斜体':
			style['fontStyle'] = 'italic';
			break;
		case '粗体':
			style['fontWeight'] = 'bold';
			break;
		case '粗斜体':
			style['fontStyle'] = 'italic';
			style['fontWeight'] = 'bold';
			break;
		default:
			break;
	}
	return style;
}
function 组件功能() {
	// 仅为 NONE 时 拦截通信数据
	if (data.FontResult === 'NONE') {
		watch(
			() => store.state.通信数据,
			(now: { 类型: string; data: any }) => {
				if (now.类型 === '更新') {
					// 先找是否存在于values中
					let result = now.data['values'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
					result && (data.RectText = result.value[0]);
				}
			}
		);
	} else if (data.FontResult === '日期' || data.FontResult === '时间' || data.FontResult === '星期' || data.FontResult === '农历') {
		setInterval(() => {
			let d: Date = new Date();
			switch (data.FontResult) {
				case '日期':
					data.RectText = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
					break;
				case '时间':
					data.RectText = d.toString().split(' ')[4];
					break;
				case '星期':
					data.RectText = 获取星期(d);
					break;
				case '农历':
					let t = 农历.solarToLunar(new Date(d.getTime() - 24 * 60 * 60 * 1000));
					data.RectText = `${t.year}-${t.month}-${t.day}`;
					break;
			}
		}, 1000);
	} else if (data.FontResult === '中控IP' || data.FontResult === '中控温度') {
		http请求(`${http地址}/GetCofig`).then(({ data: { ip, temp } }) => {
			switch (data.FontResult) {
				case '中控IP':
					data.RectText = ip;
					break;
				case '中控温度':
					data.RectText = `${temp}°C`;
					break;
			}
		});
	}
}
function 获取星期(date: Date): string | void {
	switch (date.getDay()) {
		case 0:
			return '周日';
		case 1:
			return '周一';
		case 2:
			return '周二';
		case 3:
			return '周三';
		case 4:
			return '周四';
		case 5:
			return '周五';
		case 6:
			return '周六';
	}
}
</script>

<style lang="less" scoped>
.text {
	white-space: nowrap;
}
</style>
