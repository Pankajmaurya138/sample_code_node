import e, { Request, Response } from 'express';
import Validator from 'validatorjs';
import i18next from 'i18next';
import PropertyRepo from '../repositories/property.repository';
import { Property } from '../../models/property.model';
import { PropertyErrorCodes } from '../../util/enums';
import logger from '../../util/logger';
import { RabbitContent } from '../../util/rabbitmqEventBus';
import PostPropertyRepo from '../repositories/postProperty.repository';
import { moveFilesToPermanentLocation } from '../../util/xmlUtils';
import {
    arrIterator,
    makePropertyObject,
    validateRequiredData,
} from '../../util/general';
import { isEmpty } from 'lodash';

export class PropertyController {
    private responseData: any;
    setResponseData() {
        this.responseData = {
            status: false,
            data: null,
            message: '',
        };
    }

    validateRequest = (validationData: any, req: Request) => {
        const lang: any = req.headers.locale || 'ar';
        Validator.useLang(lang);
        const validation = new Validator(req.body, validationData);
        if (!validation.passes()) {
            throw {
                ...{ message: validation.errors },
                error: new Error(),
            };
        }
    };

    setSuccessResponse = (message: string, data: any = null) => {
        console.log(message);

        this.responseData.status = true;
        this.responseData.data = data;
        this.responseData.message = i18next.t(message);
    };
    testApiFunction = async (req: Request, res: Response) => {
        this.setResponseData();
        try {
            let savedProperty = await PropertyRepo.saveProperty(req.body);
            if (!savedProperty.status) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            console.log(
                'savedProperty.propertysavedProperty.property',
                savedProperty.property
            );
            this.responseData.property = savedProperty.property;
        } catch (err) {
            let exception = err.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: err,
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
        }
        // callback(null, this.responseData);
    };

    isPropertyExist = async (id: any) => {
        return new Promise(async (resolve) => {
            resolve(true);
        });
    };

    createProperty = async (prop: any, index: any) => {
        index = index + 1;
        return new Promise(async (resolve, reject) => {
            const propRef = prop?.id?.toString();
            try {
                // resolve({ status: true, savedData: prop });
                console.log(
                    `\n\n ${index} ************ Preparing object for property ${propRef} ******`
                );
                let postData: any = await makePropertyObject(prop); // postData.filecwill be used in moveFilesToPermanentLocation()
                const postDataErrors: any = await validateRequiredData(
                    postData
                );
                if (postDataErrors?.length) {
                    resolve({ status: false, errors: postDataErrors });
                } else {
                    let savedProperty: any =
                        await PropertyRepo.savePropertyForXML(postData);
                    console.log(
                        `\n\n ${index}: Property Created for :', ${savedProperty?.property.id} ${savedProperty?.property?.title}\n\n`
                    );
                    resolve({ status: true, savedData: postData });
                    moveFilesToPermanentLocation(postData, savedProperty);
                }
            } catch (err: any) {
                if (
                    err?.message ==
                    PropertyErrorCodes.UNIT_REFERENCE_ALREADY_EXISTS
                ) {
                    return resolve({
                        errors: [
                            {
                                error: `Property is already created with this id :${propRef}, Error Code: ${PropertyErrorCodes.UNIT_REFERENCE_ALREADY_EXISTS}.`,
                                propertyNo: propRef,
                            },
                        ],
                    });
                }
                console.log('CATCH ERROR in createPropertyFn(): ', err);
                // reject({ createPropertyDbError: `${err}`, message: `Error in createPropertyFn() ${err?.message}` });
                return resolve({
                    errors: [
                        {
                            error: `Error while creating property id :${propRef} : ${err.message}`,
                            propertyNo: propRef,
                        },
                    ],
                });
            }
        });
    };

    createOrUpdateProp = async (parsedJSON: any, req: any) => {
        return new Promise(async (resolve, reject) => {
            const response: any = { updated: [], created: [], xmlDBrrors: [] };
            try {
                const { propertyArr = [] } = parsedJSON;
                const it = arrIterator(propertyArr, 0, propertyArr?.length - 1);
                let result: any = it.next();
                while (!result.done) {
                    const prop = result?.value || {};
                    prop.userId = req.userId;
                    prop.xmlUrl = req.xmlUrl;
                    prop.country = prop.country ? prop.country : req?.country;
                    prop.currency = prop.currency
                        ? prop.currency
                        : req?.currency;
                    const index = result.index;

                    const dbProperty = await this.isPropertyExist(prop?.id);
                    if (isEmpty(dbProperty)) {
                        // Create property
                        const createdResponse: any = await this.createProperty(
                            prop,
                            index
                        );
                        if (createdResponse?.errors?.length) {
                            response.xmlDBrrors = response.xmlDBrrors.concat(
                                createdResponse.errors
                            );
                        } else {
                            response.created.push({
                                id: prop?.id,
                                message: `Property created for unit reference number: ${createdResponse?.savedData?.generalInfo?.other?.unitReference}`,
                                // dbResponse: createdResponse
                            });
                        }
                    } else {
                        // update property
                        response.updated.push({
                            id: prop?.id,
                            message: 'Unable to update the properties',
                        });
                    }
                    result = it.next();
                }
                response.created = response.created?.length;
                delete response.updated;
                resolve(response);
            } catch (err: any) {
                console.log(
                    '\n\n ***********  Error in createOrUpdateProp:',
                    err
                );
                resolve({ ...response, exceptions: err });
            }
        });
    };

