const { globalError, ClientError } = require("shokhijakhon-error-handler");
const { parseAccessToken } = require("../lib/jwt.service");

module.exports = (req, res, next) => {
    try{
        let auth = req.headers.authorization;
        if(!auth) throw new ClientError("Unauthorized", 401);
        const tokenType = auth.split(" ")[0];
        const accessToken = auth.split(" ")[1];
        if(tokenType != "Bearer" || !accessToken) throw new ClientError("Forbidden", 403);
        let parseToken = parseAccessToken(accessToken);
        req.user = parseToken;
        next()
    }catch(err){
        if(err.name == 'TokenExpiredError'){
            return res.status(401).json({
                code: "TOKEN_EXPIRED",
                message: "Access token expired"
            })
        };
        return globalError(err, res)
    }
}