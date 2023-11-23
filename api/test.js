const express = require("express")
const db = require('../mysql/sql')
const utils = require('../utils/utils')
const router = express.Router()
const axios = require('axios')

let resObj = {
    touser: "",
    template_id: "模板ID填写位置",
    lang: "zh-CN",
    data: {
        thing3: {
            value: "到点啦!"
        },
        date8: {
            value: "2023-10-23 16:20"
        }
    }
}

// post请求调用
function postAction(url, params) {
    return axios({
        url: url,
        method: 'POST',
        data: params
    })
}

// 获取列表页面
router.get('/getList', (req, res) => {
    const sqlStr = 'select * from list_All'
    const query = req.query
    db.query(sqlStr, (err, results) => {
        if (err)
            return console.log(err.message);
        let Obj = {}, maxId = 0
        let rs = JSON.parse(JSON.stringify(results))
        for (let item of rs) {
            item.Time = utils.formatterDate(item.Time, item.remindTime)
            // item.status = utils.compareDate(item.Time)
            if (item.id > maxId) maxId = item.id
        }
        Obj.calendarList = rs
        Obj.maxId = maxId
        res.send({
            code: 0,
            msg: 'success!',
            data: Obj
        })
    })

})

// 新增数据
router.post('/post', (req, res) => {
    const body = req.body
    console.log(1111111111111111);
    const sqlStr = 'insert into list_All set ?'
    db.query(sqlStr, body, (err, results) => {
        if (err)
            return console.log(err.message);
        if (results.affectedRows === 1) {
            console.log('插入成功!');
            res.send({
                code: 0,
                msg: '提交成功!',
            })
        }
    })
})

// 登录参数
router.post('/postCode', (req, res) => {
    const body = req.body
    console.log('----------body-------------');
    const sqlStr = 'update params set ? where appid=?'
    db.query(sqlStr, [body, body.appid], (err, results) => {
        if (err)
            return console.log(err.message);
        if (results.affectedRows === 1) {
            console.log('获取token成功!');
            res.send({
                code: 0,
                msg: '修改成功!'
            })
        }
    })

})


// 下发订阅消息  弃用--->转用定时任务获取数据下发
router.get('/sendMsg', (req, res) => {
    const sqlStr = 'select openid,access_token from params where appid = "APPID填写位置"'
    // 获取openid token
    db.query(sqlStr, (err, results) => {
        if (err)
            return console.log(err.message);
        // console.log(req.query.maxId); //20
        const selectDataSql = 'select Time,remindTime,title from list_All where id=' + req.query.maxId
        // 获取到最大的id并下发请求
        db.query(selectDataSql, (er, resul) => {
            if (er)
                return console.log(er.message);
            console.log(resul[0]);
            resObj.data.date8.value = utils.formatterDate(resul[0].Time, resul[0].remindTime)
            resObj.data.thing3.value = resul[0].title
            // 赋予openid token
            resObj.touser = results[0].openid
            const url = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + results[0].access_token
            // 下发请求
            postAction(url, resObj).then((rs) => {
                console.log('-----------下发请求-----------');
                console.log(rs.data);
                res.send({
                    code:0,
                    msg:'下发消息成功！'
                })
            })
        })
    })
})

module.exports = router