    /**
     * @description function for create property with general information
     * @param req
     * @param res
     */
    addPropertyForKSA = async (req: Request, res: Response) => {
        try {
            this.setResponseData();
            const validate = {
                listingTypeId: 'required',
                mainTypeId: 'required',
                propertyTypeId: 'required',
                optionTypeId: 'required',
                darReference: 'required',
                unitReference: 'required',
                userId: 'required',
                unitTypeId: 'required',
                countryId: 'required',
                cityId: 'required',
                zoneId: 'required',
                latitude: 'required',
                longitude: 'required',
            };
            this.validateRequest(validate, req);
            const requestData = req.body;
            let reArangeRequestData = this.setData(requestData);
            console.log('reArangeRequestData', reArangeRequestData);
            let savedProperty = await PropertyRepo.saveProperty(
                reArangeRequestData
            );
            if (!savedProperty.status) {
                throw new Error(i18next.t(savedProperty.message));
            }
            this.setSuccessResponse(
                'PROPERTY_GENERAL_INFORMATION_SAVED',
                savedProperty.property.id
            );
        } catch (err) {
            this.responseData.message = err.message;
        }
        res.json(this.responseData);
    };

    /**
     * @description function for save/update property description data
     * @param req
     * @param res
     */
    // attachPropertyDescription = async (req: Request, res: Response) => {
    //   try {
    //     this.setResponseData();

    //     const requestData = req.body;
    //     let savedPropertyDescription = await PropertyRepo.savePropertySecondStep(
    //       requestData
    //     );
    //     if (!savedPropertyDescription.status) {
    //       throw new Error(i18next.t("PROPERTY_NOT_FOUND"));
    //     }
    //     this.setSuccessResponse(
    //       "PROPERTY_DESCRIPTION_SAVED",
    //       savedPropertyDescription.property.id
    //     );
    //   } catch (err) {
    //     this.responseData.message = err.message;
    //   }
    //   res.json(this.responseData);
    // };

    /**
     * @description function for save/update property aminities data
     * @param req
     * @param res
     */
    // attachPropertyAmenities = async (req: Request, res: Response) => {
    //   try {
    //     this.setResponseData();
    //     const requestData = req.body;
    //     let savedPropertyAminities: any = [];
    //     // let savedPropertyAminities = await PropertyRepo.savePropertyThirdStep(
    //     //   requestData
    //     // );
    //     if (!savedPropertyAminities.status) {
    //       throw new Error(i18next.t("PROPERTY_NOT_FOUND"));
    //     }
    //     this.setSuccessResponse(
    //       "PROPERTY_AMINITY_SAVED",
    //       savedPropertyAminities.property.id
    //     );
    //   } catch (err) {
    //     this.responseData.message = err.message;
    //   }
    //   res.json(this.responseData);
    // };

    /**
     * @description function for save/update property files
     * @param req
     * @param res
     */
    // attachPropertyFiles = async (req: Request, res: Response) => {
    //   try {
    //     this.setResponseData();
    //     const requestData = req.body;
    //     let savedPropertyFiles: any = [];
    //     // let savedPropertyFiles = await PropertyRepo.savePropertyFourthStep(
    //     //   requestData
    //     // );
    //     if (!savedPropertyFiles.status) {
    //       throw new Error(i18next.t("PROPERTY_NOT_FOUND"));
    //     }
    //     this.setSuccessResponse(
    //       "PROPERTY_FILE_SAVED",
    //       savedPropertyFiles.property.id
    //     );
    //   } catch (err) {
    //     this.responseData.message = err.message;
    //   }
    //   res.json(this.responseData);
    // };
    setData = (requestData: any) => {
        requestData['GeneralInfo'] = {
            listingTypeId: requestData.listingTypeId,
            mainTypeId: requestData.mainTypeId,
            propertyTypeId: requestData.propertyTypeId,
            optionTypeId: requestData.optionTypeId,
            darReference: requestData.darReference,
            unitReference: requestData.unitReference,
            isActive: requestData.isActive,
            userId: requestData.userId,
            Status: {
                isSold: requestData.isSold,
                isEclusive: requestData.isEclusive,
                isHotDeal: requestData.isHotDeal,
                isInspected: requestData.isInspected,
                isFeatured: requestData.isFeatured,
            },
        };
        requestData['Location'] = {
            countryId: requestData.countryId,
            cityId: requestData.cityId,
            zoneId: requestData.zoneId,
            latitude: requestData.latitude,
            longitude: requestData.longitude,
        };
        requestData['Location'] = {
            countryId: requestData.countryId,
            cityId: requestData.cityId,
            zoneId: requestData.zoneId,
            latitude: requestData.latitude,
            longitude: requestData.longitude,
        };
        requestData['Attribute']['Area']['unitTypeId'] = requestData.unitTypeId;
        requestData['Attribute']['noOfBedrooms'] = requestData.noOfBedrooms;

        return requestData;
    };

