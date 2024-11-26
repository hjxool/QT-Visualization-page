<template>
	<div :class="[data.ScrollDirect == '横' ? 'row_layout' : 'center']">
		<el-slider v-model="值" :min="最小值" :max="最大值" :step="步长" :marks="生成刻度值()" v-bind="动态属性" @input="下发指令()" />
	</div>
</template>

<script lang="ts" setup>
import { ref, defineProps, computed, inject, watch } from 'vue';
import { useStore } from 'vuex';
import type { 指令参数 } from '@/App.vue';

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
const 值 = ref<number>(data.SliderMin);
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
				值.value = parseFloat(result.value);
			}
		} else if (now.类型 === '更新') {
			let result = now.data['values'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
			if (result) {
				值.value = parseFloat(result.value[0]);
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
	发送指令({
		类型: '滑块',
		组件名: data.name,
		页面名,
		data: {
			value: [值.value],
		},
	});
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
