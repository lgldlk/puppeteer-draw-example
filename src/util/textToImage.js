const browserManage = require('./browserManage')
const drawHelpers = require('./drawHelpers')

const convertImg = async(passedOptions) => {
    console.log(passedOptions)
    const browser = await browserManage.getBrowser()
    const page = (await browser.pages())[0]
    await page.setOfflineMode(true)
    page.on('console', (msg) => console.log(msg.type(), msg.text()))
    const base64 = await page.evaluate(drawHelpers.stringifyFunction(drawHelpers.toImgData, passedOptions))
    browserManage.scheduleBrowserForDestruction()
    const buffer = Buffer.from(base64, 'base64')
    return buffer
}

module.exports = {
    convertImg
}