const Utils = {}
// 日期调整
Utils.formatterDate = (date, time) => {
    const formatDate = new Date(date)
    const year = formatDate.getFullYear()
    const month = formatDate.getMonth() + 1
    const day = formatDate.getDate()
    return year + '-' + month + '-' + day + ' ' + time
}
// 日期比较
Utils.compareDate = (date) => {
    const formatDate = new Date(date)
    const now = new Date()
    if (formatDate > now) {
        return 1
    } else {
        return 0
    }
    // console.log(formatDate, now);
    // console.log('2023-11-02 09:11' < '2023-11-02 09:12');
}

// 获取时间差值 单位s
Utils.getSubDate = (date) => {
    const formatDate = new Date(date)
    const now = new Date()
    return (formatDate - now)/1000
}

module.exports = Utils