const { query } = require('express')

exports.getFileTypeFromPath = (path) => {
    return path.toLowerCase().replace(new RegExp('jpg', 'g'), 'jpeg').split('.').reverse()[0]
}
exports.stringifyFunction = (func, ...argsArray) => {
    // Remove istanbul coverage instruments
    const functionString = func.toString().replace(/cov_(.+?)\+\+[,;]?/g, '')
    const args = []
    for (const argument of argsArray) {
        switch (typeof argument) {
            case 'string':
                args.push('`' + argument + '`')
                break
            case 'object':
                args.push(JSON.stringify(argument))
                break
            default:
                args.push(argument)
        }
    }
    return `(${functionString})(${args.join(',')})`
}

exports.toImgData = async(options) => {
    function getColorX(i, colors) {
        return (i / (colors.length - 1)).toFixed(2)
    }
    return new Promise((resolve, reject) => {
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d'),
            font = options.text || '阿巴阿巴',
            fontSize = Number(options.fontSize || 32),
            fontFamily = options.fontFamily,
            wordLine = Number(options.wordLine),
            lineHeight = fontSize + fontSize / 5
        canvas.width = fontSize * (wordLine ? wordLine : font.length)
        canvas.height = wordLine ? fontSize / 5 + lineHeight * Math.ceil(font.length / wordLine) : lineHeight

        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
        ctx.shadowColor = options.shadowColor || ''
        ctx.shadowOffsetX = options.shadowOffsetX || 2
        ctx.shadowOffsetY = options.shadowOffsetY || 2
        if (options.colors instanceof Array) {
            for (let i = 0; i < options.colors.length; i++) {
                gradient.addColorStop(getColorX(i, options.colors), options.colors[i])
            }
        } else if (options.colors instanceof String) {
            gradient.addColorStop(0, options.colors)
        } else {
            gradient.addColorStop(0, 'rgba(241,158,194,1)')
        }

        ctx.font = fontSize + 'px ' + fontFamily
        if (!options.mode || options.mode == '1') {
            ctx.fillStyle = gradient
        } else if (options.mode == '2') {
            ctx.strokeStyle = gradient
        }
        if (wordLine) {
            for (let i = 1; font.length > 0; i++) {
                let tmpFont = font.substring(0, wordLine)
                font = font.substring(wordLine)
                if (!options.mode || options.mode == '1') {
                    ctx.fillText(tmpFont, 0, lineHeight * i)
                } else if (options.mode == '2') {
                    ctx.strokeText(tmpFont, 0, lineHeight * i)
                }
            }
        } else {
            if (!options.mode || options.mode == '1') {
                ctx.fillText(font, 0, fontSize)
            } else if (options.mode == '2') {
                ctx.strokeText(font, 0, fontSize)
            }
        }
        ctx.restore()
        const dataURI = canvas.toDataURL('image/png')
        const base64 = dataURI.substr(`data:image/png;base64,`.length)
        canvas = ctx = null
        resolve(base64)
    })
}