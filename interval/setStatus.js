const cron = require('node-cron');
const db = require('../mysql/sql')
const utils = require('../utils/utils')
const axios = require('axios')
// 定义接口默认参数
let resObj = {
    touser: "",
    template_id: "模板ID填写位置",
    lang: "zh-CN",
    data: {
        thing3: {
            value: "到点啦！"
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

const intervalObj = {
    // 状态更新定时任务  last:per/1min
    refreshStatus: cron.schedule(' * * * * *', () => {
        // 1.选择数据并进行状态更新
        const selectSql = 'select id,Time,remindTime,title,remindStatus from list_All where status = 1'
        db.query(selectSql, (err, results) => {
            if (err) return console.log(err.message);
            for (let item of results) {
                if (item.remindStatus !== 1) {
                    let itemDate = utils.formatterDate(item.Time, item.remindTime) //2023-10-24 13:39
                    if (utils.getSubDate(itemDate) < 180) {
                        // 剩余时间小于3分钟 下发提醒任务
                        // 获取openid和token
                        const getTokenSql = 'select openid,access_token from params where appid = "APPID填写位置"'
                        db.query(getTokenSql, (err, idresult) => {
                            if (err) return console.log(err.message);
                            const url = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + idresult[0].access_token
                            resObj.touser = idresult[0].openid //openid
                            resObj.data.date8.value = itemDate
                            resObj.data.thing3.value = item.title + ',时间已不足3分钟。'
                            postAction(url, resObj).then((res) => {
                                let setremindSql = 'update list_All set remindStatus = 1 where id = ' + item.id
                                db.query(setremindSql, (er, rs) => {
                                    if (er) return console.log(er.message);
                                    if (rs.affectedRows === 1) {
                                        console.log('修改remindStatus成功!');
                                    }
                                })
                            })
                        })
                    }
                    if (utils.getSubDate(itemDate) < 0) {//时间差值<3min utils.getSubDate(itemDate)
                        let setSql = 'update list_All set status = 0 where id = ?'
                        db.query(setSql, item.id, (err, res) => {
                            if (err) return console.log(err.message);
                            console.log('更新Status成功!');
                        })
                    }
                }
            }
        })
        console.log('running a task every min');
    }, {
        scheduled: false
    })
}
// 刷新列表状态




module.exports = intervalObj
