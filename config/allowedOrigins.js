const getCorrectHTTP = require("../correctHTTP");

const allowedOrigins = [
    getCorrectHTTP()
];

module.exports = allowedOrigins;