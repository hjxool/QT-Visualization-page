<template>
	<div :class="[data.ScrollDirect == '横' ? 'row_layout' : 'center']">
		<el-slider v-model="target.值" :min="最小值" :max="最大值" :step="步长" :marks="生成刻度值()" v-bind="动态属性" @input="下发指令()" />
	</div>
</template>

<script lang="ts" setup>
import { ref, defineProps, computed, inject, watch, reactive } from 'vue';
import { useStore } from 'vuex';
import type { 指令参数 } from '@/App.vue';
import { 功能 } from '@/store/main';

interface Marks {
	[key: number]: string;
}

// interface 垂直样式属性 {
// 	vertical?: boolean;
// 	height?: string;
// }

// 属性
const store = useStore();
const { 组件数据: data, 页面名 } = defineProps(['组件数据', '页面名']);
const 缩放比 = computed(() => store.getters.缩放比);
// 找自己
let target = store.state.依赖数据.find((e: any) => e.组件名 == data.name && e.页面名 == 页面名);
if (!target) {
	// 滑块不一定绑定了其他组件 就不会添加到依赖 因此构造新的值
	target = reactive({ 值: data.SliderMin }); // 必须用reactive 否则下面要用target.value.值
}
const 最小值 = ref<number>(data.SliderMin);
const 最大值 = ref<number>(data.SliderMax);
const 步长 = ref<number>(计算步长());
const 发送指令 = inject('发送指令') as (args: 指令参数) => void;
// 监听 数据变化
watch(
	() => store.state.通信数据,
	(now: { 类型: string; data: any }) => {
		if (now.类型 === '初始化') {
			let result = now.data['slider'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
			if (result) {
				target.值 = parseFloat(result.value);
			}
		} else if (now.类型 === '更新') {
			let result = now.data['values'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
			if (result) {
				target.值 = parseFloat(result.value);
			}
		}
	}
);
const 动态属性 = computed(() => {
	if (data.ScrollDirect !== '横') {
		return {
			vertical: true,
			height: `${data.Height * 缩放比.value.高度比 - 20}px`,
		};
	} else {
		return {};
	}
});

// 方法
function 生成刻度值(): Marks {
	return {
		[data.SliderMin]: `${data.SliderMin}`,
		[data.SliderMax]: `${data.SliderMax}`,
	};
}
function 下发指令() {
	let body: any = {
		组件名: data.name,
		页面名,
		data: {
			value: `${target.值}`,
		},
		type: 'slider',
		ispress: -1,
	};
	if (data.device.length) {
		let t = data.device.split(';');
		switch (t[0]) {
			case 功能.控制窗帘:
				body.type = 'curtain';
				body.data.value = `${((target.值 - 最小值.value) / (最大值.value - 最小值.value)) * 100}`;
				// 以窗帘组件名义下发
				body.组件名 = target.目标组件;
				body.页面名 = target.目标页面;
				break;
		}
	}
	发送指令(body);
}
function 计算步长(): number {
	// data.LevelCount 表示全程滑动次数
	return Math.round(((data.SliderMax - data.SliderMin) / data.LevelCount) * 10) / 10;
}
</script>

<style lang="less" scoped>
.row_layout {
	padding: 0 20px;
}
</style>
