const wx = {
    appid: 'APPID填写位置',
    secret: '秘钥填写位置',
}
const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID填写位置&secret=秘钥填写位置'


const express = require('express')
const axios = require('axios')
const router = require('./api/test')
const intervalObj = require('./interval/setStatus')
const utils = require('./utils/utils')

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
// 启动定时任务
intervalObj.refreshStatus.start()
app.use('/api', router)

app.listen(9090, () => {
    console.log('server running!');
})
