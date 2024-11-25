interface http请求参数 {
  (url: string, query?: object, 认证?: object): Promise<any>; // get请求 可传入query参数
  (url: string, method: string, body: object, 认证?: object): Promise<any> // 其他类型请求 可传入body参数 query参数自行拼接
}
export const http请求: http请求参数 = function (param1: string, param2?: object | string, param3?: object, param4?: object): Promise<any> {
  let options: any = {}
  if (typeof param2 === 'string') {
    options['method'] = param2
    options['body'] = JSON.stringify(param3 || {})
    options['headers'] = {
      // 有 body 时不能省略
      'Content-Type': 'application/json',
      ...param4 || {} // param4 不存在时展开空对象
    }
  } else {
    options['method'] = 'get'
    if (param2 && typeof param2 === 'object') {
      param1 += '?'
      let queue = Object.entries(param2)
      while (queue.length) {
        if (queue.length > 1) {
          let [key, value] = queue.shift() as string[]
          param1 += `${key}=${value}&`
        } else {
          let [key, value] = queue.shift() as string[]
          param1 += `${key}=${value}`
        }
      }
    }
    if (param3 && typeof param3 === 'object') {
      options['headers'] = {
        'Content-Type': 'application/json',
        ...param3
      }
    }
  }
  return fetch(param1, options).then(res => res.json()).catch(err => { console.log('http请求err', err, param1, options) })
}
