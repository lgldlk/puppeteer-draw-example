var express = require('express')
var app = express()
const fs = require('fs')
const port = 3000
const util = require('./util/index')
app.get('/', async function(req, res) {
    let query = req.query
    res.writeHead(200, {
        'Content-Type': 'image/png'
    })
    res.end(
        await util.textToImg({
            text: await util.getHitokoto({ c: query.c }, query.showAuthor),
            mode: query.mode,
            colors: query.color,
            shadowColor: query.shadowColor,
            shadowOffsetX: query.shadowOffsetX,
            shadowOffsetY: query.shadowOffsetX,
            fontSize: query.fontSize,
            wordLine: query.wordLine
        })
    )
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})