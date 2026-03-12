const ratelimit=require("./rateLimiter");

const rateLimitMiddleware=async (req, res, next) => {
    const ip=req.ip;

    const {success}=await ratelimit.limit(ip);

    if(!success){
        return res.status(429).json({
            message: "Too many requests. Try again later."
        });
    }

    next();
};

module.exports = rateLimitMiddleware;