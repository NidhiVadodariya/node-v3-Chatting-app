exports.generateMessages = (username,text) => {
    return {
        username,
        text,
        createdAt : new Date().getTime()
    }
}

exports.generateLocationMessages = (username,url) => {
    return {
        username,
        url,
        createdAt : new Date().getTime()
    }
}