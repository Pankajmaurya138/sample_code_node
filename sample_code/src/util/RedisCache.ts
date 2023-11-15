import logger from './logger';
import { REDIS_CONF } from './redisConstant';
const redis = require('redis');
const CACHE = process.env.REDIS_CACHE_ENABLED;
class RedisCache {
    private readonly client: any = redis.createClient({
        url: REDIS_CONF.url,
        username: REDIS_CONF.username,
        password: REDIS_CONF.password,
    });
    constructor() {
        this.client.connect();
    }

    async getValue(key: string): Promise<any> {
        try {
            if (CACHE != 'true') return null;
            return this.client.get(key);
        } catch (err: any) {
            logger.error(err);
            return null;
        }
    }

    async setValue(
        key: string,
        value: any,
        cacheDurationInSeconds: number
    ): Promise<boolean> {
        try {
            await this.client.set(key, JSON.stringify(value));
            await this.client.expire(key, cacheDurationInSeconds);
            return true;
        } catch (err: any) {
            logger.error(err);
            return false;
        }
    }
}
const redisCache = new RedisCache();
export { redisCache };
