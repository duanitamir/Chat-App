const generateMessage = (username, text) =>{
    return{
        text,
        username,
        createdAt: new Date().getTime()
    }
};
const generateLocation = (username, coords) =>{
    return{
        username,
        location : `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
        createdAt: new Date().getTime()
    }
};

module.exports = {
    generateLocation,
    generateMessage
}