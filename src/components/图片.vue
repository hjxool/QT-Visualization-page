<template>
	<div class="img" :style="图片样式()">
		<img class="bg_img" :src="data.PictureNme_base" />
	</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

// 属性
const { 组件数据: data } = defineProps(['组件数据']);

// 根据图片文件名后缀区分是否读取本地图片
let t = data.PictureNme.split('.');
if (t[t.length - 1] == 'gif' || !data.PictureNme_base) {
	// gif图从本地获取
	data.PictureNme_base = `/图包/${data.PictureNme}`;
} else if (data.PictureNme_base && data.PictureNme_base !== 'NONE') {
	// base64图片缺少前缀
	let reg = /^data\:image\/png\;base64\,/;
	// 没有前缀则添加
	if (!reg.test(data.PictureNme_base)) {
		data.PictureNme_base = `data:image/png;base64,${data.PictureNme_base}`;
	}
}

// 方法
function 图片样式() {
	return {
		// borderColor: data.RectColor,
		// borderWidth: `${data.RectWidth}px`,
		// borderStyle: 'solid',
	};
}
</script>

<style lang="less" scoped>
.img {
	z-index: 10;
}
</style>
