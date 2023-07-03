import express from 'express'
let app = express();

import form from './web/mailform.js'

app.get('/', (req, res) => {
    res.send(form.toString())
})

function webInit(data) {
    start();
}

function start() {
    app.listen(3000, () => {
        console.log('Server started at port 3000')
    })
}

export {
    webInit, start
}