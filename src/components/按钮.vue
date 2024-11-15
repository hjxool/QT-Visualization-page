<template>
	<div class="button" @click="点击事件()">
		{{ data.name }}
	</div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';
import { useStore } from 'vuex';

// 属性
const store = useStore();
const { 组件数据: data, 跳转子容器, 互锁 } = defineProps(['组件数据', '跳转子容器', '互锁']);
const 激活 = ref<boolean>(false);
// 按钮组件生成时就查询自身绑定的跳转是主页面还是附页
let 跳转类型: string = 查询跳转页类型();
watch(
	() => 互锁,
	(now: { 互锁组: string; 跳转页: string }) => {
		// 修改同一互锁组的按钮激活状态
		if (now.互锁组 === data.Interlock) {
			if (now.跳转页 !== data.JumpToPage && 激活.value) {
				// 跳转页 与 当前按钮跳转目标不同 且 当前处于激活状态
				激活.value = false;
			}
		}
	}
);

// 方法
function 点击事件() {
	// 只要按下就进入激活状态
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
	}
	// 不论是否跳转都下发指令
	激活状态切换();
}
function 查询跳转页类型(): string {
	if (!data.JumpToPage || data.JumpToPage === 'NONE') {
		return '不跳转';
	}
	for (let val of store.state.other.test_data.data) {
		if (val.pagename === data.JumpToPage) {
			return val.ismainpage ? '主页面' : '附页';
		}
	}
	return '不跳转';
}
function 激活状态切换() {
	switch (跳转类型) {
		case '不跳转':
		case '主页面':
			setTimeout(() => {
				激活.value = false;
			}, 100);
			break;
		case '附页':
			// 跳转附页当前按钮处于激活状态
			break;
	}
}
</script>

<style lang="less" scoped></style>
