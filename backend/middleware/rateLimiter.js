const { Redis }=require("@upstash/redis");
const { Ratelimit }=require("@upstash/ratelimit");

const redis=new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit=new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(200,"60s"), 
});
// 200 requests per 60 seconds

module.exports = ratelimit;