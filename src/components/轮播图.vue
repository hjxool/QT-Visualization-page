<template>
	<div>
		<img class="bg_img" v-for="item in 轮播图" v-show="target.当前显示 == item.id" :key="item.id" :src="item.url" />
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';

// 属性
const store = useStore();
const { 组件数据: data, 页面名 } = defineProps(['组件数据', '页面名']);

// 找依赖数据
const target = store.state.依赖数据.find((e: any) => e.组件名 == data.name && e.页面名 == 页面名);

interface img {
	id: number;
	url: string;
}
const 轮播图 = ref<img[]>(初始化图片());

// 监听同步数据
watch(
	() => store.state.通信数据,
	(now: { 类型: string; data: any }) => {
		if (now.类型 === '初始化') {
			let result = now.data['mutiimage'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
			if (result) {
				target.当前显示 = parseInt(result.value);
			}
		} else if (now.类型 === '更新') {
			let result = now.data['values'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
			if (result) {
				target.当前显示 = parseInt(result.value[0]);
			}
		}
	}
);

// 方法
function 初始化图片(): img[] {
	let reg = /^data\:image\/png\;base64\,/;
	return data.MutiPicturenames.map((e: any) => ({
		id: e.id,
		url: reg.test(e.picturename_base) ? e.picturename_base : `data:image/png;base64,${e.picturename_base}`,
	}));
}
</script>

<style lang="less" scoped>
.bg_img {
	z-index: 10;
}
</style>
