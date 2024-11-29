// 在 public 目录下的文件不能通过 import 引入
// 只能通过<script src> 或 <link href> 在 .html 中引用
// 而 .vue 模块不能使用 <script src> 或 <link href>
// 只能用 import 导入 src 目录下的文件
// 因此需要在 index.html 入口文件里引用 public 目录下的文件 相当于注册到全局
// 再在 src 下创建 .js 文件 export 导出全局变量
// 然后就可以在 .vue 模块中 import 引入所需变量
// const 运维配置IP = '192.168.31.75';

const http端口 = '8880';

const websocket端口 = '7998';
