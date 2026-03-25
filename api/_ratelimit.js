import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let reportLimiter = null;
let leadLimiter = null;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** 5 report generations per 10-minute window per IP */
export function getReportLimiter() {
  if (reportLimiter) return reportLimiter;
  const redis = getRedis();
  if (!redis) return null;
  reportLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "rl:report",
  });
  return reportLimiter;
}

/** 3 lead submissions per 10-minute window per IP */
export function getLeadLimiter() {
  if (leadLimiter) return leadLimiter;
  const redis = getRedis();
  if (!redis) return null;
  leadLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    prefix: "rl:lead",
  });
  return leadLimiter;
}

/** Returns the client IP from Vercel headers */
export function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

/**
 * Applies rate limiting. Returns true if the request should be blocked.
 * If Upstash is not configured, allows all requests (graceful degradation).
 */
export async function applyRateLimit(req, res, limiter) {
  if (!limiter) return false; // no limiter configured — allow
  const ip = getClientIp(req);
  const { success, limit, remaining, reset } = await limiter.limit(ip);
  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);
  if (!success) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return true;
  }
  return false;
}
