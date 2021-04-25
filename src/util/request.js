const request = require('request')

const _ = require('underscore')

function post(url, data, isJson = true) {
    const options = {
        url,
        method: 'POST'
    }
    if (isJson) _.extend(options, { json: true, body: JSON.stringify(data) })
    else _.extend(options, { form: data })
    return new Promise((resolve, reject) => {
        request(options, (err, res, data) => {
            if (err) return reject(err)
            if (res.statusCode == 200) resolve(data)
        })
    })
}

function get(url, params = {}) {
    return new Promise((resolve, reject) => {
        request(
            url, {
                method: 'GET',
                qs: params
            },
            (err, res, body) => {
                if (err) return reject(err)
                else if (res.statusCode == 200) resolve(body)
            }
        )
    })
}

module.exports = {
    post,
    get
}