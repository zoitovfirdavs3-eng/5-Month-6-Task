const { sign, verify } = require("jsonwebtoken");

module.exports = {
    createAccessToken: (payload) => sign(payload, process.env.ACCESS_TOKEN_KEY, {expiresIn: "5m"}),
    parseAccessToken: (token) => verify(token, process.env.ACCESS_TOKEN_KEY),
    createRefreshToken: (payload) => sign(payload, process.env.REFRESH_TOKEN_KEY, {expiresIn: "90d"}),
    parseRefreshToken: (token) => verify(token, process.env.REFRESH_TOKEN_KEY),
};