import { resolve } from 'path';
import { Sequelize } from 'sequelize';
import { Environment } from '../util/enums';
const env: any = process.env.NODE_ENV;
let path =
    env == Environment.TEST
        ? './../../config/config.json'
        : '../../../config/config.json';
const config = require(resolve(__dirname, path))[env];
export const sequelize = new Sequelize(config.database, null!, null!, config);
sequelize.authenticate();
