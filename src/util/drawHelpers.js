exports.toImgData = async(options) => {
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
            wordLine = Number(options.wordLine),
            lineHeight = fontSize + fontSize / fontConfig.baseLine,
            getPixelRatio = function(context) {
                var backingStore =
                    context.backingStorePixelRatio ||
                    context.webkitBackingStorePixelRatio ||
                    context.mozBackingStorePixelRatio ||
                    context.msBackingStorePixelRatio ||
                    context.oBackingStorePixelRatio ||
                    context.backingStorePixelRatio ||
                    1
                return (window.devicePixelRatio || 1) / backingStore
            }
        var ratio = getPixelRatio(ctx)
        ctx.scale(ratio, ratio)
        canvas.width = fontSize * (wordLine ? wordLine : font.length)
        canvas.height = wordLine ?
            fontSize / fontConfig.baseLine + lineHeight * Math.ceil(font.length / wordLine) :
            lineHeight

        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
        ctx.shadowColor = options.shadowColor || ''
        ctx.shadowOffsetX = options.shadowOffsetX || 2
        ctx.shadowOffsetY = options.shadowOffsetY || 2
        if (options.colors instanceof Array) {
            for (let i = 0; i < options.colors.length; i++) {
                gradient.addColorStop(getColorX(i, options.colors), options.colors[i])
            }
        } else if (typeof options.colors == 'string') {
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
        const base64 = dataURI.substr(22)
        canvas = ctx = null
        resolve(base64)
    })
}