const puppeteer = require('puppeteer')
const mainConfig = require('./mainConfig')

class BrowserManage {
    browserDestructionTimeout
    browserInstance
    browserState = 'closed'
    scheduleBrowserForDestruction() {
        clearTimeout(this.browserDestructionTimeout)
        this.browserDestructionTimeout = setTimeout(async() => {
            if (this.browserInstance) {
                this.browserState = 'closed'
                await this.browserInstance.close()
            }
        }, 5000)
    }
    async getBrowser() {
        return new Promise(async(resolve, reject) => {
            if (this.browserState === 'closed') {
                this.browserInstance = await puppeteer.launch(mainConfig.config.puppeteer)
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