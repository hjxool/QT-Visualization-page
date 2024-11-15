<template>
	<div>
		<!-- 普通组件 -->
		<template v-for="item in 面板数据.data">
			<cus-button class="component" v-if="item.property === 3" :组件数据="item" :跳转子容器="跳转子容器" :互锁="互锁" :style="通用组件样式(item)" />
			<div v-else>{{ item.name }}</div>
		</template>
		<!-- 容器组件 -->
		<container v-if="是否显示子容器" class="component" :面板数据="子容器数据" :style="面板样式()"></container>
	</div>
</template>

<script lang="ts" setup>
import { ref, defineProps, computed, onMounted } from 'vue';
import container from './组件容器.vue';
import { useStore } from 'vuex';
import cusButton from './按钮.vue';

onMounted(() => {
	初始化互锁组件状态();
});

// 属性
const store = useStore();
const 子容器数据 = ref<any>(null);
const { 面板数据 } = defineProps(['面板数据']); // function defineProps<T>(arr: <T>[])
const 是否显示子容器 = ref<boolean>(false);
const 缩放比 = computed(() => store.getters.缩放比);
// 组件一加载就读取自己
面板数据 && 获取子容器数据();
const 互锁 = ref({
	跳转页: '',
	互锁组: '',
});

// 方法
function 面板样式(): object {
	// 容器面板不同 不是满铺在页面 而是绝对定位
	let h = 子容器数据.value.height * 缩放比.value;
	let w = 子容器数据.value.width * 缩放比.value;
	let left = 子容器数据.value.X1 * 缩放比.value;
	let top = 子容器数据.value.Y1 * 缩放比.value;
	return {
		height: h + 'px',
		width: w + 'px',
		background: 子容器数据.value.grondcolor,
		top: top + 'px',
		left: left + 'px',
	};
}
function 获取子容器数据(name?: string): void {
	let t: any;
	if (name) {
		// 指定名称 取 附页 坐标属性
		t = 面板数据.data.find((e: any) => e.RectText === 'PAGECONTAINER' && e.name === name); // 附页 且 名称对应
	} else {
		// 没有指定名称 取 附页 IsShow属性为true的
		t = 面板数据.data.find((e: any) => e.RectText === 'PAGECONTAINER' && e.IsShow); // 附页 且 默认显示
	}
	if (t) {
		// 组件容器.vue 是 递归嵌套 的组件 因此要注意没有下一级时的处理
		是否显示子容器.value = true;

		let t2: any = store.state.other.test_data.data.find((e: any) => !e.ismainpage && e.pagename === t.name); // 附页 且 名称对应
		// 添加 坐标 属性
		t2.X1 = t.X1;
		t2.Y1 = t.Y1;
		子容器数据.value = t2;
	} else {
		// 没有下一级不显示 子容器
		是否显示子容器.value = false;
	}
}
function 通用组件样式(item: any): object {
	return {
		width: item.Width * 缩放比.value,
		height: item.Height * 缩放比.value,
		left: item.X1 * 缩放比.value,
		top: item.Y1 * 缩放比.value,
		zIndex: item.zValue,
	};
}
function 跳转子容器(name: string, 互锁组: string) {
	let t = 面板数据.data.find((e: any) => e.RectText === 'PAGECONTAINER' && e.name === name);
	if (t) {
		是否显示子容器.value = true;
		let t2 = store.state.other.test_data.data.find((e: any) => !e.ismainpage && e.pagename === t.name);
		// 添加 坐标 属性
		t2.X1 = t.X1;
		t2.Y1 = t.Y1;
		子容器数据.value = t2;
	} else {
		是否显示子容器.value = false;
	}
	if (互锁组 && 互锁组 !== 'NONE') {
		互锁.value = {
			互锁组,
			跳转页: name,
		};
	}
}
function 初始化互锁组件状态() {
	// 先找到附页名称
	let 跳转页 = 是否显示子容器.value && 子容器数据.value.pagename;
	// 再找当前面板下哪个组件跳转页相同 取其互锁组属性
	let 互锁组 = 是否显示子容器.value && 面板数据.data.find((e: any) => e.JumpToPage === 跳转页)?.Interlock;
	// 对传入的互锁属性进行初始化
	互锁.value = {
		跳转页: 跳转页 || '',
		互锁组: 互锁组 || '',
	};
}
</script>

<style lang="less" scoped>
.component {
	position: absolute;
}
</style>
