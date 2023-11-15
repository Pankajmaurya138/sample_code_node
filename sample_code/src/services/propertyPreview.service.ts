import logger from '../util/logger';
import { AgentRoleIdEnums, PropertyErrorCodes } from '../util/enums';
import PostPropertyRepo from '../v1/repositories/postProperty.repository';
import { PropertyIconClass } from '../util/static';
import identityClient from './identityService';
import { PropertyTypesTranslation } from '../models/propertyTypeTranslations.model';
import { StreetInfo } from '../models/streetInfo.model';
import {
    CACHE_DURATION_1_HOUR,
    TYPE_MASTERS_REDIS_KEY,
} from '../util/redisConstant';
import utilityClient from './utilityService';
import { redisCache } from '../util/RedisCache';

export class PropertyPreviewService {
    private responseData: any;

    setPostedPropertyResponseData() {
        this.responseData = {
            error: null,
            data: null,
        };
    }

    /**
     * @description : gets property preview page information for wasalt pro app
     */
    getPropertyPreviewData = async (args: any, callback?: any) => {
        this.setPostedPropertyResponseData();
        try {
            const postData = args.request;
            const { id, locale } = postData;
            //fetches post property data by id
            const response: any =
                await PostPropertyRepo.getPostPropertyPreviewDetailsById({
                    propertyId: id,
                    locale,
                });
            const previewData = await this.preparePropertyPreviewData(
                response,
                locale
            );
            this.responseData.data = previewData;
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
                `PropertyPreviewService :: getPropertyPreviewData → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description : prepare preview details payload
     */
    preparePropertyPreviewData = async (data: any, locale: string) => {
        let typeResults = await this.fetchTypeMasterData(locale);
        let sellerInfo = await this.getSellerDataById(
            data.dataValues?.userId,
            locale
        );
        let verificationInfo = this.previewVerificationInfo(data);
        let basicDetails = await this.previewBasicDetails(
            data,
            locale,
            typeResults
        );
        let propertyDetails = await this.previewPropertyDetails(
            data,
            locale,
            typeResults
        );
        let propertyFeatures = await this.previewPropertyFeatures(
            data,
            locale,
            typeResults
        );
        let amenitiesData = this.previewAmenitiesData(data);
        let images = this.previewImagesData(data);
        let previewIcons = this.previewIcons();

        //prepare complete preview data object
        let previewResponse: Record<string, any> = {
            ...sellerInfo,
            ...verificationInfo,
            ...basicDetails,
            ...propertyDetails,
            ...propertyFeatures,
            ...previewIcons,
            ...amenitiesData,
            images,
            possessionTypeId: data.Property.PropertyAttribute?.possessionTypeId,
            videoUrl: data.Property.dataValues.external_video_link,
        };
        return previewResponse;
    };

    /**
     * @description : prepare payload for property verification
     */
    previewVerificationInfo = (data: any) => {
        return {
            nationalId:
                data?.Property?.PropertyVerificationInfo?.dataValues
                    .identityNumber || null,
            titleDeedNo:
                data?.Property?.PropertyVerificationInfo?.dataValues
                    .deedNumber || null,
        };
    };

    /**
     * @description : fetches basic information of property seller by id
     */
    getSellerDataById = async (userId: any, locale: string) => {
        const sellerInfo = await identityClient.getProfileById({
            userId,
            locale,
        });
        return {
            sellerName: sellerInfo?.user?.userInfo?.fullName,
            sellerEmail: sellerInfo?.user?.contactDetail?.email,
            sellerMobile: sellerInfo?.user?.contactDetail?.phoneNumber,
            sellerCountryCode:
                sellerInfo?.user?.contactDetail?.phoneNumberCountryCode,
            sellerType:
                sellerInfo?.user?.userInfo?.[
                    `${locale == 'en' ? 'roleNameEn' : 'roleNameAr'}`
                ],
        };
    };

    /**
     * @description : return Amenities screen payload (amenties, title, description)
     */
    previewAmenitiesData = (data: any) => {
        const amenities = data.Property.Amenities.map((item: any) => {
            return {
                name: item.dataValues?.amenityName,
                icon: item.icon,
                iconClass: item.iconClass || '',
                id: item.id,
            };
        });
        return {
            amenities,
            title: data.Property.PropertyTranslations?.[0]?.dataValues.title,
            description:
                data.Property.PropertyTranslations?.[0]?.dataValues.description,
        };
    };

    /**
     * @description : return Images and video screen payload
     */
    previewImagesData = (data: any) => {
        return data.Property.PropertyFiles.map((file: any) => {
            return {
                id: file.id,
                name: file.name,
                type: file.type,
                property_id: file.property_id,
            };
        });
    };

    /**
     * @description : return icons payload for preview screen
     */
    previewIcons = () => {
        return {
            waterMeterIcon: PropertyIconClass.waterMeter,
            electricityMeterIcon: PropertyIconClass.electricityMeter,
            verificationDocIcon: PropertyIconClass.verificationDoc,
            titleIcon: PropertyIconClass.title,
            locationIcon: PropertyIconClass.location,
            furnishingIcon: PropertyIconClass.furnishing,
            profileIcon: PropertyIconClass.profile,
            phoneNumberIcon: PropertyIconClass.phoneNumber,
            emailIcon: PropertyIconClass.email,
            priceIcon: PropertyIconClass.price,
            bedroomIcon: PropertyIconClass.bedroom,
            bathroomIcon: PropertyIconClass.bathroom,
        };
    };

    /**
     * @description : return Basic Details screen data payload
     */
    previewBasicDetails = async (
        data: any,
        locale: string,
        typeResults: any
    ) => {
        return {
            listingType: typeResults?.find(
                (item: any) =>
                    item.id == data.Property.listingTypeId &&
                    item.type == 'property_listing_type' &&
                    item.locale == locale
            )?.name,
            cityName: data.Property.PropertyLocation?.dataValues?.cityName,
            zonaName: data.Property.PropertyLocation?.dataValues?.zoneName,
            address: data.dataValues.address,
        };
    };

    /**
     * @description : Fetches type master data from cache or from Utility Service
     */
    fetchTypeMasterData = async (locale: string) => {
        //types that needs to be fetched from type masters
        const types = [
            'property_facing_type',
            'residence_type',
            'property_furnishing_type',
            'property_listing_type',
            'property_possession_type',
        ];
        //fetch type master data from cache
        let typeMasterResult = await redisCache.getValue(
            TYPE_MASTERS_REDIS_KEY
        );
        if (typeMasterResult) {
            typeMasterResult = JSON.parse(typeMasterResult);
            return typeMasterResult.filter(
                (item: any) =>
                    types.find((findItem: any) => item.type == findItem) != null
            );
        } else {
            //if not in cache, fetch type master data from utility service
            return (
                await utilityClient.getTypeMasterDataByType({ types, locale })
            ).data;
        }
    };

    /**
     * @description : return Property Details screen data payload
     */
    previewPropertyDetails = async (
        data: any,
        locale: string,
        typeResults: any
    ) => {
        const streetInfo: any = [];
        //fetches all streets linked to property
        const streetArr = await StreetInfo.findAll({
            attributes: ['street_width', 'facingTypeId'],
            where: { propertyId: data.Property.dataValues.id },
        });

        //get each street facingType and its icons for preview page
        streetArr.forEach((item: any) => {
            streetInfo.push({
                streetWidth: item.dataValues.street_width,
                facingTypeId: item.dataValues.facingTypeId,
                facingTypeIcon:
                    typeResults?.find(
                        (type: any) =>
                            type.id == item.dataValues.facingTypeId &&
                            type.type == 'property_facing_type' &&
                            type.locale == locale
                    )?.iconClass || '',
                facingType: typeResults?.find(
                    (type: any) =>
                        type.id == item.dataValues.facingTypeId &&
                        type.type == 'property_facing_type' &&
                        type.locale == locale
                )?.name,
            });
        });

        return {
            propertyType: (
                await PropertyTypesTranslation.findOne({
                    where: {
                        property_type_id:
                            data.Property.dataValues.propertyTypeId,
                        locale,
                    },
                })
            )?.name,
            mainType: (
                await PropertyTypesTranslation.findOne({
                    where: {
                        property_type_id: data.Property.dataValues.mainTypeId,
                        locale,
                    },
                })
            )?.name,
            propertyTypeIcon: 'apartment',
            salePrice:
                data.dataValues.listingTypeId == 3
                    ? data.Property.PropertyAttribute?.salePrice
                    : '',
            rentalPrice:
                data.dataValues.listingTypeId == 4
                    ? data.Property.PropertyAttribute?.expectedRent
                    : '',
            possessionType: typeResults?.find(
                (item: any) =>
                    item.id ==
                        data.Property.PropertyAttribute?.possessionTypeId &&
                    item.type == 'property_possession_type' &&
                    item.locale == locale
            )?.name,
            possessionTypeIcon: typeResults?.find(
                (item: any) =>
                    item.id ==
                        data.Property.PropertyAttribute?.possessionTypeId &&
                    item.type == 'property_possession_type' &&
                    item.locale == locale
            )?.iconClass,
            propertyPossesionStatusIcon: typeResults?.find(
                (item: any) =>
                    item.id ==
                        data.Property.PropertyAttribute?.possessionTypeId &&
                    item.type == 'property_possession_type' &&
                    item.locale == locale
            )?.iconClass,
            waterMeter: data.Property.PropertyAttribute.waterMeter || false,
            electricity:
                data.Property.PropertyAttribute.electricityMeter || false,
            noOfStreet: data.Property.PropertyAttribute.noOfStreet,
            builtUpArea: data.Property.PropertyAttribute.builtUpArea,
            carpetArea: data.Property.PropertyAttribute.carpetArea,
            streetInfo,
        };
    };

    /**
     * @description : return Property Features screen data payload
     */
    previewPropertyFeatures = async (
        data: any,
        locale: string,
        typeResults: any
    ) => {
        return {
            noOfBedrooms: data.Property.PropertyAttribute.noOfBedrooms,
            noOfBathroom: data.Property.PropertyAttribute.noOfBathrooms,
            noOfLivingrooms: data.Property.PropertyAttribute?.noOfLivingrooms,
            noOfGuestrooms: data.Property.PropertyAttribute?.noOfGuestrooms,
            noOfApartments: data.Property.PropertyAttribute.noOfBathrooms,
            noOfOffice: data.Property.PropertyAttribute.noOfOffice,
            noOfParkings: data.Property.PropertyAttribute.noOfParkings,
            noOfPalmTrees: data.Property.PropertyAttribute.noOfPalmTrees,
            noOfWaterWells: data.Property.PropertyAttribute.noOfWaterWells,
            totalFloors: data.Property.PropertyAttribute.noOfFloors,
            landLength: data.Property.PropertyAttribute.landLength,
            landDepth: data.Property.PropertyAttribute.landDepth,
            PropertyFloor: data.Property.PropertyAttribute.floorNumber,
            ApartmentTotalFloor: data.Property.PropertyAttribute.noOfFloors,
            furnishingType: typeResults?.find(
                (item: any) =>
                    item.id ==
                        data.Property.PropertyAttribute?.furnishingTypeId &&
                    item.type == 'property_furnishing_type' &&
                    item.locale == locale
            )?.name,
            residenceType: typeResults?.find(
                (item: any) =>
                    item.id ==
                        data.Property.PropertyAttribute?.residenceTypeId &&
                    item.type == 'residence_type' &&
                    item.locale == locale
            )?.name,
            furnishingTypeIcon: PropertyIconClass.furnishing,
        };
    };
}
