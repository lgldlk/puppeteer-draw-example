
```
npm i puppeteer
```

### 1.封装一下获取浏览器实例

```js
const puppeteer = require('puppeteer')
const mainConfig = require('./mainConfig')
class BrowserManage {
	browserDestructionTimeout //清理浏览器实例
	browserInstance //浏览器实例
	browserState = 'closed' //浏览器状态
	/**
	 * 用于长时间未进行操作时关闭浏览器实例
	 */
	scheduleBrowserForDestruction() {
		clearTimeout(this.browserDestructionTimeout)
		this.browserDestructionTimeout = setTimeout(async () => {
			if (this.browserInstance) {
				this.browserState = 'closed'
				await this.browserInstance.close() //关闭浏览器实例
			}
		}, 5000)
	}
	/**
	 * 用于长时间未进行操作时关闭浏览器实例
	 */
	async getBrowser() {
		return new Promise(async (resolve, reject) => {
			if (this.browserState === 'closed') {
				this.browserInstance = await puppeteer.launch(mainConfig.config.puppeteer) //开启浏览器实例
				this.browserState = 'open'
				resolve(this.browserInstance)
			}
			if (this.browserState === 'open') {
				if (this.browserInstance) {
					resolve(this.browserInstance)
				}
			}
		})
	}
}
module.exports = new BrowserManage()
```

这里的 `mainConfig.config.puppeteer` 为

```js
{
	args: ['--no-sandbox', '--disable-setuid-sandbox']
}
```

因为只用绘制功能所以，不会进行网页的跳转所以这里没有配置沙箱,如果你涉及了页面的跳转强烈建议你配置沙箱

> 参考
>
> https://developers.google.com/web/tools/puppeteer/troubleshooting
>
> https://stackoverflow.com/questions/66998228/why-is-no-sandbox-a-unsafe-arg-in-puppeteer

### 2.定义 绘图函数

这里以绘制文字为例

```js
exports.toImgData = async (options) => {
	let fontConfig = {
		baseLine: 5
	}

	function getColorX(i, colors) {
		if (colors instanceof Array) {
			return (i / (colors.length - 1)).toFixed(2)
		}
	}
	return new Promise((resolve, reject) => {
		let canvas = document.createElement('canvas')
		let ctx = canvas.getContext('2d'),
			font = options.text || '阿巴阿巴',
			fontSize = Number(options.fontSize || 32),
			fontFamily = options.fontFamily,
			lineHeight = fontSize + fontSize / fontConfig.baseLine
		canvas.width = fontSize * font.length
		canvas.height = lineHeight
		gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
		ctx.shadowColor = options.shadowColor || ''
		ctx.shadowOffsetX = options.shadowOffsetX || 2
		ctx.shadowOffsetY = options.shadowOffsetY || 2
		if (options.colors instanceof Array) {
			//实现渐变颜色
			for (let i = 0; i < options.colors.length; i++) {
				gradient.addColorStop(getColorX(i, options.colors), options.colors[i])
			}
		} else if (typeof options.colors == 'string') {
			gradient.addColorStop(0, options.colors)
		} else {
			// 默认颜色
			gradient.addColorStop(0, 'rgba(241,158,194,1)')
		}
		ctx.font = fontSize + 'px ' + fontFamily
		if (!options.mode || options.mode == '1') {
			//mode ==1为实线
			ctx.fillStyle = gradient
			ctx.fillText(font, 0, fontSize)
		} else if (options.mode == '2') {
			//mode ==2为字体镂空效果
			ctx.strokeStyle = gradient
			ctx.strokeText(font, 0, fontSize)
		}
		ctx.restore()
		const dataURI = canvas.toDataURL('image/png')
		const base64 = dataURI.substr(22) // 22 =`data:image/png;base64,`.length
		resolve(base64)
	})
}
```

### 3.获取并使用浏览器页面实例

```js
const browser = await browserManage.getBrowser()
const page = (await browser.pages())[0]
await page.setOfflineMode(true) //因为我们不需要进行网络资源读取,这样可以节省我可怜服务器的带宽
page.on('console', (msg) => console.log(msg.type(), msg.text())) //监听页面console事件
const base64 = await page.evaluate(toImgData, passedOptions)
browserManage.scheduleBrowserForDestruction()
const buffer = Buffer.from(base64, 'base64')
return buffer //返回Base64 编码的图片
```

这里注意 `page.evaluate`函数

> page.evaluate(pageFunction[, ...args])
>
> pageFunction <function|string> 要在页面实例上下文中执行的方法
>
> ...args <...Serializable|JSHandle> 要传给 pageFunction 的参数
>
> 返回: <Promise<Serializable>> pageFunction 执行的结果
>
> 这个函数就相当于在获取的页面实例中内部 eval 调用 js 函数

所以`toImgData`中的`getColorX`写在了内部

当然也可以把`getColorX`函数抽离然后这样调用

```js
await page.evaluate(getColorX) //就相当于把getColorX声明并定义
const base64 = await page.evaluate(toImgData, passedOptions)
```

-   效果如下

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31d090cfe45544e78c608ffefa0d9901~tplv-k3u1fbpfcp-watermark.image)

## 总结

本文介绍了 node 使用 puppeteer 进行绘图。要注意的地方是如果在 linux 中绘制中文会出现空白的情况
因为在 linux 中默认是没有安装中文字符的进行安装即可

> 安装可以参考文章 https://www.huaweicloud.com/articles/f618dd03bebe00f7edc9ceb4214c5254.html

并且在 linux 中直接 `npm i puppeteer`是启动不了的
需要自己安装 chromium
或者

```
sudo apt-get install gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

然后

```js
const browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium-browser", //通过executablePath配置Chromium 的路径
        ......
```

报错这个

```
  (node:28469) UnhandledPromiseRejectionWarning: Error: Failed to launch chrome!
[1025/150325.817887:ERROR:zygote_host_impl_linux.cc(89)]
```

是因为没配置沙箱，这样以无沙箱模式启动

```js
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox']}
  ......
```

建议配置沙箱

> 参考 https://github.com/puppeteer/puppeteer/issues/3443

例子 git 地址 https://github.com/lgldlk/puppeteer-draw-example/

欢迎加入前端学习讨论群 qq 群号： [530496237](https://jq.qq.com/?_wv=1027&k=OBRz4lMY)
