import i18next from 'i18next';
import Validator from 'validatorjs';
import { ErrorCodes } from './enums';
import logger from './logger';

/**
 * @description : For set common response
 * @returns : responseData
 */
export function setResponseData() {
    return {
        status: false,
        data: '',
        message: '',
    };
}

/**
 * @description : For set success response data
 * @param message
 * @param data
 * @param status
 * @returns : Set success response data
 */
export const setSuccessResponseInfo = (
    responseData: any,
    message: string,
    data: any = null,
    status: boolean = true
) => {
    responseData.status = status;
    responseData.data = data;
    responseData.message = i18next.t(message);
};

/**
 * format error response.
 * @param responseData response data
 * @param path error trace path
 * @param err error
 * @returns return error response
 */
export const handleErrorResponse = (responseData: any, path: any, err: any) => {
    responseData.status = false;
    responseData.message = err.message;
    let exception = err.message.split('||');
    responseData.error = {
        code: exception[0],
        message: exception[0],
    };
    responseData.error.code = exception[0];
    responseData.message = exception[0];
    if (exception.length == 1) {
        responseData.error.code = ErrorCodes.DB_ERROR;
        responseData.error.message = exception[0];
    }
    logger.error(`${path} → ${err.message}`);
    return responseData;
};

/**
 * compare date with featureLive date.
 * @param date date
 * @param featureLive compare date
 * @returns true date is greater than featureLive date.
 */
export function isDateNewerThanFeatureLiveDate(date: Date, featureLive: Date) {
    return new Date(date) > featureLive;
}
