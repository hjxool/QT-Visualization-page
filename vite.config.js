import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	server: {
		open: true,
		// 添加 host: '0.0.0.0' 才能让Vite开发服务器监听所有可用的网络接口
		// 即可以用本机IP访问开发服务器
		// 默认只会监听 localhost
		host: '0.0.0.0',
		// MacOS 和 Windows 在文件监控机制上有差异
		// 启用轮询监控 才能在 MacOS 触发热重载
		watch: {
			usePolling: true
		},
	},
});
