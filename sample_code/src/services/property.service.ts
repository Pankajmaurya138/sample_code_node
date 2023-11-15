import {
    API_VERSIONS,
    idTypeEnums,
    Locale,
    PropertyErrorCodes,
    PropertyType,
    ResidencyTypeSlug,
    RoleIdEnums,
    PropertySlugEnum,
} from '../util/enums';
import PropertyRepo from '../v1/repositories/property.repository';
import logger from '../util/logger';
import { Property } from '../models/property.model';
import { PropertySerialize } from '../models/PropertySerialize.model';
import PostPropertyRepo from '../v1/repositories/postProperty.repository';
import { createOrFindOwner } from '../models/propertyOwner.model';
import { getVerifiedUserDetails } from '../models/userVerifiedInfo.model';
import {
    validateJSONForProperty,
    selectProps,
    setErrorMessageForGrpc,
} from '../util/general';
import { PropertyController } from '../v1/controllers/property.controller';
import { City } from '../models/city.model';
import rabbitMQService from '../util/rabbitmqcon';
import {
    CR_NO_NOT_FOUND,
    ERROR_MSG,
    propertySteps,
    RESIDENECY_TYPE,
    SUCCESS_MSG,
    UNAUTHORIZED_STATUS_CODE,
    COMPANY_IDENTITY_NUMBER,
} from '../util/constant';
const propertyInstance = new PropertyController();
import axios, { AxiosError } from 'axios';
import {
    POSTPROPERTY,
    PROPERTY_VERFICATION_LAST_STEP_FEATURE_LIVE_DATE,
} from '../util/static';
import identityClient from './identityService';
import { propertyTransformer } from '../util/transformers';
import { setImageFilesForProperty } from '../util/xmlUtils';
import { TYPE_MASTERS_REDIS_KEY } from '../util/redisConstant';
import { redisCache } from '../util/RedisCache';
import { utilityGrpcService } from '../util/UtilityGrpcService';
import i18next from 'i18next';
import {
    attributeDataV3,
    BUILD_YEAR,
    POSSION_TYPE_ID,
    postProprtyValidationDataV3,
    PROPERTY_STATUS,
    USER_TYPE_ID,
} from '../util/utils';
import {
    descriptionTemplate,
    generateDescriptionVariables,
} from './propertyContent.service';
import PropertyServiceHelper from '../util/PropertyServiceHelper';
import TokenService from './token.service';
import propertyFileRepo from '../repository/PropertyFile.repository';
import propertyStatusLogRepo from '../repository/propertyStatusLogRepo';
import { userService } from './user.service';
import {
    handleErrorResponse,
    isDateNewerThanFeatureLiveDate,
    setResponseData,
    setSuccessResponseInfo,
} from '../util/commonHelper';
import { PropertyStatusLog } from '../models/propertyStatusLog.model';

export class PropertyService {
    private responseData: any;
    tokenService: TokenService;

    constructor() {
        this.tokenService = new TokenService();
    }
    /**
     * @description : For set response format
     */
    setResponseData() {
        this.responseData = {
            error: null,
            property: null,
        };
    }
    setUserPropertyResponseData() {
        this.responseData = {
            error: null,
            data: null,
        };
    }
    setPostedPropertyResponseData() {
        this.responseData = {
            error: null,
            data: null,
        };
    }

