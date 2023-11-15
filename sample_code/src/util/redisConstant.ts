import { Environment } from './enums';
import { resolve } from 'path';
const env: any = process.env.NODE_ENV;
let path =
    env == Environment.TEST
        ? './../../config/redis.json'
        : '../../../config/redis.json';

export const REDIS_CONF = require(resolve(__dirname, path))[env];
export const TYPE_MASTERS_REDIS_KEY = 'TYPE_MASTERS';
export const CACHE_DURATION_15_MINUTES = 15 * 60; // Time in seconds
export const CACHE_DURATION_30_MINUTES = 30 * 60;
export const CACHE_DURATION_45_MINUTES = 45 * 60;
export const CACHE_DURATION_1_HOUR = 60 * 60;
export const CACHE_DURATION_1_HOUR_30_MINUTES = 80 * 60;
export const CACHE_DURATION_2_HOUR = 120 * 60;
export const CACHE_DURATION_4_HOUR = 60 * 4 * 60;

export enum RedisKeys {
    CURRENCY_CONVERSION_LIST = 'CURRENCY_CONVERSION_LIST',
}
