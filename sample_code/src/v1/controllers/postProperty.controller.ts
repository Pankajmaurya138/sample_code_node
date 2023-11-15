import e, { Request, RequestHandler, Response } from 'express';
import Validator from 'validatorjs';
import i18next from 'i18next';
import PropertyRepo from '../repositories/property.repository';
import { Property } from '../../models/property.model';
import { AgentRoleIdEnums, PropertyErrorCodes } from '../../util/enums';
import logger from '../../util/logger';
import { RabbitContent } from '../../util/rabbitmqEventBus';
import PostPropertyRepo from '../repositories/postProperty.repository';
import { propertyTransformer } from '../../util/transformers';

export class PostPropertyController {
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
        this.responseData.status = true;
        this.responseData.data = data;
        this.responseData.message = i18next.t(message);
    };

    /**
     * Get API - Posted Properties By Id
     * @param req query parameter id
     * @param res response object
     */
    getPostedPropertyById = async (req: Request, res: Response) => {
        const userData = res.locals.auth;
        console.log('userData', userData);
        console.log('params', req.query);
        this.setResponseData();
        try {
            let propertyById = await PostPropertyRepo.getPostedProperty(
                req.query
            );

            this.setSuccessResponse('', propertyById);
        } catch (e: any) {
            this.responseData.message = e.message;
        }
        res.json(this.responseData);
    };

    /**
     * Post API - To save Posted Properties Data
     * @param req req.body
     * @param res response created Id
     */
    savePostProperty = async (req: Request, res: Response) => {
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

    /**
     * Post API - To Get Posted Property Data
     * @param req req.body
     * @param res response Post Property
     */
    getLongJourneyPropertyById = async (req: Request, res: Response) => {
        let propertyId = req.params.propertyId;
        const locale = req.headers.locale || 'ar';
        this.setResponseData();
        try {
            let propertyById = await PostPropertyRepo.getPropertyInfobyId({
                propertyId,
                locale,
            });
            this.setSuccessResponse('', propertyById);
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::getPropertyById : ${err.message}`
            );
            this.responseData.message = err.message;
        }
        res.json(this.responseData);
    };

    getFeaturePropertyById = async (req: Request, res: Response) => {
        let propertyId = req.params.propertyId;
        const locale = req.headers.locale || 'ar';
        this.setResponseData();
        try {
            let propertyById =
                await PostPropertyRepo.getFeaturePropertyInfobyId({
                    propertyId,
                    locale,
                });
            this.setSuccessResponse('', propertyById);
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::getPropertyById : ${err.message}`
            );
            this.responseData.message = err.message;
        }
        res.json(this.responseData);
    };

    postFeatureProperty = async (req: Request, res: Response) => {
        let id = req.body.id;
        // let userId = req.body.userId;
        const locale = req.headers.locale || 'ar';
        req.body.locale = req.headers.locale || 'ar';
        this.setResponseData();
        try {
            let postedProperty = await PostPropertyRepo.getPostedProperty(
                req.body
            );
            if (postedProperty) {
                console.log('Post property', postedProperty);
                let propertyDetails: any =
                    await PostPropertyRepo.getPropertyFeatureByPostPropertyId({
                        id,
                        locale,
                    });

                if (propertyDetails) {
                    let propertyId = propertyDetails.dataValues.id;
                    await PostPropertyRepo.updateFeatureLongJourneyProperty(
                        req.body,
                        propertyId
                    );
                    this.responseData.property = propertyId;
                    this.setSuccessResponse('PROPERTY_UPDATED_SUCESSFULLY', {});
                } else {
                    this.setSuccessResponse('This PROPERTY NOT FOUND');
                }
            } else {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::postFeatureProperty : ${err.message}`
            );
            this.responseData.message = err.message;
        }
        res.json(this.responseData);
    };

    addLongJourneyProperty = async (req: Request, res: Response) => {
        let id = req.body.id;
        const locale = req.headers.locale || 'ar';
        req.body.locale = req.headers.locale || 'ar';
        this.setResponseData();
        try {
            let postedProperty = await PostPropertyRepo.getPostedProperty(
                req.body
            );
            if (postedProperty) {
                let propertyDetails: any =
                    await PostPropertyRepo.getPropertyFeatureByPostPropertyId({
                        id,
                        locale,
                    });
                if (propertyDetails) {
                    let propertyId = propertyDetails.id;
                    await PostPropertyRepo.updateLongJourneyProperty(
                        req.body,
                        propertyDetails
                    );
                    this.setSuccessResponse('PROPERTY_UPDATED_SUCESSFULLY', {});
                } else {
                    await PostPropertyRepo.saveLongJourneyProperty(req.body);
                    this.setSuccessResponse('PROPERTY_ADDED_SUCESSFULLY', {});
                }
            } else {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::addLongJourneyProperty : ${err.message}`
            );
            this.responseData.message = err.message;
        }
        res.json(this.responseData);
    };

    getUserPropertyStatusCount = async (req: Request, res: Response) => {
        this.setResponseData();
        try {
            let userId = req.params.userId;
            let response = await PropertyRepo.getUserPropertyStatusCount({
                userId,
            });
            this.responseData.data = response;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::getUserPropertyStatusCount : ${err.message}`
            );
            this.responseData.message = err.message;
        }
        res.json(this.responseData);
    };

    getAllPostPropertiesByUserId = async (req: Request, res: Response) => {
        this.setResponseData();
        try {
            let userId = req.body.userId;
            let subStatusTypeId = req.body.subStatusTypeId;
            let limit = req.body.limit;
            let offset = req.body.offset ? req.body.offset : 0;
            let locale = req.headers.locale || 'ar';
            let propertyId: any =
                await PostPropertyRepo.getPostedPropertyDetailsByUserId({
                    userId,
                });
            let response = await PostPropertyRepo.getUserPropertiesByUserId({
                userId,
                subStatusTypeId,
                limit,
                offset,
                locale,
                propertyId,
            });
            // let response = await PostPropertyRepo.getUserPostPropertyStatusCount({userId});
            this.responseData.data = response;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::getAllPostPropertiesByUserId : ${err.message}`
            );
            this.responseData.message = err.message;
        }
        res.json(this.responseData);
    };

    changePostPropertyStatus = async (req: Request, res: Response) => {
        this.setResponseData();
        try {
            let userId = req.body.userId;
            let propertyId = req.body.propertyId;
            let action = req.body.action;
            let response = await PostPropertyRepo.updatePostPropertyStatus({
                userId,
                action,
                propertyId,
            });
            this.responseData.status = true;
            this.responseData.data = response.data;
            this.responseData.message = response.message;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::changePostPropertyStatus : ${err.message}`
            );
            this.responseData.message = err.message;
        }
        res.json(this.responseData);
    };

    createTitle = async (req: Request, res: Response) => {
        try {
            console.log('createTitle :', req.params);
            let data = await PostPropertyRepo.createTitlePostProperty(
                { propertyId: req.params.propertyId, locale: 'en' },
                null
            );
            res.json(data);
        } catch (error: any) {
            console.log('Error in create Title :', error);
        }
    };
    //testing the API locally
    assignPropertyUser = async (req: Request, res: Response) => {
        this.setResponseData();
        try {
            let userId = req.body.userId;
            req.body.locale = req.headers.locale || 'ar';
            let response = await PostPropertyRepo.assignPropertyToUser(
                req.body
            );
            // let response = await PostPropertyRepo.getUserPostPropertyStatusCount({userId});
            this.responseData.data = response;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::getAllPostPropertiesByUserId : ${err.message}`
            );
            this.responseData.message = err.message;
        }
        res.json(this.responseData);
    };

    /**
     * Post API - To save Posted Properties photos and video
     * @param req req.body
     * @param res response added property photos and external video url
     */
    addPropertyPhotosAndVideo: RequestHandler = async (req, res) => {
        this.setResponseData();
        try {
            const result = await PostPropertyRepo.addPropertyPhotosAndVideo(
                req.body
            );
            this.responseData.data = result;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller :: addPropertyPhotosAndVideo : ${err.message}`
            );
            this.responseData.message = err.message;
        }

        res.json(this.responseData);
    };

    getPropertyFilesByPropertyIds: RequestHandler = async (req, res) => {
        this.setResponseData();
        try {
            console.log(req.body);

            let propertyImages: any = await PostPropertyRepo.getpropertyFiles(
                req.body
            );
            propertyImages = await propertyImages.map((item: any) => {
                item.entityId = `${item.property_id}`;
                return {
                    ...item,
                    selected: false,
                };
            });
            this.responseData.status = true;
            this.responseData.data = propertyImages;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller :: addPropertyPhotosAndVideo : ${err.message}`
            );
            this.responseData.message = err.message;
        }

        res.json(this.responseData);
    };
}