    /**
     * @description Method for add property for international
     * @param property
     * @param callback
     */
    addPropertyForInternational = async (property: any, callback: any) => {
        this.setResponseData();
        try {
            const PropertySerializeData = new PropertySerialize(
                property.request
            );

            let savedProperty = await PropertyRepo.saveProperty(
                PropertySerializeData
            );

            if (!savedProperty.status) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            this.responseData.property = savedProperty.property;
            console.log('addPropertyForInternational responseData');
            console.log('→ error', this.responseData.error);
            console.log('→ property id', this.responseData.property.id);
        } catch (err) {
            let exception = err.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[1];
            }
            logger.error(
                `PropertyService::addPropertyForInternational → ${err.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description Method for add property for KSA
     * @param property
     * @param callback
     */
    addPropertyForKsa = async (property: any, callback: any) => {
        this.setResponseData();
        try {
            const PropertySerializeData = new PropertySerialize(
                property.request
            );
            let savedProperty = await PropertyRepo.saveProperty(
                PropertySerializeData
            );
            if (!savedProperty.status) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            this.responseData.property = savedProperty.property;
            console.log('addPropertyForKsa responseData', this.responseData);
        } catch (err) {
            let exception = err.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::addPropertyForKSA → ${err.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description : For edit property
     * @param req
     * @param res
     * @returns : Response
     */
    editProperty = async (data: any, callback: any) => {
        this.setResponseData();
        try {
            let property = await PropertyRepo.editProperty(data.request);
            if (!property) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            this.responseData.propertyData = property.propertyData;
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::editProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description Method for updateProperty  for all regions
     * @param property
     * @param callback
     */
    updateProperty = async (property: any, callback: any) => {
        this.setResponseData();
        try {
            console.log(
                `property.request → ID: ${property.request.id}, UnitRef: ${property.request.generalInfo.other.unitReference}`
            );
            const PropertySerializeData = new PropertySerialize(
                property.request
            );
            let savedProperty = await PropertyRepo.updateProperty(
                PropertySerializeData
            );
            if (!savedProperty.status) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            this.responseData.property = savedProperty.property;
            console.log(
                'updateProperty responseError',
                this.responseData.error
            );
            console.log(
                'updateProperty property id',
                this.responseData.property.id
            );
        } catch (err) {
            let exception = err.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::updateProperty → ${err.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description : For edit property
     * @param req
     * @param res
     * @returns : Response
     */
    getPropertyById = async (propertyId: any, callback: any) => {
        this.setResponseData();
        try {
            let propertyById = await PropertyRepo.getPropertyDataById(
                propertyId.request
            );
            if (!propertyById) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            this.responseData.property = propertyById.property;
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::getPropertyById → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description : For edit property
     * @param req
     * @param res
     * @returns : Response
     */
    getPropertyIdByUnitReference = async (
        propertyUnitReference: any,
        callback: any
    ) => {
        this.setResponseData();
        try {
            let propertyId = await PropertyRepo.getPropertyIdByUnitReference(
                propertyUnitReference.request
            );
            if (!propertyId) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            this.responseData.propertyId = propertyId.propertyId;
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getPropertyIdByUnitReference → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description : For edit property
     * @param req
     * @param res
     * @returns : Response
     */
    getUserProperty = async (userRequest: any, callback: any) => {
        this.setUserPropertyResponseData();
        try {
            const propertyData = await PropertyRepo.getUserProperties(
                userRequest.request
            );
            if (!propertyData) {
                throw new Error(
                    `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }

            this.responseData = propertyData;
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::getUserProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description : For get all user properties  via search params
     * @param req
     * @param res
     * @returns : Response
     */
    searchUserProperty = async (userRequest: any, callback: any) => {
        this.setUserPropertyResponseData();
        try {
            const propertyData = await PropertyRepo.searchUserProperty(
                userRequest.request
            );
            if (!propertyData) {
                throw new Error(
                    `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }

            this.responseData = propertyData;
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::searchUserProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description : For edit property
     * @param req
     * @param res
     * @returns : Response
     */
    getUserPropertyStatusCount = async (userRequest: any, callback: any) => {
        this.setUserPropertyResponseData();
        try {
            const propertyStatusCount =
                await PropertyRepo.getUserPropertyStatusCount(
                    userRequest.request
                );
            if (!propertyStatusCount) {
                throw new Error(
                    `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }

            this.responseData.headers = propertyStatusCount;
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getUserPropertyStatusCount → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };
    /**
     * @description For soft delete by user own property
     * @param req
     * @param res
     * @returns Response
     */
    deleteProperty = async (propertyId: any, callback: any) => {
        this.setResponseData();
        try {
            var propertyData = await Property.findByPk(propertyId.request.id);

            if (!propertyData) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            if (propertyData) {
                await propertyData.destroy();
            }
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
        }
        callback(null, this.responseData);
    };
    /**
     * @description For soft delete by user own property
     * @param req
     * @param res
     * @returns Response
     */
    archiveProperty = async (arg: any, callback: any) => {
        this.setResponseData();
        try {
            const updateProperty = await PropertyRepo.archiveProperty(
                arg.request
            );

            if (!updateProperty.status) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::archiveProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description For soft delete by user own property
     * @param req
     * @param res
     * @returns Response
     */
    renewProperty = async (arg: any, callback: any) => {
        this.setResponseData();
        try {
            const updatedProperty = await PropertyRepo.renewProperty(
                arg.request
            );

            if (!updatedProperty.status) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::renewProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description For soft delete by user own property
     * @param req
     * @param res
     * @returns Response
     */
    unpublishedProperty = async (arg: any, callback: any) => {
        this.setResponseData();
        try {
            const unpublishedProperty = await PropertyRepo.unpublishedProperty(
                arg.request
            );

            if (!unpublishedProperty.status) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::unpublishedProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description For updatePropertyStatus by user own property
     * @param req
     * @param res
     * @returns Response
     */
    updatePropertyStatus = async (arg: any, callback: any) => {
        this.setResponseData();
        try {
            const updatePropertyStatus =
                await PropertyRepo.updatePropertyStatus(arg.request);

            if (!updatePropertyStatus.status) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::unpublishedProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };
    /**
     * @description For updatePropertyStatus by user own property
     * @param req
     * @param res
     * @returns Response
     */
    transferProperty = async (arg: any, callback: any) => {
        this.setResponseData();
        try {
            const transferProperty = await PropertyRepo.transferProperty(
                arg.request
            );

            if (!transferProperty.status) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::transferProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };
    /**
     * @description For cities by user those have property
     * @param req
     * @param res
     * @returns Response
     */
    getUserCities = async (arg: any, callback: any) => {
        this.setResponseData();
        try {
            const cities = await PropertyRepo.getUserCities(arg.request);

            if (!cities) {
                throw new Error(
                    `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            this.responseData.city = cities;
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::transferProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };
    /**
     * @description For short journey find by id or default
     * @param req
     * @param res
     * @returns Response
     */
    getShortJourney = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const postedProperty = await PostPropertyRepo.getPostedProperty(
                arg.request
            );

            if (!postedProperty) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_NOT_FOUND}`
                );
            }
            this.responseData.data = postedProperty;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::transferProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    postBulkProperties = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        const xmltoJSONData = arg?.request;
        console.log('postBulkProperties called with xmltoJSONData');
        try {
            const { userId, xmlUrl, country, currency } = xmltoJSONData;
            const parsedJSON: any = await validateJSONForProperty(
                xmltoJSONData
            );
            if (parsedJSON?.propertyArr?.length) {
                const req: any = { userId, xmlUrl, country, currency };
                const result: any = await propertyInstance.createOrUpdateProp(
                    parsedJSON,
                    req
                );
                const allErrors = {
                    XMLErrors: parsedJSON?.validationErrors,
                    ...result,
                };
                this.responseData.XMLValidationError = allErrors?.XMLErrors;
                this.responseData.xmlDBrrors = allErrors?.xmlDBrrors;
                this.responseData.totalPropertyCreated =
                    allErrors?.created || 0;
            } else {
                this.responseData.XMLValidationError =
                    parsedJSON?.validationErrors;
            }
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::transferProperty → ${e.message}`);
        }
        console.log('\n\n FINAL RESPONSE:', JSON.stringify(this.responseData));
        propertyInstance.handleErrorsForXMLPropertyCreation(
            this.responseData,
            xmltoJSONData
        );
        callback(null, this.responseData);
    };
    /**
     * @description For short journey find by id or default
     * @param req
     * @param res
     * @returns Response
     */
    postShortJourney = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const postedProperty = await PostPropertyRepo.savePostProperty(
                arg.request
            );

            if (!postedProperty) {
                throw new Error(`${PropertyErrorCodes.PROPERTY_NOT_FOUND}`);
            }
            this.responseData.data = postedProperty;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::postShortJourney → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    getLongJourneyPropertyById = async (arg: any, callback: any) => {
        try {
            this.setResponseData();
            let postedProperty = await PostPropertyRepo.getPropertyInfobyId(
                arg.request
            );
            if (!postedProperty) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_NOT_FOUND}`
                );
            }
            this.responseData.data = postedProperty;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getLongJourneyPropertyById → ${e.message}`
            );
        }
        callback(null, this.responseData.data);
    };

    //Step 4 [GET API]
    getFeaturePropertyById = async (arg: any, callback: any) => {
        try {
            this.setResponseData();
            let postedProperty =
                await PostPropertyRepo.getFeaturePropertyInfobyId(arg.request);
            if (!postedProperty) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_NOT_FOUND}`
                );
            }
            this.responseData.data = postedProperty;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getFeaturePropertyById → ${e.message}`
            );
        }
        callback(null, this.responseData.data);
    };

    // Post Property Feature
    postFeatureProperty = async (arg: any, callback: any) => {
        try {
            this.setResponseData();
            let postedProperty = await PostPropertyRepo.getPostedProperty(
                arg.request
            );
            if (postedProperty) {
                let id = arg.request.id;
                let locale = arg.request.locale;
                let propertyDetails: any =
                    await PostPropertyRepo.getPropertyByPostedId({
                        id,
                        locale,
                    });
                if (propertyDetails) {
                    let propertyId = propertyDetails.id;

                    propertyDetails.update({
                        statusTypeId: PropertyErrorCodes.INCOMPLETE,
                    });
                    if (
                        propertyDetails?.statusTypeId ==
                            PropertyErrorCodes.APPROVED ||
                        propertyDetails?.statusTypeId ==
                            PropertyErrorCodes.REJECTED
                    ) {
                        await propertyDetails.update({
                            statusTypeId: PropertyErrorCodes.BRE_APPROVAL,
                        });
                        rabbitMQService.publishToDeleteProperty({
                            environment: process.env.NODE_ENV,
                            propertyId: propertyId,
                        });
                    }
                    let doc =
                        await PostPropertyRepo.updateFeatureLongJourneyProperty(
                            arg.request,
                            propertyId
                        );
                    let refNumber = propertyDetails.darReference;
                    if (refNumber) {
                        const darArr = refNumber.split(/[\s-]+/);
                        refNumber = darArr[darArr.length - 1];
                    }
                    this.responseData.property = arg?.request?.id;
                    this.responseData.message = 'PROPERTY_UPDATED_SUCESSFULLY';

                    if (!refNumber) {
                    }
                } else {
                    throw new Error(
                        `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                    );
                }
            } else {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::postFeatureProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    // save and update property detail in property table
    addLongJourneyProperty = async (arg: any, callback: any) => {
        this.setResponseData();
        try {
            let id = arg.request.id;
            let locale = arg.request.locale;
            let postedProperty: any = await PostPropertyRepo.getPostedProperty(
                arg.request
            );
            // Absher data: phoneNumber, AbsherID, fullname
            if (
                postedProperty &&
                !postedProperty.isDifferentOwner &&
                postedProperty.userTypeId == 47
            ) {
                let verifiedUserData = await getVerifiedUserDetails(
                    postedProperty.userId
                );
                postedProperty.idType = verifiedUserData?.ksa_citizen
                    ? idTypeEnums.NID
                    : idTypeEnums.IQAMA;
                postedProperty.nationalIdNumber = verifiedUserData?.absher_id;
                postedProperty.ownerName = verifiedUserData?.fullName;
                postedProperty.ownerMobileNo = verifiedUserData?.phoneNumber;
                postedProperty.ownerMobileCountryCode =
                    verifiedUserData?.phone_number_country_code;
            }
            if (postedProperty?.nationalIdNumber) {
                arg.request.propertyOwnerId = await createOrFindOwner(
                    postedProperty
                );
            }
            arg.request.titleDeedNo = postedProperty?.titleDeedNo;
            arg.request.postedAs = postedProperty?.userTypeId;

            // arg.request.regaAdNumber = postedProperty?.regaAdNumber
            // arg.request.isWathqVerified = postedProperty?.isWathqVerified
            //locatin detail getting from post property table
            arg.request.realestateDeedId = postedProperty?.realestateDeedId;
            arg.request.cityId = postedProperty?.dataValues?.cityId;
            let cityDetails = await City.findOne({
                where: { id: postedProperty?.dataValues?.cityId },
            });
            arg.request.districtId =
                postedProperty?.dataValues?.districtId || null;
            arg.request.zoneId = postedProperty?.dataValues?.zoneId
                ? postedProperty?.dataValues?.zoneId
                : '';
            arg.request.regionId = cityDetails?.state_id;
            arg.request.latitude = postedProperty?.dataValues?.latitude || null;
            arg.request.longitude =
                postedProperty?.dataValues?.longitude || null;
            arg.request.countryId = cityDetails?.country_id;
            arg.request.address = postedProperty?.dataValues?.address
                ? postedProperty?.dataValues?.address
                : '';
            arg.request.listingTypeId = postedProperty?.listingTypeId;
            arg.request.propertyVerificationInfoId =
                postedProperty?.propertyVerificationInfoId;
            arg.request.subUserId = postedProperty?.subUserId;
            arg.request.userId = postedProperty?.userId;
            arg.request.addedBy = postedProperty?.addedBy;
            // arg.request.source = postedProperty?.source;
            if (postedProperty) {
                let propertyData: any =
                    await PostPropertyRepo.getPropertyIdByPostPropertyId(id);

                if (propertyData) {
                    // update property detail function
                    // let propertyId = propertyDetails.id
                    await PostPropertyRepo.updateLongJourneyProperty(
                        arg.request,
                        propertyData
                    );
                    this.responseData.status = true;
                    this.responseData.property = id;
                    this.responseData.message = 'PROPERTY_UPDATED_SUCESSFULLY';
                } else {
                    // save property detail function
                    await PostPropertyRepo.saveLongJourneyProperty(arg.request);

                    this.responseData.status = true;
                    this.responseData.message = 'PROPERTY_ADDED_SUCESSFULLY';
                    this.responseData.property = id;
                }
            } else {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            console.log(`PropertyService::addLongJourneyProperty 1 , ${e}`);
            logger.error(
                `PropertyService::addLongJourneyProperty → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };
    // save and update property detail in property table  v3 version
    addLongJourneyPropertyV3 = async (arg: any, callback: any) => {
        this.setResponseData();
        try {
            let id = arg.request.id;
            let locale = arg.request.locale;
            const errorData: any = await this.postPropertyDetailsValidations(
                arg.request
            );
            if (errorData.length > 0) {
                this.responseData.status = false;
                this.responseData.message = errorData[0].error;
                this.responseData.data = null;
            } else {
                let postedProperty: any =
                    await PostPropertyRepo.getPostedProperty(arg.request);
                // Absher data: phoneNumber, AbsherID, fullname
                if (
                    postedProperty &&
                    !postedProperty.isDifferentOwner &&
                    postedProperty.userTypeId == USER_TYPE_ID
                ) {
                    let verifiedUserData = await getVerifiedUserDetails(
                        postedProperty.userId
                    );
                    postedProperty.idType = verifiedUserData?.ksa_citizen
                        ? idTypeEnums.NID
                        : idTypeEnums.IQAMA;
                    postedProperty.nationalIdNumber =
                        verifiedUserData?.absher_id;
                    postedProperty.ownerName = verifiedUserData?.fullName;
                    postedProperty.ownerMobileNo =
                        verifiedUserData?.phoneNumber;
                    postedProperty.ownerMobileCountryCode =
                        verifiedUserData?.phone_number_country_code;
                }
                if (postedProperty?.nationalIdNumber) {
                    arg.request.propertyOwnerId = await createOrFindOwner(
                        postedProperty
                    );
                }
                arg.request.titleDeedNo = postedProperty?.titleDeedNo;
                arg.request.postedAs = postedProperty?.userTypeId;
                // arg.request.regaAdNumber = postedProperty?.regaAdNumber
                // arg.request.isWathqVerified = postedProperty?.isWathqVerified
                // location detail getting from post property table
                arg.request.realestateDeedId = postedProperty?.realestateDeedId;
                arg.request.cityId = postedProperty?.dataValues?.cityId;
                let cityDetails = await City.findOne({
                    where: { id: postedProperty?.dataValues?.cityId },
                });
                arg.request.districtId =
                    postedProperty?.dataValues?.districtId || null;
                arg.request.zoneId = postedProperty?.dataValues?.zoneId
                    ? postedProperty?.dataValues?.zoneId
                    : '';
                arg.request.regionId = cityDetails?.state_id;
                arg.request.latitude =
                    postedProperty?.dataValues?.latitude || null;
                arg.request.longitude =
                    postedProperty?.dataValues?.longitude || null;
                arg.request.countryId = cityDetails?.country_id;
                arg.request.address = postedProperty?.dataValues?.address
                    ? postedProperty?.dataValues?.address
                    : '';
                arg.request.listingTypeId = postedProperty?.listingTypeId;
                arg.request.propertyVerificationInfoId =
                    postedProperty?.propertyVerificationInfoId;
                arg.request.subUserId = postedProperty?.subUserId;
                arg.request.userId = postedProperty?.userId;
                arg.request.currentStep = propertySteps.PROPERTY_DETAILS;
                arg.request.addedBy = postedProperty?.addedBy;
                // arg.request.source = postedProperty?.source;
                if (postedProperty) {
                    // update current-step
                    if (arg.request.currentStep) {
                        await postedProperty.update({
                            currentStep: arg.request.currentStep,
                        });
                    }
                    let propertyData: any =
                        await PostPropertyRepo.getPropertyIdByPostPropertyId(
                            id
                        );
                    // residencyTypeId fetch from by redis if residenceTypeId value is true.
                    arg.request.residenceTypeId = await this.setResidencyTypeId(
                        arg
                    );
                    if (propertyData) {
                        // update property detail function
                        // let propertyId = propertyDetails.id
                        await PostPropertyRepo.updateLongJourneyPropertyV3(
                            arg.request,
                            propertyData
                        );
                        this.responseData.status = true;
                        this.responseData.property = id;
                        this.responseData.message =
                            'PROPERTY_UPDATED_SUCESSFULLY';
                    } else {
                        // save property detail function
                        await PostPropertyRepo.saveLongJourneyPropertyV3(
                            arg.request
                        );
                        this.responseData.status = true;
                        this.responseData.message =
                            'PROPERTY_ADDED_SUCESSFULLY';
                        this.responseData.property = id;
                    }
                } else {
                    throw new Error(
                        `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                    );
                }
            }
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            console.log(`PropertyService::addLongJourneyProperty V3 , ${e}`);
            logger.error(
                `PropertyService::addLongJourneyPropertyV3 → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    // get post property detail by id
    getPropertyByPostPropertyId = async (arg: any, callback: any) => {
        this.setResponseData();
        try {
            let id = arg.request.id;
            let propertyId: any =
                await PostPropertyRepo.getPropertyInfoByPostPropertyId(id);
            this.responseData.propertyId = propertyId?.id;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getPropertyByPostPropertyId → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    getUserPropertiesByUserId = async (userRequest: any, callback: any) => {
        this.setUserPropertyResponseData();
        try {
            const propertyData =
                await PostPropertyRepo.getUserPropertiesByUserId(
                    userRequest.request
                );
            if (!propertyData) {
                throw new Error(
                    `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }

            this.responseData = propertyData;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getUserPropertiesByUserId → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    getUserPostPropertyStatusCount = async (
        userRequest: any,
        callback: any
    ) => {
        this.setUserPropertyResponseData();
        try {
            const propertyStatusCount =
                await PostPropertyRepo.getUserPostPropertyStatusCount(
                    userRequest.request
                );
            if (!propertyStatusCount) {
                throw new Error(
                    `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }

            this.responseData.headers = propertyStatusCount;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getUserPostPropertyStatusCount → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    updatePostPropertyStatus = async (userRequest: any, callback: any) => {
        this.responseData = {
            error: null,
            data: null,
            message: null,
        };
        try {
            const propertyStatus =
                await PostPropertyRepo.updatePostPropertyStatus(
                    userRequest.request
                );
            this.responseData.data = propertyStatus.data;
            this.responseData.message = propertyStatus.message;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::updatePostPropertyStatus → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    postBulkPropertiesCreateByXML = async (arg: any, callback: any) => {
        console.log('short journey');
        this.setPostedPropertyResponseData();
        try {
            const postedProperty = await PostPropertyRepo.getPostedProperty(
                arg.request
            );

            if (!postedProperty) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_NOT_FOUND}`
                );
            }
            this.responseData.data = postedProperty;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService::transferProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    postBulkPropertiesSummary = async (arg: any, callback: any) => {
        console.log(
            '\n\n *********** Data received postBulkPropertiesSummaryFn:',
            JSON.stringify(arg?.request)
        );
        this.setPostedPropertyResponseData();
        const xmltoJSONData = arg?.request;
        try {
            const { userId, xmlUrl } = xmltoJSONData;
            const condition = {
                where: { user_id: userId, xml_url: xmlUrl },
            };
            const summary = await PropertyRepo.getXMLSummary(condition);
            const allProperties = summary.map(
                selectProps(
                    'successCount',
                    'failureCount',
                    'xmlUrl',
                    'userId',
                    'createdAt'
                )
            );
            this.responseData.data = allProperties;
            this.responseData.message = 'SUCCESS';
        } catch (e: any) {
            logger.error(`PropertyService::transferProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description For assign subuser to property
     * @param req
     * @param res
     * @returns Response
     */
    assignPropertyToUser = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            // calling repository method to get assigned status and statusTypeId(by using it we will send sync ES for 505 status)
            const assignedProperty =
                await PostPropertyRepo.assignPropertyToUser(arg.request);

            if (!assignedProperty) {
                throw new Error(`${PropertyErrorCodes.PROPERTY_NOT_FOUND}`);
            }
            this.responseData.data = {
                status: 'SUCCESS',
                statusTypeId: assignedProperty?.statusTypeId,
            };
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::assignPropertyToUser → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    //adding property files (property photos and external video link)
    addPropertyPhotosAndVideo = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const imageResult: any = await this.generateImageUrlname(
                arg.request
            );
            imageResult.currentStep = propertySteps.PHOTOS_VIDEOS;
            const propertyRepoResult =
                await PostPropertyRepo.addPropertyPhotosAndVideo(imageResult);
            this.responseData.status = propertyRepoResult.status;
            this.responseData.data = propertyRepoResult.data;
            this.responseData.message = propertyRepoResult.message;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyPhotosAndVideo → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };
    /**
     * @description add/update the post-property basic details
     * @param arg {id, roleId, listingTypeId. cityId, userId, subUserId}
     * @param callback
     * @returns saved post-property id
     */
    savePropertyBasicDetails = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            arg.request.currentStep = propertySteps.BASIC_DETAILS;
            const id = await PostPropertyRepo.savePropertyBasicDetails(
                arg.request
            );
            if (!id) throw new Error('CANT_FIND_PROPERTY');
            const { deedId, is_ambassador_app } = arg.request;
            if (deedId && is_ambassador_app) {
                const realEstate =
                    (await PostPropertyRepo.getRealEstateDeedDetailsById(
                        deedId
                    )) as Record<string, any>;
                if (realEstate) {
                    await PostPropertyRepo.propertyHolderVerification({
                        deedNumber: realEstate.Deedcode,
                        idType: realEstate.Idtype,
                        idNumber: realEstate.OwnerId,
                        isWathqVerified: true,
                        id,
                        userId: arg.request?.addedBy,
                    });
                }
            }
            this.responseData = { id };
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: savePropertyBasicDetails → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    //getting property files (property photos and external video link)
    getPropertyPhotosAndVideo = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const propertyRepoResult =
                await PostPropertyRepo.getPropertyPhotosAndVideo(arg.request);
            this.responseData.data = propertyRepoResult.data;
            this.responseData.status = propertyRepoResult.status;
            this.responseData.message = propertyRepoResult.message;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyPhotosAndVideo → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description get the post-property basic details
     * @param arg {id, userId}
     * @param callback
     * @returns post-property data
     */
    getPropertyBasicDetails = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const postPropertyData =
                await PostPropertyRepo.getPropertyBasicDetails(arg.request);
            if (!postPropertyData) throw new Error('CANT_FIND_PROPERTY');

            this.responseData = postPropertyData;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getPropertyBasicDetails → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    getAmenities = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const propertyRepoResult =
                await PostPropertyRepo.getPropertyAmenities(arg.request);
            this.responseData.data = propertyRepoResult.data;
            this.responseData.status = propertyRepoResult.status;
            this.responseData.message = propertyRepoResult.message;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService :: getAmenities → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description use to save PropertyVerificationInfo of specific property
     * @param postData {id, userId, idType, idNumber, regaAuthNumber, isWathqVerified}
     * @returns id of post-proeprty
     */
    propertyHolderVerification = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            arg.request.currentStep = propertySteps.PROPERTY_VERIFICATION;
            const response = await PostPropertyRepo.propertyHolderVerification(
                arg.request
            );

            if (!response?.id) throw new Error('CANT_FIND_PROPERTY');

            this.responseData = response;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::propertyHolderVerification → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description use to save PropertyVerificationInfo of specific property
     * @param postData {id, userId}
     * @returns PropertyVerificationInfo
     */
    getPropertyHolderVerification = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const verifiedInfo: any =
                await PostPropertyRepo.getPropertyHolderVerification(
                    arg.request
                );
            if (!verifiedInfo) throw new Error('CANT_FIND_PROPERTY');
            this.responseData = verifiedInfo.get({ plain: true });
            this.responseData.idType = verifiedInfo?.identity;
            this.responseData.id = verifiedInfo?.PostProperty.id;
            this.responseData.idNumber = verifiedInfo?.identityNumber;
            this.responseData.isVerified = verifiedInfo?.wathqVerified || false;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::assignPropertyToUser → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description use to save PropertyVerificationInfo of specific property
     * @param postData {id, userId}
     * @returns PropertyVerificationInfo
     */
    getPropertyHolderVerificationV3 = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const verifiedInfo: any =
                await PostPropertyRepo.getPropertyHolderVerification(
                    arg.request
                );
            let userData: any = await PostPropertyRepo.getParentUser(
                arg.request.userId
            );
            let deedInfo = await PostPropertyRepo.getRealEstateDeedById(
                verifiedInfo?.PostProperty?.realestateDeedId
            );
            let { idType, idNumber } =
                await identityClient.userPostInfoDetailsbyUserId({
                    userId: userData?.parent_id || userData?.id,
                });
            this.responseData = verifiedInfo
                ? verifiedInfo?.get({ plain: true })
                : {};
            this.responseData.idType = idType ? idType : verifiedInfo?.identity; // if user is owner/developer showing prefilled idType
            this.responseData.isVerified = verifiedInfo?.wathqVerified || false;
            this.responseData.id =
                verifiedInfo?.PostProperty?.id || arg.request?.id;
            this.responseData.idNumber = idType
                ? idNumber
                : verifiedInfo?.identityNumber; // if user is owner/developer showing prefilled idNumber
            this.responseData.OwnerId = verifiedInfo?.dataValues.identityNumber;
            this.responseData = { ...this.responseData, ...deedInfo };
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getPropertyHolderVerification → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    //add property amenties in DB
    addAmenities = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const propertyRepoResult =
                await PostPropertyRepo.addPropertyAmenities(arg.request);

            this.responseData.data = propertyRepoResult.data;
            this.responseData.status = propertyRepoResult.status;
            this.responseData.message = propertyRepoResult.message;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService :: addAmenities → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    //get assignee details
    getAssigneeDetails = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const propertyRepoResult =
                await PostPropertyRepo.getAssigneeDetails(arg.request);

            this.responseData.data = propertyRepoResult.data;
            this.responseData.status = propertyRepoResult.status;
            this.responseData.message = propertyRepoResult.message;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getAssigneeDetails → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description use to save property location of specific property in post properties table
     * @param postData {id, userId, lat, long, districtId, address}
     * @returns id of post-proeprty
     */
    savePropertyLocation = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            arg.request.currentStep = propertySteps.PROPERTY_LOCATION;
            const id = await PostPropertyRepo.savePropertyLocation(arg.request);
            if (!id) throw new Error('CANT_FIND_PROPERTY');

            this.responseData = { id };
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: savePropertyLocation → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description use to get property location of specific property from post properties table
     * @param postData {id, userId, lat, long, districtId, address}
     * @returns id of post-proeprty
     */
    getPropertyLocation = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const result = await PostPropertyRepo.getPropertyLocation(
                arg.request
            );
            if (!result.id) throw new Error('CANT_FIND_PROPERTY');

            this.responseData = result;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }

            logger.error(`PropertyService::getPropertyLocation → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    /**
     * @description find property by sub user and set sub user field null
     * @param node request
     * @param callback
     * @returns responseData
     */
    removeSubUserFromProperties = async (node: any, callback: any) => {
        this.setUserPropertyResponseData();
        try {
            const { subUserId } = node.request;
            const propertyIds =
                await PostPropertyRepo.removeSubUserFromProperties(subUserId);
            this.responseData.data = { propertyIds };
        } catch (err: any) {
            logger.error(
                `PropertyService :: removeSubUserFromProperties → ${err.message}`
            );
        }
        callback(null, this.responseData);
    };

    //edit assignee details
    editAssigneeDetails = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const propertyRepoResult =
                await PostPropertyRepo.editAssigneeDetails(arg.request);

            this.responseData.status = propertyRepoResult.status;
            this.responseData.message = propertyRepoResult.message;
            this.responseData.createdUserId = propertyRepoResult.data;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: editAssigneeDetails → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * Get property validation field for step validation
     * @param arg
     * @param callback
     */
    getPropertyStepData = async (arg: any, callback: any) => {
        let responseData: any = setResponseData();
        try {
            let currentStep: string = '';
            // render currentstep if version is greater or equal to 3;
            if (arg.request.version >= API_VERSIONS.V3) {
                // returns postPropertyId and currentStep
                const result = await this.getPropertyCurrentStep(
                    arg.request?.userId,
                    arg.request?.postPropertyId
                );
                currentStep = result.currentStep;
                arg.request.postPropertyId = result.postPropertyId;
            }
            let stepDataResponse = {
                stepResponse: [] as any[],
                id: '' as any,
                currentStep: '' as any,
            };
            // check postPropertyId present if not then return stepDataResponse
            if (arg.request.postPropertyId) {
                // get all property details by post-property Id
                const propertyRepoResult = (
                    await PostPropertyRepo.getPostPropertyDetailsById(
                        arg.request
                    )
                )?.dataValues;

                if (propertyRepoResult) {
                    const amenitiesCountCallBack = async () => {
                        return PostPropertyRepo.getAmenitiesCountByPropertyId(
                            propertyRepoResult?.id
                        );
                    };
                    // Get property step response.
                    let stepResponse =
                        await PropertyServiceHelper.GetStepDataResponse(
                            propertyRepoResult,
                            arg.request.locale,
                            amenitiesCountCallBack,
                            arg.request.version,
                            arg.request.roleId
                        );
                    const { createdAt, updatedAt } = propertyRepoResult;
                    /*
          Any property updated or created is before feature live date then current step always BASIC_DETAIL otherwise
          Current step will be same where user drop from. 
          */
                    const isNewProperty =
                        isDateNewerThanFeatureLiveDate(
                            createdAt,
                            PROPERTY_VERFICATION_LAST_STEP_FEATURE_LIVE_DATE
                        ) ||
                        isDateNewerThanFeatureLiveDate(
                            updatedAt,
                            PROPERTY_VERFICATION_LAST_STEP_FEATURE_LIVE_DATE
                        );
                    stepDataResponse.stepResponse = stepResponse;
                    // for existing property current step always be Basic details.
                    currentStep = isNewProperty
                        ? currentStep
                        : i18next.t('BASIC_DETAILS');
                    // do not render current step and id below v3
                    if (arg.request.version >= API_VERSIONS.V3) {
                        stepDataResponse.id = arg.request.postPropertyId;
                        stepDataResponse.currentStep = currentStep;
                    }
                }
            }
            setSuccessResponseInfo(
                responseData,
                i18next.t('success'),
                stepDataResponse,
                true
            );
        } catch (e: any) {
            responseData = handleErrorResponse(
                responseData,
                'PropertyService::getPropertyStepData',
                e
            );
        }
        callback(null, responseData);
    };

    /**
     * GET PROPERTY BASIC DETAIL BY ID
     * @param arg
     * @param callback
     */
    getPropertyBasicDetailsById = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const postPropertyData: any =
                await PostPropertyRepo.getPropertyBasicDetailsById(arg.request);
            if (!postPropertyData) throw new Error('CANT_FIND_PROPERTY');
            this.responseData.data = {
                id: 1,
                createdDate: postPropertyData.createdAt.getTime(),
            };
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getPropertyBasicDetailsById → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * GET PROPERTY STATUS LOGS BY ID
     * @param arg
     * @param callback
     */
    getPropertyApprovedDate = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const propertyRepoResult =
                await PostPropertyRepo.getPropertyApprovedDate(arg.request);
            this.responseData.data = propertyRepoResult;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyApprovedDate → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    // function fetch company name and save or update
    fetchCommercialRegistrationDetailsAPI = async (data: any) => {
        try {
            var finalResult: any = '';
            //check cr register or not with is_verified status true
            let result: any = await PostPropertyRepo.getCommercialDetail(data);
            if (result) {
                finalResult = { status: SUCCESS_MSG, result };
            } else {
                // get company name
                let companyResponse = await this.getCompanyName(data);
                if (
                    companyResponse &&
                    companyResponse.status ==
                        UNAUTHORIZED_STATUS_CODE.toString()
                ) {
                    await this.tokenService.generateToken();
                    companyResponse = await this.getCompanyName(data);
                }
                if (
                    companyResponse &&
                    companyResponse.status == SUCCESS_MSG &&
                    companyResponse.data
                ) {
                    const companyresult: any =
                        await PostPropertyRepo.saveAndUpdateCompanyName(
                            companyResponse.data
                        );
                    finalResult = {
                        status: SUCCESS_MSG,
                        result: companyresult,
                    };
                }
            }
        } catch (err: any) {
            logger.error(
                `PropertyService:: fetchCommercialRegistrationDetailsAPI → ${err.message}`
            );
            throw err;
        }
        return finalResult;
    };

    getCompanyName = async (data: any) => {
        let res = {
            status: '',
            data: {},
            message: '',
        };
        try {
            // fetch token api
            let token = await this.tokenService.getAccessToken();
            if (!token) {
                await this.tokenService.generateToken();
                token = await this.tokenService.getAccessToken();
            }
            //get company name from third party api
            const response = await axios.post(
                POSTPROPERTY.CHECK_COMPANY_NAME,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            res.data = response.data;
            res.status = SUCCESS_MSG;
            res.message = 'success response';
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const serverError = error as AxiosError;
                if (
                    serverError &&
                    serverError.response?.status == UNAUTHORIZED_STATUS_CODE
                ) {
                    res.data = '';
                    res.status = UNAUTHORIZED_STATUS_CODE.toString();
                    res.message = error.message;
                } else {
                    res.data = '';
                    res.status = ERROR_MSG;
                    res.message = getErrMsg(error.response?.data);
                }
            } else {
                res.data = '';
                res.status = ERROR_MSG;
                res.message = error.message;
            }
        }
        return res;
    };

    /**
     * GET Company DETAIL BY Cr no
     * @param arg
     * @param callback
     */
    getCompanyNameDetails = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            // get user cr no from user_post_info_table
            const crNumberData: any =
                await PostPropertyRepo.getUserCrNoByUserId(arg.request);
            if (!crNumberData) throw new Error(CR_NO_NOT_FOUND);
            // get company name as per crnumber
            const companyResultData: any = await PostPropertyRepo.getCrNoStatus(
                { CommercialRegistrationNumber: crNumberData?.number }
            );
            this.responseData.data = {
                companyName: companyResultData?.company_name,
                isVerified: companyResultData?.is_verified,
            };
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getCompanyNameDetails → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * POST Company name DETAIL BY user id with cr no
     * @param arg
     * @param callback
     */
    saveCompanyNameDetail = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            var result: any = '';
            // get user cr no from user_post_info_table
            const crNumberData: any =
                await PostPropertyRepo.getUserCrNoByUserId(arg.request);
            if (!crNumberData) throw new Error(CR_NO_NOT_FOUND);
            //get cr no detail
            var companyResultData: any = await PostPropertyRepo.getCrNoStatus({
                CommercialRegistrationNumber: crNumberData?.number,
            });
            if (companyResultData) {
                if (!companyResultData?.is_verified) {
                    //  save company name as per cr number if isVerified status is false.
                    companyResultData.company_name = arg?.request?.companyName;
                    result = await PostPropertyRepo.updateCompanyDetail(
                        companyResultData
                    );
                    this.responseData.data = {
                        companyName: result?.company_name,
                        isVerified: result?.is_verified,
                    };
                } else {
                    this.responseData.data = {
                        companyName: companyResultData?.company_name,
                        isVerified: companyResultData?.is_verified,
                    };
                }
            } else {
                result = await PostPropertyRepo.saveCompanyDetail({
                    company_name: arg?.request?.companyName,
                    cr_number: crNumberData?.number,
                });
                this.responseData.data = {
                    companyName: result?.company_name,
                    isVerified: result?.is_verified,
                };
            }
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getPropertyBasicDetailsById → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @param data
     * @description create user as owner and set verified true if user is absher verified and ksa_citizen.
     */
    saveOwnerRole = async (data: any) => {
        const id = data.userId;
        const locale = data.locale || 'ar';
        const roleId = Number(data.roleId);
        const result = await identityClient.getVerifiedUserById({
            userId: id,
            locale,
        });
        let absher_id: any;
        let ksa_citizen: any;
        if (result.error) throw new Error(result?.error?.message);
        let is_verified: boolean = false;
        if (result.user) {
            const { user } = result;
            ksa_citizen = user.ksa_citizen;
            absher_id = user.absher_id;
            is_verified = ksa_citizen && Number(absher_id) > 0;
            delete result.user.auctionEnabled;
        } else {
            return null;
        }
        await identityClient.saveOwnerRole({
            userId: id,
            roleId: roleId,
            isVerified: is_verified,
        });
        return {
            listingRoleId: roleId,
            userId: id,
            isVerified: is_verified,
        };
    };

    /**
     * @param data
     * @description create user as broker/developer and set verified true if user is absher verified and ksa_citizen.
     */
    saveBrokerDeveloperRole = async (data: any) => {
        const locale = data.locale || 'ar';
        await identityClient.saveBrokerDeveloperRole({
            userId: data.userId,
            roleId: data.roleId,
        });
        //  getting userData to check if user is abhsher verified
        let userAbhserData = await identityClient.getListingUserDetails({
            id: data.userId,
            locale,
        });

        let userPostInfoRes = await identityClient.saveUserPostInfo({
            absher_id: userAbhserData.absher_id,
            userId: data.userId,
            roleId: data.roleId,
            identityNumber: data.identityNumber,
            number: data.number,
            capacity: data.capacity,
            fullName: data.fullName,
        });
        return userPostInfoRes;
    };

    /**
     * @description If valid rega details then saving details to the db
     * @param data {id, number, idNumber, adNumber}
     */
    userVerificationWithRega = async (data: any) => {
        let userPostInfoData: any = {};
        // making api call to rega to validate  user ad_number
        let response: any = await this.checkRegaAdNumber(data);
        if (
            response &&
            response?.status == SUCCESS_MSG &&
            response.data == true
        ) {
            // if success from rega api then updating data in db
            data.isVerified = true;
            userPostInfoData = await identityClient.updateVerifiedBroker({
                userId: data.userId,
                roleId: data.roleId,
                isVerified: true,
                identityNumber: data.identityNumber,
                number: data.number,
                capacity: data.capacity,
                adNumber: data.adNumber,
            });
            response.status = true;
        } else {
            response.status = false;
        }
        if (response.status == false) {
            let errMsg =
                data.locale == 'en'
                    ? response?.data?.errorMsg_EN
                    : response?.data?.errorMsg_AR;
            throw new Error(errMsg);
        }
        return userPostInfoData;
    };

    // rega api for verifying rega details
    checkRegaAdNumber = async (data: any) => {
        let reqData = {
            Type_Id: data.identityNumber,
            Id_Number: data.number,
            Ad_Number: data.adNumber,
        };
        let res = {
            status: '',
            data: {},
            message: '',
        };
        try {
            let token = await this.tokenService.getAccessToken();
            if (!token) {
                await this.tokenService.generateToken();
                token = await this.tokenService.getAccessToken();
            }
            // calling api with old token
            const response = await axios.post(
                POSTPROPERTY.CHECK_REGA_AD_NUMBER,
                reqData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            res.data = response.data;
            res.status = response.data.errorCode ? ERROR_MSG : SUCCESS_MSG;
            res.message = response.data.errorCode
                ? data.locale == 'en'
                    ? response.data.errorMsg_EN
                    : response.data.errorMsg_AR
                : SUCCESS_MSG;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const serverError = error as AxiosError;
                // checking if the error is anuthorized error
                if (
                    serverError &&
                    serverError.response?.status === UNAUTHORIZED_STATUS_CODE
                ) {
                    // generating new token if old one is expired
                    await this.tokenService.generateToken();
                    let token = await this.tokenService.getAccessToken();
                    // calling api with new token
                    const response = await axios.post(
                        POSTPROPERTY.CHECK_REGA_AD_NUMBER,
                        reqData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    res.data = response.data;
                    res.status = response.data.errorCode
                        ? ERROR_MSG
                        : SUCCESS_MSG;
                    res.message = response.data.errorCode
                        ? data.locale == 'en'
                            ? response.data.errorMsg_EN
                            : response.data.errorMsg_AR
                        : SUCCESS_MSG;
                }
            } else {
                res.data = '';
                res.status = ERROR_MSG;
                res.message = error.message || 'SOMETHING_WENT_WRONG';
            }
        }
        return res;
    };

    // rega api for verifying rega auth details
    checkRegaAuthNumber = async (data: any) => {
        let reqData = {
            Type_Id: data.idType,
            Id_Number: data.identityNumber,
            Ad_Number: data.adNumber,
            Auth_Number: data.regaAuthNumber,
        };
        let res = {
            status: '',
            data: {},
            message: '',
        };
        try {
            let token = await this.tokenService.getAccessToken();
            if (!token) {
                await this.tokenService.generateToken();
                token = await this.tokenService.getAccessToken();
            }
            // calling api with old token
            const response = await axios.post(
                POSTPROPERTY.CHECK_REGA_AUTH_NUMBER,
                reqData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            res.data = response.data;
            res.status = response.data.errorCode ? ERROR_MSG : SUCCESS_MSG;
            res.message = response.data.errorCode
                ? data.locale == 'en'
                    ? response.data.errorMsg_EN
                    : response.data.errorMsg_AR
                : SUCCESS_MSG;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const serverError = error as AxiosError;
                // checking if the error is anuthorized error
                if (
                    serverError &&
                    serverError.response?.status === UNAUTHORIZED_STATUS_CODE
                ) {
                    // generating new token if old one is expired
                    await this.tokenService.generateToken();
                    let token = await this.tokenService.getAccessToken();
                    // calling api with new token
                    const response = await axios.post(
                        POSTPROPERTY.CHECK_REGA_AUTH_NUMBER,
                        reqData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    res.data = response.data;
                    res.status = response.data.errorCode
                        ? ERROR_MSG
                        : SUCCESS_MSG;
                    res.message = response.data.errorCode
                        ? data.locale == 'en'
                            ? response.data.errorMsg_EN
                            : response.data.errorMsg_AR
                        : SUCCESS_MSG;
                }
            } else {
                res.data = '';
                res.status = ERROR_MSG;
                res.message = error.message || 'SOMETHING_WENT_WRONG';
            }
        }
        return res;
    };

    // api call for realstate deed (wathq)
    realEstateDeed = async (data: any) => {
        let res = {
            status: '',
            data: {},
            message: '',
        };
        try {
            if (data.Idtype == idTypeEnums.IQMA) {
                data.Idtype = idTypeEnums.IQAMA;
            }
            let token = await this.tokenService.getAccessToken();
            // getting token if token doesn't exist
            if (!token) {
                await this.tokenService.generateToken();
                token = await this.tokenService.getAccessToken();
            }
            // calling wathq api
            const response = await axios.post(
                POSTPROPERTY.GET_REALESTATE_DEED,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            res.data = response.data;
            res.status = SUCCESS_MSG;
            res.message = 'success response';
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const serverError = error as AxiosError;
                if (serverError && serverError.response?.status === 401) {
                    res.data = '';
                    res.status = '401';
                    res.message = error.message;
                } else {
                    res.data = '';
                    res.status = ERROR_MSG;
                    res.message = getErrMsg(error.response?.data);
                }
            } else {
                res.data = '';
                res.status = ERROR_MSG;
                res.message = error.message;
            }
        }
        return res;
    };

    // getting wathq data from db or api
    fetchRealEstateDeedAPI = async (data: any) => {
        let realEstate: any = await PostPropertyRepo.getRealEstateDeed(data);
        if (realEstate) {
            return { status: SUCCESS_MSG, data: formatWathqRes(realEstate) };
        } else {
            let deedResponse = await this.realEstateDeed(data);
            if (deedResponse && deedResponse.status == '401') {
                await this.tokenService.generateToken();
                deedResponse = await this.realEstateDeed(data);
            }
            if (
                deedResponse &&
                deedResponse.status == SUCCESS_MSG &&
                deedResponse.data
            ) {
                const savedata = formatWathqForDB(deedResponse, data);
                const doc2: any = await PostPropertyRepo.createRealEstateDeed(
                    savedata
                );
                return { status: SUCCESS_MSG, data: formatWathqRes(doc2) };
            }
            return deedResponse;
        }
    };

    // wathq deed verification service
    wathqDeedVerification = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            this.responseData = await this.fetchRealEstateDeedAPI(arg.request);
            this.responseData.data = JSON.stringify(this.responseData.data);
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyApprovedDate → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    // api call for rega advertise verification
    regaAdVerification = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            this.responseData = await this.checkRegaAdNumber(arg.request);
            if (this.responseData.status == false) {
                let errMsg =
                    arg.request.locale == 'en'
                        ? this.responseData?.data?.errorMsg_EN
                        : this.responseData?.data?.errorMsg_AR;
                throw new Error(errMsg);
            }
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyApprovedDate → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description If valid rega details then saving details to the db
     * @param arg {id, number, idNumber, adNumber}
     * @param callback {id}
     */
    listingUserVerification = async (arg: any, callback: any) => {
        try {
            this.setResponseData();
            let data = arg.request;
            const roleId = Number(data.roleId);
            switch (roleId) {
                case RoleIdEnums.OWNER: {
                    this.responseData = await this.saveOwnerRole(data);
                    break;
                }
                case RoleIdEnums.BROKER: {
                    // saving capacity and role
                    await this.saveBrokerDeveloperRole(data);
                    // updating capacity and role if rega verified
                    this.responseData = await this.userVerificationWithRega(
                        data
                    );
                    break;
                }
                case RoleIdEnums.DEVELOPER: {
                    // saving capacity and role
                    this.responseData = await this.saveBrokerDeveloperRole(
                        data
                    );
                    break;
                }
                default: {
                    throw new Error(
                        'Role id not supported for this operation.'
                    );
                }
            }
            let companyDetails: any;
            if (data?.identityNumber == COMPANY_IDENTITY_NUMBER) {
                companyDetails =
                    await this.fetchCommercialRegistrationDetailsAPI({
                        CommercialRegistrationNumber: data.number,
                    });
            }
            this.responseData.companyName =
                companyDetails?.result?.company_name;
            this.responseData.listingRoleId = roleId;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyApprovedDate → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };
    /**
     * GET PROPERTY STATUS LOGS BY ID
     * @param arg
     * @param callback
     */
    wathqCrDetails = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            let { result } = await this.fetchCommercialRegistrationDetailsAPI({
                CommercialRegistrationNumber: arg.request.crNumber,
            });
            this.responseData = {
                companyName: result?.company_name,
                isVerified: result?.is_verified,
            };
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyApprovedDate → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * GET listing user verification details
     * @param arg
     * @param callback
     */
    getListingUserVerification = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            let { userId, locale } = arg.request;
            let userData = await identityClient.getListingUserDetails({
                id: userId,
                locale,
            });
            let userPostInfoData =
                await PostPropertyRepo.getUserPostInfoByUserId(userId);
            let result: any = {};
            if (
                userPostInfoData?.number &&
                userPostInfoData?.identityNumber == COMPANY_IDENTITY_NUMBER
            )
                result = (
                    await this.fetchCommercialRegistrationDetailsAPI({
                        CommercialRegistrationNumber: userPostInfoData.number,
                    })
                ).result;
            let listingRoleId = userData.roleId;
            this.responseData = {
                ...userData,
                ...userPostInfoData,
                listingRoleId,
                companyName: result?.company_name,
            };
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyApprovedDate → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * Post property REGA authorization
     * @param arg
     * @param callback
     */
    postPropertyAuthorizationUpload = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const propertyUpload = await PostPropertyRepo.addPropertyAuthFiles(
                arg.request
            );
            const postedProperty =
                await PostPropertyRepo.getPostPropertyByPostPropertyId(
                    arg.request.id
                );
            // use for draft property
            let authDraft = arg.request?.authDraft || false;

            if (postedProperty?.propertyVerificationInfoId) {
                // update authdraft status in propertyVerificatioInfo table
                await PostPropertyRepo.updatePropertyVerificationInfo(
                    postedProperty?.propertyVerificationInfoId,
                    { authDraft }
                );
            } else {
                let verifiedInfoData = {
                    id: arg.request.id,
                    userId: arg.request.userId,
                    authDraft,
                };
                await PostPropertyRepo.propertyHolderVerification(
                    verifiedInfoData
                );
            }

            // if autodraft is false i.e user is click on continue button.
            if (!authDraft) {
                // update current-step
                postedProperty.update({
                    currentStep: propertySteps.PROPERTY_AUTHORIZATION,
                });
            }
            // update property status as INCOMPLETE
            await Property.update(
                { statusTypeId: PropertyErrorCodes.INCOMPLETE },
                { where: { id: arg.request.propertyId } }
            );
            this.responseData.status = propertyUpload.status;
            this.responseData.message = propertyUpload.message;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
        }
        callback(null, this.responseData);
    };

    // call rega auth api and save the details iff rega details are valid
    saveRegaAuthDetails = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            let { regaAuthNumber, locale, id, authType, authDraft } =
                arg.request;
            // use for draft property
            authDraft = authDraft || false;
            let verifiedInfo: any;
            // getting property and property verification info
            let propertyData: any =
                await PostPropertyRepo.getPropertyVerificationInfo(id);
            // if PropertyVerificationInfoId not present in properties table
            if (!propertyData?.dataValues?.PropertyVerificationInfoId) {
                let verifiedInfoData = {
                    id,
                    regaAuthNumber: regaAuthNumber || null,
                    authDraft: authDraft || false,
                    userId: arg.request.userId,
                };
                verifiedInfo =
                    await PostPropertyRepo.propertyHolderVerification(
                        verifiedInfoData
                    );
            }
            // for getting ad number
            let userPostInfo = await PostPropertyRepo.getUserPostInfoByUserId(
                propertyData.userId
            );
            let adNumber = userPostInfo?.adNumber;
            let { id: PropertyVerificationInfoId } =
                propertyData.PropertyVerificationInfo || verifiedInfo;
            let regaResponse = await this.checkRegaAuthNumber({
                idType: userPostInfo.identityNumber,
                identityNumber: userPostInfo.number,
                adNumber,
                regaAuthNumber,
                locale,
            });
            let resError =
                regaResponse.status == 'error' || regaAuthNumber == '';
            const isVerified = resError ? false : true;
            await PostPropertyRepo.updatePropertyVerificationInfo(
                PropertyVerificationInfoId,
                { regaAuthNumber, isVerified, authDraft }
            );
            await PostPropertyRepo.propertyUpdateAuthType({
                propertyId: propertyData?.Property?.id,
                authType: authType,
            });
            // if autodraft is false i.e user is click on continue button.
            if (!authDraft) {
                // update current-step
                await propertyData.update({
                    currentStep: propertySteps.PROPERTY_AUTHORIZATION,
                });
            }
            // update property status as INCOMPLETE
            await propertyData?.Property?.update({
                statusTypeId: PropertyErrorCodes.INCOMPLETE,
            });
            this.responseData = { regaAuthNumber, isVerified };
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: saveRegaAuthDetails → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * Post property REGA authorization
     * @param arg
     * @param callback
     */
    postPropertyAuthorizationTypeUpdate = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            await PostPropertyRepo.propertyUpdateAuthType(arg.request);
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: postPropertyAuthorizationTypeUpdate → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * Post property REGA authorization
     * @param arg
     * @param callback
     */
    getPostPropertyAuthorization = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const response: any =
                await PostPropertyRepo.getPostPropertyAuthorization(
                    arg.request
                );
            this.responseData = {
                RegaFiles: response?.Property?.PropertyFiles,
                ...response?.PropertyVerificationInfo,
                authType: response?.Property?.authType,
                listingTypeId: response.listingTypeId,
            };
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: postPropertyAuthorizationTypeUpdate → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * Get property Id for REGA authorisation
     * @param arg
     * @param callback
     */
    getPropertyId = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const response: any =
                await PostPropertyRepo.getPropertyIdByPostPropertyId(
                    arg.request.id
                );
            this.responseData = {
                propertyId: response?.id,
            };
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyIdError → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    getPropertyFilesByPropertyIds = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const response: any = await PostPropertyRepo.getpropertyFiles(
                arg.request
            );
            this.responseData.data = response;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyFilesByPropertyIds → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    // fetch property detail for v3 version
    getLongJourneyPropertyByIdV3 = async (arg: any, callback: any) => {
        try {
            this.setResponseData();
            let postedProperty = await PostPropertyRepo.getPropertyInfobyIdV3(
                arg.request
            );
            if (!postedProperty) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_NOT_FOUND}`
                );
            }
            this.responseData.data = postedProperty;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getLongJourneyPropertyByIdV3 → ${e.message}`
            );
        }
        callback(null, this.responseData.data);
    };

    generateImageUrlname = async (data: any) => {
        // check image cdn link or direct name
        let count = 0;
        let imagearra: any = [];
        for (let i = 0; i < data?.PropertyFiles.length; i++) {
            // check image cdn link or direct name
            let resultImageUrl = await this.isValidImageUrl(
                data.PropertyFiles[i].name
            );
            if (resultImageUrl) {
                let imageResult = await setImageFilesForProperty(
                    data.PropertyFiles[i].name,
                    data?.userId
                );
                data.PropertyFiles[i].name = imageResult;
                imagearra.push({ name: data.PropertyFiles[i].name });
                count = count + 1;
            } else {
                count = count + 1;
                imagearra.push({ name: data.PropertyFiles[i].name });
            }
        }
        if (count >= data?.PropertyFiles.length) {
            return {
                PropertyFiles: imagearra,
                id: data?.id,
                videoURL: data?.videoURL,
                userId: data?.userId,
                //to enter mapping in property_file_user table
                roleId: data?.roleId,
                addedBy: data?.addedBy,
            };
        }
    };
    // check image valid url or not
    isValidImageUrl = (imgurl: any) => /^[a-z][a-z0-9+.-]*:/.test(imgurl);

    // Post Property Feature for v3 version
    postFeaturePropertyV3 = async (arg: any, callback: any) => {
        try {
            this.setResponseData();
            let postedProperty: any = await PostPropertyRepo.getPostedProperty(
                arg.request
            );
            if (postedProperty) {
                let id = arg.request.id;
                let locale = arg.request.locale;
                arg.request.currentStep = propertySteps.PROPERTY_FEATURES;
                let propertyDetails: any =
                    await PostPropertyRepo.getPropertyByPostedId({
                        id,
                        locale,
                    });

                arg.request.listingTypeId =
                    propertyDetails?.dataValues?.listing_type_id;
                arg.request.propertyTypeId =
                    propertyDetails?.dataValues?.propertyTypeId;
                arg.request.builtUpArea =
                    propertyDetails?.dataValues?.PropertyAttribute?.builtUpArea;
                arg.request.landArea =
                    propertyDetails?.dataValues?.PropertyAttribute?.carpetArea;
                arg.request.noOfStreet =
                    propertyDetails?.dataValues?.StreetInfos?.length;
                arg.request.unitTypeId =
                    propertyDetails?.dataValues?.PropertyAttribute?.unitTypeId;
                arg.request.residenceTypeId =
                    propertyDetails?.dataValues?.PropertyAttribute?.residenceTypeId;
                arg.request.mainTypeId =
                    propertyDetails?.dataValues?.mainTypeId;
                arg.request.StreetInfo = {};
                if (arg.request.noOfStreet) {
                    propertyDetails?.dataValues?.StreetInfos.forEach(
                        (item: any) => {
                            let data: any = {};
                            (data[`streetwidth${item.position}`] =
                                item.streetWidth),
                                (data[`streetfacing${item.position}`] =
                                    item.facingTypeId);
                            arg.request.StreetInfo = {
                                ...data,
                                ...arg.request.StreetInfo,
                            };
                        }
                    );
                }
                if (propertyDetails) {
                    let propertyId = propertyDetails.id;

                    propertyDetails.update({
                        statusTypeId: PropertyErrorCodes.INCOMPLETE,
                    });
                    if (
                        propertyDetails?.statusTypeId ==
                            PropertyErrorCodes.APPROVED ||
                        propertyDetails?.statusTypeId ==
                            PropertyErrorCodes.REJECTED
                    ) {
                        await propertyDetails.update({
                            statusTypeId: PropertyErrorCodes.BRE_APPROVAL,
                        });
                        rabbitMQService.publishToDeleteProperty({
                            environment: process.env.NODE_ENV,
                            propertyId: propertyId,
                        });
                    }
                    if (propertyDetails) {
                        let propertyId = propertyDetails.id;

                        propertyDetails.update({
                            statusTypeId: PropertyErrorCodes.INCOMPLETE,
                        });
                        if (
                            propertyDetails?.statusTypeId ==
                                PropertyErrorCodes.APPROVED ||
                            propertyDetails?.statusTypeId ==
                                PropertyErrorCodes.REJECTED
                        ) {
                            await propertyDetails.update({
                                statusTypeId: PropertyErrorCodes.BRE_APPROVAL,
                            });
                            rabbitMQService.publishToDeleteProperty({
                                environment: process.env.NODE_ENV,
                                propertyId: propertyId,
                            });
                        }
                        let doc =
                            await PostPropertyRepo.updateFeatureLongJourneyPropertyV3(
                                arg.request,
                                propertyId
                            );
                        let refNumber = propertyDetails.darReference;
                        if (refNumber) {
                            const darArr = refNumber.split(/[\s-]+/);
                            refNumber = darArr[darArr.length - 1];
                        }
                        // update current-step
                        if (arg.request.currentStep) {
                            await postedProperty.update({
                                currentStep: arg.request.currentStep,
                            });
                        }
                        this.responseData.property = arg?.request?.id;
                        this.responseData.message =
                            'PROPERTY_UPDATED_SUCESSFULLY';

                        if (!refNumber) {
                        }
                        this.genAndSavePropertyDescription(propertyId);
                    } else {
                        throw new Error(
                            `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                        );
                    }
                }
            } else {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (e: any) {
            logger.error(`PropertyService::postFeatureProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    getActivePropertyCountByPropertyIds = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const response: any = await PostPropertyRepo.getpropertyCount(
                arg.request
            );
            this.responseData.count = response;
        } catch (e: any) {
            this.responseData.status = false;
            let { error } = setErrorMessageForGrpc(e);
            this.responseData.error = error;
            logger.error(`PropertyService::postFeatureProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    //Step 4 [GET API] for v3 version
    getFeaturePropertyByIdV3 = async (arg: any, callback: any) => {
        try {
            this.setResponseData();
            let postedProperty =
                await PostPropertyRepo.getFeaturePropertyInfobyIdV3(
                    arg.request
                );
            if (!postedProperty) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_NOT_FOUND}`
                );
            }
            this.responseData.data = postedProperty;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getFeaturePropertyByIdV3 → ${e.message}`
            );
        }
        callback(null, this.responseData.data);
    };

    //add property amenties in DB for v3 version
    addAmenitiesV3 = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            arg.request.currentStep = propertySteps.AMENITIES;
            const propertyRepoResult =
                await PostPropertyRepo.addPropertyAmenitiesV3(arg.request);
            this.genAndSavePropertyDescription(
                propertyRepoResult?.data?.propertyId
            );
            this.responseData.data = propertyRepoResult.data;
            this.responseData.status = propertyRepoResult.status;
            this.responseData.message = propertyRepoResult.message;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService :: addAmenitiesV3 → ${e.message}`);
        }
        callback(null, this.responseData);
    };
    // get aminities for v3
    getAmenitiesV3 = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const propertyRepoResult =
                await PostPropertyRepo.getPropertyAmenitiesV3(arg.request);
            this.responseData.data = propertyRepoResult.data;
            this.responseData.status = propertyRepoResult.status;
            this.responseData.message = propertyRepoResult.message;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService :: getAmenitiesV3 → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    // get user properties by userId
    getUserPropertiesByUserIdV3 = async (userRequest: any, callback: any) => {
        this.setUserPropertyResponseData();
        try {
            const data = userRequest.request;
            const user: any = await userService.checkUser(data.userId);
            // status list for user properties and count.
            data.statusTypeIds = PropertyServiceHelper.GetPropertyStatusTypeIds(
                parseInt(data.subStatusTypeId),
                data.version
            );

            // listing type for user properties.
            data.listingTypeIds =
                PropertyServiceHelper.GetPropertyListingTypeIds(
                    parseInt(data.subStatusTypeId)
                );
            // user properties and count.
            const allStatus = PropertyServiceHelper.GetGroupStatusAll(
                data.version
            );
            const [propertyStatusCount, propertyData] = await Promise.all([
                PostPropertyRepo.getUserPostPropertyStatusCountV3(
                    allStatus,
                    data,
                    user
                ),
                PostPropertyRepo.getUserPropertiesByUserIdV3(data, user),
            ]);
            // validate result and throw error.
            if (!propertyStatusCount) {
                throw new Error(
                    `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            if (!propertyData) {
                throw new Error(
                    `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }

            PropertyServiceHelper.moveSoldRentedPropertiesAtLast(
                propertyData,
                data.version
            );

            // response transformation
            const headerCounts =
                PropertyServiceHelper.GetUserPropertiesCountResponse(
                    i18next,
                    propertyStatusCount,
                    data
                );

            const status =
                headerCounts.find(
                    (item: any) => item.statusTypeId == data.subStatusTypeId
                ) || headerCounts[0];
            const selectedStatusCount = status?.count;

            const propertiesId = propertyData
                .filter((item: any) => item.propId != null)
                .map((p: any) => {
                    return p.propId;
                });

            // fetch user properties files and status
            const [propertiesFiles, statusLogs] = await Promise.all([
                propertyFileRepo.GetPropertyFilesByPropertyIds(propertiesId),
                propertyStatusLogRepo.GetLatestStatusLogsIdsByPropertyIds(
                    propertiesId
                ),
            ]);

            const userPropertiesResponse = propertyData.map((property: any) => {
                let propertyStatusLog = null;
                if (property.propId) {
                    property.PropertyFiles = propertiesFiles.filter(
                        (item: any) => item.property_id == property.propId
                    );
                    propertyStatusLog = statusLogs.find(
                        (item: any) => item.property_id == property.propId
                    );
                }
                let propertyToJson = property;
                propertyToJson.title =
                    propertyToJson.title || propertyToJson.property_name;
                propertyToJson.address =
                    propertyToJson.fullAddress || propertyToJson.address;
                return PropertyServiceHelper.setUserPropertiesResponse(
                    i18next,
                    propertyToJson,
                    data.locale,
                    propertyStatusLog
                );
            });
            let responseData: {
                data: any | null;
                count: any | null;
                headers: any | null;
            } = {
                data: userPropertiesResponse,
                count: selectedStatusCount,
                headers: headerCounts,
            };
            this.responseData = responseData;
        } catch (e: any) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService::getUserPropertiesByUserIdV3 → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    // add title and description for a property
    addPropertyTranslation = async (args: any, callback?: any) => {
        this.setPostedPropertyResponseData();
        try {
            const postData = args.request;
            const { id, enTranslation = {}, arTranslation = {} } = postData;
            const response: any =
                await PostPropertyRepo.upInsertPropertyTranslationMap(
                    id,
                    { ...enTranslation, locale: 'en' },
                    { ...arTranslation, locale: 'ar' }
                );
            this.responseData.data = response;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getPropertyFilesByPropertyIds → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * Get street details of a property by property id
     * @param arg
     * @param callback
     */
    getPropertyStreetInfoByPropertyId = async (args: any, callback: any) => {
        const reqBody = args.request;
        this.setResponseData();
        try {
            const streetInfo = await PropertyRepo.getStreetInfoByPropertyId(
                reqBody
            ); // get all street details for the given property.
            this.responseData.data = streetInfo.map(
                (street: Record<string, any>) => street.dataValues
            );
        } catch (e: any) {
            this.responseData = setErrorMessageForGrpc(e);
        }
        callback(null, this.responseData);
    };

    /**
     * Get list of amenities of a property by property id
     * @param arg
     * @param callback
     */
    getPropertyAmenitiesById = async (args: any, callback: any) => {
        const reqBody = args.request;
        this.setResponseData();
        try {
            const amenitites = await PropertyRepo.getPropertyAmenitiesById(
                reqBody
            ); // get all amenities for the given property.
            this.responseData.data = amenitites.map(
                (amenity: Record<string, any>) => amenity.dataValues
            );
        } catch (e: any) {
            this.responseData = setErrorMessageForGrpc(e);
        }
        callback(null, this.responseData);
    };

    // post-property detail validations
    postPropertyDetailsValidations = async (data: any) => {
        const errorData = [];
        this.setResponseData();
        i18next.changeLanguage(data.locale);
        //validations
        if (!data.id) {
            errorData.push({ error: i18next.t('PP_ID_REQUIRED') });
        }
        if (!data.mainTypeId) {
            errorData.push({ error: i18next.t('MAIN_TYPE_ID_REQUIRED') });
        }
        if (!data.propertyTypeId) {
            errorData.push({ error: i18next.t('PROPERTY_TYPE_ID_REQUIRED') });
        }

        if (!data.salePrice && !data.rentalPrice) {
            errorData.push({ error: i18next.t('PRICE_REQUIRED') });
        }
        postProprtyValidationDataV3?.forEach((value, index) => {
            if (value?.sub_property_type_id == data.propertyTypeId) {
                let objectData: any = data;
                for (const key in objectData) {
                    let attributeRes = value?.sub_property_type.find(
                        (ele) => ele.type == key
                    );
                    if (attributeRes) {
                        if (!data[key]) {
                            errorData.push({
                                error: i18next.t(attributeRes.error),
                            });
                        }
                        if (key == POSSION_TYPE_ID)
                            if (data[key] == PROPERTY_STATUS) {
                                // condition apply for possin type id
                                if (!data[BUILD_YEAR]) {
                                    errorData.push({
                                        error: i18next.t('BUILD_YEAR_REQUIRED'),
                                    });
                                }
                            }
                    }
                }
            }
        });
        const keys: any = Object.keys(data);
        postProprtyValidationDataV3?.forEach((value, index) => {
            if (value?.sub_property_type_id == data.propertyTypeId) {
                value?.sub_property_type.forEach((val, indx) => {
                    let keysResult = keys.find((el: any) => val.type == el);
                    if (!keysResult) {
                        errorData.push({ error: i18next.t(val.error) });
                    }
                });
            }
        });
        return errorData;
    };

    /**
     * Get property current step and id.
     * @param userId user id
     * @param postPropertyId property id
     * @returns
     */
    getPropertyCurrentStep = async (userId: number, postPropertyId: number) => {
        let propertyRepoResult: any = '';
        const isPostProperty = !!postPropertyId;
        propertyRepoResult = isPostProperty
            ? await PostPropertyRepo.getPostPropertyCurrentStepById(
                  postPropertyId
              )
            : await PostPropertyRepo.getPropertyDetailsByUserId(userId);
        return propertyRepoResult;
    };
    //set
    setResidencyTypeId = async (data: any) => {
        let resiTyepId = null;
        if (data.request.residenceTypeId) {
            let residencyTypeIdresult: any = await redisCache.getValue(
                TYPE_MASTERS_REDIS_KEY
            ); // filter residency type id
            if (!residencyTypeIdresult) {
                residencyTypeIdresult = (
                    await utilityGrpcService.getTypeMasterDataByType({
                        types: [RESIDENECY_TYPE],
                    })
                ).data;
            } else {
                residencyTypeIdresult = JSON.parse(residencyTypeIdresult);
            }
            resiTyepId = residencyTypeIdresult?.find(
                (value: any) => value.slug === ResidencyTypeSlug.SINGLE
            );
            return resiTyepId?.id;
        } else {
            return resiTyepId;
        }
    };

    // function to generate and save the property description in english and arabic
    genAndSavePropertyDescription = async (propertyId: string) => {
        try {
            if (!propertyId) {
                return null;
            }

            let pData: any = await PostPropertyRepo.getPropertyDataForDesc(
                propertyId
            );
            let isResidential =
                pData.mainTypeId == PropertyType.RESIDENTIAL_TYPE_ID;
            let enDesc: string = null;
            let arDesc: string = null;
            if (isResidential) {
                // creating variables for pug
                let enVar = await generateDescriptionVariables(
                    propertyId,
                    Locale.ENGLISH,
                    pData
                );
                let arVar = await generateDescriptionVariables(
                    propertyId,
                    Locale.ARABIC,
                    pData
                );
                // generating description
                [enDesc, arDesc] = await Promise.all([
                    descriptionTemplate(enVar, Locale.ENGLISH),
                    descriptionTemplate(arVar, Locale.ARABIC),
                ]);
                // saving the description
                let [_enRes, _arRes] =
                    await PostPropertyRepo.savePropertyTranslation({
                        propertyId,
                        en: { description: enDesc },
                        ar: { description: arDesc },
                    });
            }
            return { enDesc, arDesc };
        } catch (err) {
            logger.error(
                `genAndSavePropertyDescription : propertyDescription --> ${err}`
            );
        }
    };

    // mark property status as occupied (sold/Rented)
    markPropertyOccupied = async (arg: any, callback: any) => {
        this.responseData = {};
        try {
            let { id, userId, locale } = arg.request;
            i18next.changeLanguage(locale);
            let property = await PostPropertyRepo.getActivePropertyByUserId(
                id,
                userId
            );
            if (property) {
                await property.update({
                    statusTypeId: PropertyErrorCodes.OCCUPIED,
                });
                PropertyStatusLog.create({
                    property_id: property.id,
                    status_type_id: PropertyErrorCodes.OCCUPIED,
                });
                rabbitMQService.markPropertyOccupied({
                    environment: process.env.NODE_ENV,
                    metaData: [
                        {
                            id: property.id,
                            insert: true,
                        },
                    ],
                });
                this.responseData.status = true;
                this.responseData.message = i18next.t(
                    'PROPERTY_UPDATED_SUCESSFULLY'
                );
            } else {
                this.responseData.status = false;
                this.responseData.message = i18next.t('CANT_FIND_PROPERTY');
            }
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.message = exception[0];
            }
            logger.error(
                `PropertyService :: markPropertyOccupied → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    // get proeprty description by id
    getPropertyDescription = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            const response: any =
                await PostPropertyRepo.getPostPropertyDetailsById({
                    postPropertyId: arg.request.id,
                    locale: arg.request.locale || 'ar',
                });
            this.responseData.description =
                response?.Property?.PropertyTranslations[0]?.description;
        } catch (e: any) {
            this.responseData.status = false;
            let { error } = setErrorMessageForGrpc(e);
            this.responseData.error = error;
            logger.error(`PropertyService::postFeatureProperty → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    // Returns Property title in english or arabic language.
    getTitle = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            let locale = arg.request.locale || Locale.ARABIC;
            let propertyId: any =
                await PostPropertyRepo.getPropertyIdByPostPropertyId(
                    arg.request.id
                );
            let title: any = await PostPropertyRepo.getTitle(
                propertyId.id,
                locale
            );
            this.responseData.status = true;
            this.responseData.data = title?.dataValues.title;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`PropertyService :: getTitle → ${e.message}`);
        }
        callback(null, this.responseData);
    };

    //property feature validations for v3 version
    postFeaturePropertyValidations = async (
        data: any,
        propertyDetails: any
    ) => {
        const errorData = [];
        this.setResponseData();
        //validations
        if (!data.id) {
            errorData.push({ error: i18next.t('PP_ID_REQUIRED') });
        }
        i18next.changeLanguage(data.locale);
        attributeDataV3?.forEach((value) => {
            if (
                value?.sub_property_type_id ==
                propertyDetails?.dataValues?.propertyTypeId
            ) {
                let objectData: any = data;
                for (const key in objectData) {
                    let attributeRes = value?.sub_property_type.find(
                        (ele) => ele.type == key
                    );
                    if (attributeRes) {
                        if (!data[key]) {
                            errorData.push({
                                error: i18next.t(attributeRes.error),
                            });
                        }
                        if (key == POSSION_TYPE_ID) {
                            // condition apply for possin type id
                            if (data[key] == PROPERTY_STATUS) {
                                if (!data[BUILD_YEAR]) {
                                    errorData.push({
                                        error: i18next.t('BUILD_YEAR_REQUIRED'),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        });
        const keys: any = Object.keys(data);
        attributeDataV3?.forEach((value) => {
            if (
                value?.sub_property_type_id ==
                propertyDetails?.dataValues?.propertyTypeId
            ) {
                value?.sub_property_type.forEach((val) => {
                    let keysResult = keys.find((el: any) => val.type == el);
                    if (!keysResult) {
                        errorData.push({ error: i18next.t(val.error) });
                    }
                });
            }
        });
        return errorData;
    };

    // Returns users properties count
    getUserPropertiesCount = async (arg: any, callback: any) => {
        this.setPostedPropertyResponseData();
        try {
            let userId = arg.request.subUserId;
            // get properties count by userId
            let propertiesCount: any =
                await PostPropertyRepo.getUserPropertiesCount(userId);
            this.responseData.data = propertiesCount;
        } catch (e: any) {
            this.responseData.status = false;
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(
                `PropertyService :: getSubuserPropertiesCount → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    // Get the seller properties count based on status (approved,incomplete,in-review.)
    listingUserPropertyBifurcation = async (
        userRequest: any,
        callback: any
    ) => {
        this.setUserPropertyResponseData();
        try {
            const propertyStatusCount =
                await PostPropertyRepo.listingUserPropertyBifurcation(
                    userRequest.request
                );
            if (!propertyStatusCount) {
                throw new Error(
                    `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }

            this.responseData.headers = propertyStatusCount;
        } catch (e: any) {
            this.responseData = setErrorMessageForGrpc(e);
            logger.error(
                `PropertyService::listingUserPropertyBifurcation → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };
}

// getting error msg for wathq api
function getErrMsg(data: any): string {
    let message = data?.message?.trim() || 'SOMETHING_WENT_WRONG';
    let sanitizedMsg = message?.charAt(0)?.toUpperCase() + message?.slice(1);
    return sanitizedMsg;
}

// formatting the db data to send in response
export const formatWathqRes = (data: any) => {
    return {
        id: data.dataValues.id,
        Deedcode: data.dataValues.Deedcode,
        OwnerId: data.dataValues.OwnerId,
        Idtype: data.dataValues.Idtype,
        serialNumber: data.dataValues.serialNumber,
        issueDate: data.dataValues.issueDate,
        courtId: data.dataValues.courtId,
        courtName: data.dataValues.courtName,
        cityId: data.dataValues.cityId,
        cityName: data.dataValues.cityName,
        status: data.dataValues.status,
        area: data.dataValues.area,
        areaText: data.dataValues.areaText,
        note: data.dataValues.note,
        isCondtrained: data.dataValues.isCondtrained,
        isHalt: data.dataValues.isHalt,
        isPawned: data.dataValues.isPawned,
        isTestament: data.dataValues.isTestament,
        share: data.dataValues.share,
        ...JSON.parse(data.dataValues.responseData),
    };
};

// formating wathq response for saving in db
export const formatWathqForDB = (response: any, data?: any) => {
    let responseData = {
        owner: response.data.response.owner,
        border: response.data.response.border,
        realEstate: response.data.response.realEstate,
    };
    return {
        Deedcode: response.data.response.code,
        OwnerId: response.data.response.owner[0].identity.id,
        Idtype: response.data.response.owner[0].identity.type,
        serialNumber: response.data.response.serialNumber,
        issueDate: response.data.response.issueDate,
        courtId: response.data.response.court.id,
        courtName: response.data.response.court.name,
        cityId: response.data.response.city.id,
        cityName: response.data.response.city.name,
        status: response.data.response.status,
        area: response.data.response.area,
        areaText: response.data.response.areaText,
        note: response.data.response.note,
        isCondtrained: response.data.response.isCondtrained,
        isHalt: response.data.response.isHalt,
        isPawned: response.data.response.isPawned,
        isTestament: response.data.response.isTestament,
        share: response.data.response.share,
        responseData: JSON.stringify(responseData),
        ...data,
    };
};
