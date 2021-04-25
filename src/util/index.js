const TextToSVG = require('text-to-svg')
const svgToImg = require('svg-to-img')
const request = require('./request')

async function getHitokoto() {
    let res = await request.get('https://v1.hitokoto.cn/')
    console.log(res)
    return JSON.parse(res)
}
let fontToSvg = (() => {
    const textToSVG = TextToSVG.loadSync('fonts/SourceHanSerifCN-Medium.otf')
    return async function() {
        const attributes = { fill: 'red', stroke: 'yellow' }
        const options = { x: 0, y: 0, fontSize: 32, anchor: 'top', attributes: attributes }
        let res = await getHitokoto()
        let text = res.hitokoto
        const svg = textToSVG.getSVG(text, options)
        return svg
    }
})()
let svgToImgFunc = async function(svg) {
    const image = await svgToImg.from(svg).toPng({ background: '#000000' })
    return image
}

module.exports = {
    fontToSvg,
    svgToImgFunc
}