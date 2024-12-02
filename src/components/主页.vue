<template>
	<div class="root">
		<container class="mb" v-for="page in 组件树" v-show="当前主页面 === page.pagename" :style="面板样式(page)" :面板数据="page"></container>
	</div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useStore } from 'vuex';
// import type { State } from '@/store/main.ts';
import container from './组件容器.vue';

// 属性
const store = useStore();
// 添加浏览器视窗变化事件监听
window.addEventListener('resize', () => {
	获取视窗宽度();
});
获取视窗宽度();

// 计算属性返回的是ref对象 因此先要对value解构
// 报错！computed(() => store.getters)设置的是getters.value对象是响应式 因此会使解构出来的 缩放比 不能动态变化
// const {
// 	value: { 缩放比 },
// } = computed(() => store.getters);
// const 缩放比 = computed(() => store.getters.缩放比);

// 获取当前主页面 因为变成了异步获取界面 因此监听组件树构成后再获取主页面
const 当前主页面 = computed(() => store.state.当前主页面);
const 组件树 = computed(() => store.state.组件树);
watch(组件树, (now: any) => {
	now.length && store.commit('获取主页面');
});

// 方法
function 面板样式(panel: any): object {
	// let h = panel.height * 缩放比.value.高度比;
	return {
		// height: h + 'px',
		background: panel.grondcolor,
	};
}
function 获取视窗宽度() {
	const d = document.documentElement;
	const w = d.clientWidth;
	store.commit('set_state', { name: '视窗宽度', value: w });
	const h = d.clientHeight;
	store.commit('set_state', { name: '视窗高度', value: h });
}
</script>

<style lang="less" scoped>
.root {
	width: 100%;
	height: 100%;
	overflow: hidden;
	padding: 0;
	margin: 0;
}
.mb {
	position: relative;
	width: 100%;
	height: 100%;
}
</style>
