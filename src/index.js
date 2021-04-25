var express = require('express')
var app = express()
const fs = require('fs')
const port = 3000
const util = require('./util/index')
app.get('/', async function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'image/png'
    })
    res.end(await util.svgToImgFunc(await util.fontToSvg()))
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})