const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLOcationMessage = (username, locationString) => {
    return {
        username,
        locationString,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage
}