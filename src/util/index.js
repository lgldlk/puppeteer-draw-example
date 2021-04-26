const textToImage = require('./textToImage')
const request = require('./request')

async function getHitokoto(parma, showAuthor) {
    let res = await request.get('https://v1.hitokoto.cn/', parma)
    let result = JSON.parse(res)
    return showAuthor ? result.hitokoto + '——' + result.from_who : result.hitokoto
}

let textToImg = async function(option) {
    const image = await textToImage.convertImg(option)
    return image
}

module.exports = {
    textToImg,
    getHitokoto
}