<template>
	<div class="grid" :style="栅格布局()">
		<!-- 背景 -->
		<img v-if="data.ActivePictureName_base != 'NONE'" class="bg_img" :src="data.BackGroundPicName_base" />
		<div v-else class="bg_img" :style="{ background: data.BackGroundColor }"></div>
		<!-- 按钮 -->
		<div class="button center" v-for="item in data.ButtonCount" @click="点击(item)" :style="按钮样式(item)">
			<div class="bg_img" :style="按钮背景(data.ButtonMode, item)"></div>

			<span>{{ item }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { useStore } from 'vuex';
import type { 依赖数据格式 } from '@/App.vue';

// 属性
const store = useStore();
const { 组件数据: data, 页面名 } = defineProps(['组件数据', '页面名']);
// 创建一个对象 将其地址传入 依赖收集
// 这样在修改里面的值时 依赖数据也会跟着变
const 依赖数据: 依赖数据格式 = {
	ID: data.DeviceId,
	组件名: data.name,
	页面名,
	激活序列: ref<number[]>([]), // 这里需要响应式 更新时 触发:style上的方法
	是否为输入端: data.IsIput,
};
const 缩放比 = computed(() => store.getters.缩放比);
// 将自身传入依赖数据中
const 依赖收集 = inject('依赖收集') as 依赖数据格式[];
添加到依赖();

let reg = /^data\:image\/png\;base64\,/;
if (data.BackGroundPicName_base !== 'NONE' && !reg.test(data.BackGroundPicName_base)) {
	data.BackGroundPicName_base = `data:image/png;base64,${data.BackGroundPicName_base}`;
}
if (data.ButtonMode == '图片') {
	if (data.ActivePictureName_base !== 'NONE' && !reg.test(data.ActivePictureName_base)) {
		data.ActivePictureName_base = `data:image/png;base64,${data.ActivePictureName_base}`;
	}
	if (data.PictureNme_base !== 'NONE' && !reg.test(data.PictureNme_base)) {
		data.PictureNme_base = `data:image/png;base64,${data.PictureNme_base}`;
	}
}
watch(
	() => store.state.通信数据,
	(now: { 类型: string; data: any }) => {
		if (now.类型 === '初始化') {
			let result = now.data['matrix'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
			if (result) {
				// 输入 取input字段 输出 取output
				依赖数据.激活序列.value = data.IsIput ? result['input'] : result['output'];
			}
		} else if (now.类型 === '更新') {
			let result = now.data['values'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
			if (result) {
				// 存在 则取外层 input 或 output字段值
				依赖数据.激活序列.value = data.IsIput ? now.data['input'] : now.data['output'];
			}
		}
	}
);

// 方法
function 栅格布局() {
	return {
		gridTemplateColumns: `repeat(${data.Column}, 1fr)`,
		gridTemplateRows: `repeat(${data.Row}, 1fr)`,
		gap: `${data.Spacing}px`,
		padding: `${data.UpSpacing}px ${data.RightSpacing}px ${data.DownSpacing}px ${data.LeftSpacing}px`,
	};
}
function 按钮样式(num: number) {
	return {
		borderColor: 依赖数据.激活序列.value.indexOf(num) == -1 ? data.RectColor : data.ActiveRectColor,
		borderWidth: `${data.RectWidth}px`,
		borderStyle: 'solid',
		color: 依赖数据.激活序列.value.indexOf(num) == -1 ? data.FontColor : data.ActiveFontColor,
		fontSize: `${data.FontSize * 缩放比.value.高度比}px`,
	};
}
function 按钮背景(type: string, num: number) {
	let style: any = {
		opacity: Math.round((data.ViseValue / 255) * 100) / 100,
	};
	switch (type) {
		case '纯色':
			style['background'] = 依赖数据.激活序列.value.indexOf(num) == -1 ? data.GroundColor : data.ActiveGroundcolor;
			break;
		case '图片':
			if (依赖数据.激活序列.value.indexOf(num) == -1) {
				// 非激活
				if (data.PictureNme_base !== 'NONE') {
					style['backgroundImage'] = `url(${data.PictureNme_base})`;
				} else {
					style['background'] = data.GroundColor;
				}
			} else {
				// 激活
				if (data.ActivePictureName_base !== 'NONE') {
					style['backgroundImage'] = `url(${data.ActivePictureName_base})`;
				} else {
					style['background'] = data.ActiveGroundcolor;
				}
			}
			break;
		case '双色水平渐变':
			if (依赖数据.激活序列.value.indexOf(num) == -1) {
				style['background'] = `linear-gradient(to right, ${data.GroundColor}, ${data.GroundColor2})`;
			} else {
				style['background'] = `linear-gradient(to right, ${data.ActiveGroundcolor}, ${data.ActiveGroundcolor2})`;
			}
			break;
		case '双色垂直渐变':
			if (依赖数据.激活序列.value.indexOf(num) == -1) {
				style['background'] = `linear-gradient(${data.GroundColor}, ${data.GroundColor2})`;
			} else {
				style['background'] = `linear-gradient(${data.ActiveGroundcolor}, ${data.ActiveGroundcolor2})`;
			}
			break;
	}
	return style;
}
function 添加到依赖() {
	let result = 依赖收集.find((e: 依赖数据格式) => e.ID == data.DeviceId && e.组件名 == data.name && e.页面名 == 页面名);
	if (!result) {
		// 不存在则添加
		依赖收集.push(依赖数据);
	}
}
function 点击(num: number) {
	if (data.IsIput) {
		// 输入 只能激活一个按钮
		依赖数据.激活序列.value = [num];
	} else {
		// 输出可以多个一起点亮
		依赖数据.激活序列.value.indexOf(num) == -1 && 依赖数据.激活序列.value.push(num);
	}
}
</script>

<style lang="less" scoped>
.grid {
	display: grid;
	background-image: url();
}
.button {
	overflow: hidden;
}
</style>
