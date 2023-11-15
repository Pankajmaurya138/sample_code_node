import * as winston from 'winston';
import { Environment } from './enums';
class Logger {
    private logger: winston.Logger;
    constructor() {
        const date = new Date();
        const fileName = `logs/error-${date.getDay()}-${date.getMonth()}-${date.getFullYear()}.log`;
        this.logger = winston.createLogger({
            format: winston.format.json(),
            transports: [new winston.transports.File({ filename: fileName })],
        });
    }

    error = (message: any) => {
        if (process.env.NODE_ENV == Environment.PRODUCTION) {
            this.logger.error(message);
        } else {
            console.log(message);
        }
    };
}
const logger = new Logger();
export default logger;
