const textToImage = require('./textToImage')
const request = require('./request')

async function getHitokoto() {
    let res = await request.get('https://v1.hitokoto.cn/')
    console.log(res)
    return JSON.parse(res)
}

let textToImg = async function(option) {
    const image = await textToImage.convertImg(option)
    return image
}

module.exports = {
    textToImg,
    getHitokoto
}