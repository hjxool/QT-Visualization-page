<template>
	<div class="root">
		缩放比:{{ 缩放比 }}
		<container class="mb" :style="面板样式()" :面板数据="当前主页面"></container>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
// import type { State } from '@/store/main.ts';
import container from './组件容器.vue';

// 属性
const store = useStore();
// 计算属性返回的是ref对象 因此先要对value解构
// 报错！computed(() => store.getters)设置的是getters.value对象是响应式 因此会使解构出来的 缩放比 不能动态变化
// const {
// 	value: { 缩放比 },
// } = computed(() => store.getters);
const 缩放比 = computed(() => store.getters.缩放比);
// 获取当前主页面
store.commit('获取主页面');
const 当前主页面 = computed(() => store.state.当前主页面);

// 方法
function 面板样式(): object {
	let h = 当前主页面.value.height * 缩放比.value;
	return {
		height: h + 'px',
		background: 当前主页面.value.grondcolor,
	};
}
</script>

<style lang="less" scoped>
.root {
	width: 100%;
	height: 100%;
	overflow: auto;
}
.mb {
	position: relative;
	width: 100%;
}
</style>
