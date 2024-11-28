<template>
	<div class="button center" @mousedown="按下()" @mouseup="抬起()" :style="按钮样式()">
		{{ data.RectText }}
		<template v-if="激活">
			<img v-if="data.ActivePictureName_base != 'NONE'" class="bg_img" :src="data.ActivePictureName_base" />
			<div v-else class="bg_img" :style="{ background: data.ActiveGroundcolor }"></div>
		</template>

		<template v-else>
			<img v-if="data.PictureNme_base != 'NONE'" class="bg_img" :src="data.PictureNme_base" />
			<div v-else class="bg_img" :style="{ background: data.GroundColor }"></div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, defineProps, inject, ref, watch } from 'vue';
import { useStore } from 'vuex';
import type { 指令参数 } from '@/App.vue';

// 属性
const store = useStore();
const { 组件数据: data, 跳转子容器, 互锁, 切换激活, 页面名 } = defineProps(['组件数据', '跳转子容器', '互锁', '切换激活', '页面名']);
const 激活 = ref<boolean>(data.IsActive);
const 缩放比 = computed(() => store.getters.缩放比);
// 按钮组件生成时就查询自身绑定的跳转是主页面还是附页
let 跳转类型: string = 查询跳转页类型();
// 拦截 互锁状态变化
if (data.BtnEffect === '互锁') {
	watch(
		() => 互锁,
		(now: { 互锁组: string; 触发者: string }) => {
			// 修改同一互锁组的按钮激活状态
			if (now.互锁组 === data.Interlock) {
				switch (跳转类型) {
					case '附页':
						if (now.触发者 !== data.JumpToPage && 激活.value) {
							// 触发者 与 当前按钮跳转目标不同 且 当前处于激活状态
							激活.value = false;
						}
						break;
					case '不跳转':
						if (now.触发者 !== data.name && 激活.value) {
							激活.value = false;
						}
						break;
				}
			}
		}
	);
}
// 监听 通信数据变化
// 只有 自锁 互锁 按钮才监听数据回显
if (data.BtnEffect === '互锁' || data.BtnEffect === '自锁') {
	watch(
		() => store.state.通信数据,
		(now: { 类型: string; data: any }) => {
			if (now.类型 === '初始化') {
				let result = now.data['btn'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
				if (result) {
					激活.value = result.ispress === 1;
				}
			} else if (now.类型 === '更新') {
				// 先找是否存在于values中
				let result = now.data['values'].find((e: any) => e.pagename === 页面名 && e.rectname === data.name);
				if (result) {
					// 存在 则取外层 ispress字段值
					激活.value = now.data['ispress'] === 1;
				}
			}
		}
	);
}
// 注入公共方法
// TS 类型断言
// as () => 表示类型为 函数
// ... 表示任意数量 ...args:any 表示任意数量 任意类型的参数
// => void 表示 无返回值
const 发送指令 = inject('发送指令') as (args: 指令参数) => void;
// base64图片缺少前缀
let reg = /^data\:image\/png\;base64\,/;
// 没有前缀则添加
if (data.ActivePictureName_base !== 'NONE' && !reg.test(data.ActivePictureName_base)) {
	data.ActivePictureName_base = `data:image/png;base64,${data.ActivePictureName_base}`;
}
if (data.PictureNme_base !== 'NONE' && !reg.test(data.PictureNme_base)) {
	data.PictureNme_base = `data:image/png;base64,${data.PictureNme_base}`;
}

// 方法
function 按下() {
	// 区分是否自锁 自锁非激活只下发按下 抬起不下发 激活只在抬起时下发
	if (data.Data === '130') {
		// 表示双发按钮
		// 只要按下就进入激活状态
		激活.value = true;
		// 不论是否跳转都下发指令
		指令参数(1);
	} else {
		// 其他为单发按钮
		if (data.BtnEffect === '自锁') {
			if (激活.value) {
				// 激活时 按下下发抬起指令
				激活.value = false;
			} else {
				// 非激活时 按下发送按下的指令
				激活.value = true;
			}
		} else {
			激活.value = true;
			switch (跳转类型) {
				case '主页面':
					// 跳转主页 直接修改全局属性
					store.commit('获取主页面', data.JumpToPage);
					break;
				case '附页':
					// 跳转附页 向自身父组件发送消息 修改父组件的子容器
					// 给其他互锁按钮发送消息 取消其他按钮的激活状态
					跳转子容器(data.JumpToPage, data.Interlock);
					break;
				case '不跳转':
					// 不跳转 但有可能与其他按钮为互锁
					if (data.Interlock && data.Interlock !== 'NONE') {
						// 存在互锁组 且 不跳转
						切换激活(data.Interlock, data.name);
					}
					break;
			}
		}
		指令参数(-1);
	}
}
function 抬起() {
	if (data.Data === '130') {
		激活.value = false;
		指令参数(0);
	} else {
		if (data.BtnEffect !== '自锁') {
			switch (跳转类型) {
				case '主页面':
					激活.value = false;
					break;
				case '不跳转':
					// 不跳转 且 没有互锁 抬起时还原
					if (!data.Interlock || data.Interlock === 'NONE') {
						激活.value = false;
					}
					break;
			}
		}
	}
}
function 查询跳转页类型(): string {
	if (!data.JumpToPage || data.JumpToPage === 'NONE') {
		return '不跳转';
	}
	// JSON.parse(store.state.源数据)
	let queue = [...store.state.组件树];
	while (queue.length) {
		let size: number = queue.length;
		while (size--) {
			let node = queue.shift();
			if (node.pagename === data.JumpToPage) {
				// 找到 返回结果
				// 注意 只有组件树最外层才是主页面 所以没有ismainpage字段就是附页
				return node.ismainpage ? '主页面' : '附页';
			}
			// 没找到 将子节点放入队列
			for (let val of node.data || []) {
				if (val.RectText === 'PAGECONTAINER') {
					queue.push(val);
				}
			}
		}
	}
	return '不跳转';
}
function 指令参数(按下: number) {
	setTimeout(() => {
		发送指令({
			类型: '按钮',
			组件名: data.name,
			页面名,
			按下: 按下,
			data: {},
		});
	}, data.LateTime * 1000);
}
function 按钮样式() {
	return {
		color: 激活.value ? data.ActiveFontColor : data.FontColor,
		fontSize: `${data.FontSize * 缩放比.value.高度比}px`,
		fontFamily: data.FontFormat,
		borderColor: 激活.value ? data.ActiveRectColor : data.RectColor,
		borderWidth: `${data.RectWidth}px`,
		borderStyle: 'solid',
	};
}
</script>

<style lang="less" scoped></style>
