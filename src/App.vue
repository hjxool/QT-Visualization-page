<template>
	<div id="root">
		<main_page></main_page>
	</div>
</template>

<script lang="ts" setup>
import main_page from './components/主页.vue';
import { useStore } from 'vuex';

const store = useStore();

获取视窗宽度();

// 添加浏览器视窗变化事件监听
window.addEventListener('resize', () => {
	获取视窗宽度();
});

// 方法
function 获取视窗宽度() {
	const d = document.documentElement;
	const w = d.clientWidth;
	store.commit('set_state', { name: '视窗宽度', value: w });
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
