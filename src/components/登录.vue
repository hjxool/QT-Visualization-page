<template>
	<div class="login" :style="缩放()">
		<!-- 背景图 -->
		<img v-if="data.logingroundcolorpic_base !== 'NONE'" class="bg_img" :src="data.logingroundcolorpic_base" />
		<div v-else class="bg_img" :style="{ background: data.loginbackgroundcolor }"></div>
		<!-- 表单 -->
		<div class="scroll">
			<el-form :model="form" :rules="rules" ref="表单对象" label-width="auto" label-position="right">
				<el-form-item label="用户名" prop="用户名">
					<el-input v-model="form.用户名" />
				</el-form-item>

				<el-form-item label="密码" prop="密码">
					<el-input v-model="form.密码" show-password />
				</el-form-item>

				<el-form-item label="本机通信IP" prop="通信IP">
					<el-select v-model="form.通信IP">
						<el-option v-for="item in IP列表" :label="item" :value="item" />
					</el-select>
				</el-form-item>

				<el-form-item label="系统语言" prop="语言">
					<el-select v-model="form.语言">
						<el-option v-for="item in 语言列表" :label="item" :value="item" />
					</el-select>
				</el-form-item>

				<div class="row_layout check">
					<div class="row_layout" @click="form.记住账号 = !form.记住账号">
						<div class="icon">
							<img v-show="!form.记住账号" class="bg_img" src="/img/未勾选.png" />
							<img v-show="form.记住账号" class="bg_img" src="/img/勾选.png" />
						</div>

						<span>记住账号</span>
					</div>

					<div class="row_layout" @click="form.记住密码 = !form.记住密码">
						<div class="icon">
							<img v-show="!form.记住密码" class="bg_img" src="/img/未勾选.png" />
							<img v-show="form.记住密码" class="bg_img" src="/img/勾选.png" />
						</div>

						<span>记住密码</span>
					</div>
				</div>

				<div class="row_layout" style="justify-content: center">
					<el-button type="primary" @click="登录(表单对象)">登录</el-button>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from 'vue';
import { http地址 } from '@/vue引入配置';
import type { FormInstance } from 'element-plus';
import { http请求 } from '@/api/请求';
import { 消息 } from '@/api/消息';
import { useStore } from 'vuex';

onMounted(async () => {
	try {
		// 获取本机IP
		let {
			data: { ip },
		} = await http请求(`${http地址}/GetCofig`);
		form.value.通信IP = ip;
		IP列表.value.push(ip);
	} catch (error) {
		console.log('登录组件err', error);
	}
});

// 属性
const store = useStore();
const { 组件数据: data } = defineProps(['组件数据']);
const 缩放比 = computed(() => store.getters.缩放比);
// 定义表单对象接口
interface Form {
	用户名: string;
	密码: string;
	通信IP: string;
	语言: string;
	记住账号: boolean;
	记住密码: boolean;
}
// 表单参数
const form = ref<Form>({
	用户名: '',
	密码: '',
	通信IP: '',
	语言: '中文',
	记住账号: store.state.记住账号,
	记住密码: store.state.记住密码,
});
// 验证规则
const rules = ref({
	用户名: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
	密码: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
	通信IP: [{ required: true, message: '', trigger: 'change' }],
	语言: [{ required: true, message: '', trigger: 'change' }],
});
const IP列表 = ref<string[]>([]);
const 语言列表 = ref<string[]>(['中文']);
// 注意 element表单的ref要先声明
const 表单对象 = ref<FormInstance>();

// base64图片缺少前缀
let reg = /^data\:image\/png\;base64\,/;
// 没有前缀则添加
if (data.logingroundcolorpic_base !== 'NONE' && !reg.test(data.logingroundcolorpic_base)) {
	data.logingroundcolorpic_base = `data:image/png;base64,${data.logingroundcolorpic_base}`;
}
表单初始化();

// 方法
function 登录(formRef: FormInstance) {
	formRef.validate(async (result: boolean) => {
		if (result) {
			let res = await http请求(`${http地址}/UserOperation`, 'post', {
				data: {
					username: form.value.用户名,
					password: form.value.密码,
					type: 1,
				},
			});
			if (res.code == 200) {
				// 登陆成功 根据组件的JumpToPage跳转对应主页面
				消息(`欢迎 ${form.value.用户名}`);
				// 登陆成功后 根据勾选记住项 存到全局变量
				form.value.记住账号 && store.commit('user/set_state', { name: '记住账号', value: form.value.用户名 });
				form.value.记住密码 && store.commit('user/set_state', { name: '记住密码', value: form.value.密码 });
				store.commit('获取主页面', data.JumpToPage);
				store.commit('set_state', { name: '已登录', value: true });
			} else {
				// 登录失败 留在原位
				消息('登陆验证失败', 'error');
			}
		}
	});
}
function 表单初始化() {
	form.value.记住账号 && (form.value.用户名 = store.state.user.用户名);
	form.value.记住密码 && (form.value.密码 = store.state.user.密码);
}
function 缩放() {
	return {
		left: `${data.X1 * 缩放比.value.宽度比}px`,
		top: `${data.Y1 * 缩放比.value.高度比}px`,
		zIndex: data.zValue,
		width: `${data.Width}px`,
		height: `${data.Height}px`,
		transform: `scale(${缩放比.value.宽度比},${缩放比.value.高度比})`,
	};
}
</script>

<style lang="less" scoped>
.login {
	z-index: 10;
	padding: 20px 0;
	overflow: hidden;
	> .scroll {
		width: 100%;
		height: 100%;
		overflow: auto;
		padding: 0 20px;
	}
}
.icon {
	position: relative;
	z-index: 10;
	width: 20px;
	height: 20px;
	margin-right: 10px;
}
.check {
	justify-content: space-evenly;
	margin: 18px 0;
}
</style>