    /**
     * @description : For edit property
     * @param req
     * @param res
     * @returns : Response
     */
    getPropertyById = async (req: Request, res: Response) => {
        const userData = res.locals.auth;
        console.log('userData', userData);
        this.setResponseData();
        try {
            let propertyById = await PropertyRepo.getPropertyDataById(
                req.params
            );
            if (!propertyById.status) {
                throw new Error(i18next.t('PROPERTY_NOT_FOUND'));
            }
            this.setSuccessResponse('', propertyById.property);
        } catch (e) {
            this.responseData.message = e.message;
        }
        res.json(this.responseData);
    };

    /**
     * @description : For edit property
     * @param req
     * @param res
     * @returns : Response
     */
    getUserProperty = async (req: Request, res: Response) => {
        this.setResponseData();
        try {
            let userProperties = await PropertyRepo.getUserProperties(
                req.params
            );
            console.log(userProperties);
            if (!userProperties) {
                console.log(i18next.t('USER_NOT_FOUND'));
                throw new Error(i18next.t('USER_NOT_FOUND'));
            }

            this.setSuccessResponse('', userProperties);
        } catch (e) {
            this.responseData.message = e.message;
        }
        res.json(this.responseData);
    };

    /**
     * @description For soft delete by user own property
     * @param req
     * @param res
     * @returns Response
     */
    deleteProperty = async (req: Request, res: Response) => {
        this.setResponseData();
        try {
            var propertyData = await Property.findByPk(req.params.id);
            if (!propertyData) {
                throw new Error(i18next.t('PROPERTY_NOT_FOUND'));
            }

            await propertyData.destroy();
            this.setSuccessResponse('PROPERTY_DELETED');
        } catch (e) {
            this.responseData.message = e.message;
        }
        res.json(this.responseData);
    };

    /**
     * @description Method for assign property to user
     * @param data
     */
    assignProperty = async (data: RabbitContent) => {
        let returnData = false;
        try {
            await PropertyRepo.assignPropertyById(data.metadata.propertyId);
            console.log('assigned success');
            returnData = true;
        } catch (e) {
            logger.error(`PropertyController::assignProperty : ${e.message}`);
        }
        return returnData;
    };

    saveXMLSummaryLogs = async (errorData: any, xmltoJSONData: any) => {
        const { totalPropertyCreated = 0 } = errorData;
        const { userId = null, xmlUrl = null } = xmltoJSONData;
        const totalProp: any = xmltoJSONData?.property?.length;
        if (totalProp > 0) {
            const failed = totalProp - totalPropertyCreated;

            const UserXmlLogData = {
                userId: userId,
                xmlUrl: xmlUrl,
                successCount: totalPropertyCreated || 0,
                failureCount: failed || 0,
                response: JSON.stringify(errorData),
            };
            PropertyRepo.insertXMLSummaryIntoDB(UserXmlLogData);
        }
    };

    handleErrorsForXMLPropertyCreation = async (
        errorData: any,
        xmltoJSONData: any
    ) => {
        this.saveXMLSummaryLogs(errorData, xmltoJSONData);
        const { userId = null, xmlUrl = null } = xmltoJSONData;
        // console.log('\n\n ******* handleErrorsForXMLPropertyCreation errorData :', errorData);
        const { XMLValidationError = [], xmlDBrrors = [] } = errorData;
        const allErrors = XMLValidationError.concat(xmlDBrrors);
        while (allErrors.length) {
            const err = allErrors.shift();
            if (err) {
                const insertObj: any = {
                    xmlUrl: xmlUrl,
                    userId: userId,
                    errorDetails: err?.error,
                    propertyRef: err?.propertyNo?.toString(),
                    propertyIndex: err?.propertyNo?.toString(),
                    errorType: 'required',
                    status: 'active',
                };
                PropertyRepo.insertErrorIntoDB(insertObj);
            }
        }
    };

    postPropertyTest = async (req: Request, res: Response) => {
        const userData = res.locals.auth;
        console.log('userData', userData);
        console.log('reqeust', req.body);
        this.setResponseData();
        try {
            let propertyById = await PostPropertyRepo.savePostProperty(
                req.body
            );

            this.setSuccessResponse('', propertyById);
        } catch (e: any) {
            this.responseData.message = e.message;
        }
        res.json(this.responseData);
    };
}
