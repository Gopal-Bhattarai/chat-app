
const generateMessage = (message,username='Admin') => {
    return {
        message,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (url,username='admin') => {
    return {
        url,
        username,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}