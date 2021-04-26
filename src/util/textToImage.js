const puppeteer = require('puppeteer')
const helpers_1 = require('./helpers')
const constants_1 = require('./constants')
const queue = []
let browserDestructionTimeout
let browserInstance
let browserState = 'closed'
const executeQueuedRequests = (browser) => {
    for (const resolve of queue) {
        resolve(browser)
    }
    queue.length = 0
}
const getBrowser = async() => {
    return new Promise(async(resolve) => {
        clearTimeout(browserDestructionTimeout)
        if (browserState === 'closed') {
            queue.push(resolve)
            browserState = 'opening'
            browserInstance = await puppeteer.launch(constants_1.config.puppeteer)
            browserState = 'open'
            return executeQueuedRequests(browserInstance)
        }
        if (browserState === 'opening') {
            return queue.push(resolve)
        }
        if (browserState === 'open') {
            if (browserInstance) {
                return resolve(browserInstance)
            }
        }
    })
}
const scheduleBrowserForDestruction = () => {
    clearTimeout(browserDestructionTimeout)
    browserDestructionTimeout = setTimeout(async() => {
        if (browserInstance) {
            browserState = 'closed'
            await browserInstance.close()
        }
    }, 500)
}
const convertImg = async(passedOptions) => {
    console.log(passedOptions)
    const browser = await getBrowser()
    const page = (await browser.pages())[0]

    await page.setOfflineMode(true)

    const base64 = await page.evaluate(helpers_1.stringifyFunction(helpers_1.toImgData, passedOptions))
    scheduleBrowserForDestruction()
    const buffer = Buffer.from(base64, 'base64')
    if (passedOptions.encoding === 'base64') {
        return base64
    }
    if (!passedOptions.encoding) {
        return buffer
    }
    return buffer.toString(passedOptions.encoding)
}

module.exports = {
    convertImg
}