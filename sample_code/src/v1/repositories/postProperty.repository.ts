import { Op, col, literal, Sequelize, QueryTypes, fn } from 'sequelize';
import { PostProperty } from '../../models/postProperty.model';
import { Property } from '../../models/property.model';
import { PropertyAttribute } from '../../models/propertyAttribute.model';
import { PropertyFile } from '../../models/propertyFile.model';
import { PropertyLocation } from '../../models/propertyLocation.model';
import { PropertyTranslation } from '../../models/propertyTranslation.model';
import { PropertyTypeOption } from '../../models/propertyTypeOptions.model';
import { PropertyView } from '../../models/propertyView.model';
import { TypeMaster } from '../../models/typeMaster.model';
import { TypeMasterTranslation } from '../../models/typeMasterTranslation.model';
import {
    ENUMS,
    FilterRequestSingleCodeByGroup,
    GroupStatusCodes,
    Locale,
    PropertyErrorCodes,
    PropertyListingType,
    PropertyType,
} from '../../util/enums';
import { AgentRoleIdEnums, PostPropertyStatus } from '../../util/enums';
import { sequelize } from '../../models/sequelize';
import logger from '../../util/logger';
import PropertyRepo from './property.repository';
import { PropertyTypesTranslation } from '../../models/propertyTypeTranslations.model';
import { getVerifiedUserDetails } from '../../models/userVerifiedInfo.model';
import slugify from 'slugify';
import i18next from 'i18next';
import {
    UNAUTHORIZED_STATUS_CODE,
    propertyFileTypes,
    RESIDENTIAL_BUILDING,
    userStatusTypes,
    COMPANY_IDENTITY_NUMBER,
    PROPERTY_DISABLED_MINUTES,
    CITY_ID,
    PROPERTY_TYPES,
    propertySteps,
} from '../../util/constant';
import {
    addPropertyMediaRes,
    addPropertyAmenitiesRes,
    getPropertyMediaRes,
    amenitiesMappedArray,
    getAssigneeDetailsRes,
    addPropertyDataRes,
} from '../../util/interfaces';
const { v4: uuidv4 } = require('uuid');
import { User } from '../../models/user.model';
import {
    SELF_MANAGED,
    CURRENCY_TYPE_ID,
    MAINTENANCE_CYCLE_TYPE_YEARLY,
    PROPERTY_AREA_UNIT,
    userRoles,
} from '../../util/constant';
import { Amenity } from '../../models/amenity.model';
import { AmenityTranslation } from '../../models/amenityTranslations.model';
import { AmenityProperty } from '../../models/amenityProperty.model';
import { mainPropertyMapping } from '../../util/constant';
import { PropertyVerificationInfo } from '../../models/propertyVerificationInfo.model';
import { UserInfo } from '../../models/userInfo.model';
import rabbitMQService from '../../util/rabbitmqcon';
import { PropertyStatusLog } from '../../models/propertyStatusLog.model';
import { propertyStatusTypeIds } from '../../util/static';
import { CommercialRegistrationDetails } from '../../models/commercialRegistrationDetails.model';
import { UserPostInfo } from '../../models/UserPostInfo.model';
import { Realestate_deed } from '../../models/realestate_deed.model';
import { StreetInfo } from '../../models/streetInfo.model';
import { ListingAgentUsers } from '../../models/listingAgentUsers.model';
import { SellerProperties } from '../../models/sellerProperties.model';
import { City } from '../../models/city.model';
import { CityTranslation } from '../../models/cityTranslations.model';
import { Zone } from '../../models/zone.model';
import { ZoneTranslation } from '../../models/zoneTranslations.model';
import { generateTitle } from '../../services/propertyContent.service';
import { redisCache } from '../../util/RedisCache';
import { TYPE_MASTERS_REDIS_KEY } from '../../util/redisConstant';
import { utilityGrpcService } from '../../util/UtilityGrpcService';
import { setImageFiles, setImageFilesForProperty } from '../../util/xmlUtils';
import { userService } from '../../services/user.service';
import { PropertyTypes } from '../../models/propertyTypes.model';
import { PropertyFileUser } from '../../models/propertyFileUser.model';

export class PostPropertyRepository {
    private enAttr: any = [
        'id',
        ['en_title', 'title'],
        ['en_address', 'address'],
        'slug',
        ['en_property_status_type', 'propertyStatusType'],
        ['en_property_source_type', 'sourceType'],
        ['en_property_main_type', 'propertyMainType'],
        ['en_property_type', 'propertyType'],
        // ["en_property_type_option", "propertyMainTypeOption"],
        'publishedAt',
        'createdAt',
        ['no_of_bedrooms', 'noOfBedrooms'],
        ['no_of_bathrooms', 'noOfBathrooms'],
        ['en_unit_type', 'unitType'],
        ['built_up_area', 'builtUpArea'],
        ['carpet_area', 'carpetArea'],
        ['en_currency_type', 'currencyType'],
        ['sale_price', 'salePrice'],
        ['expected_rent', 'expectedRent'],
        ['yearly_charges', 'yearlyCharges'],
        ['user_id', 'userId'],
        ['owner_full_name', 'fullName'],
        ['phone_number_country_code', 'phoneNumberCountryCode'],
        ['owner_phone_number', 'phoneNumber'],
        ['external_360_link', 'external360Link'],
        ['external_video_link', 'externalVideoUrl'],
        [<any>literal(`published_at + INTERVAL '30d'`), 'expiryDate'],
        ['en_user_role', 'role'],
        ['en_property_region_type', 'propertyRegionType'],
        'sourceTypeId',
        'isRecommended',
        'isSold',
        'isHotDeal',
        'isExclusive',
        'isFeatured',
        'isInspected',
        'isWhatsappLater',
        'propertyRegionId',
        'mainTypeId',
        'listingTypeId',
        'statusTypeId',
        'darReference',
        'updatedAt',
        'postPropertyId',
        'completionYear',
        'managedById',
        'postedAs',
        ['en_slug', 'enSlug'],
        ['ar_slug', 'arSlug'],
        'subuserId',
        'subuserFullName',
        ['en_unit_type', 'unitType'],
        'propertyTypeId',
        ['wathq_verified', 'wathqVerified'],
        ['success_date', 'successDate'],
        'cityId',
        ['en_property_name', 'property_name'],
    ];
    private arAttr: any = [
        'id',
        ['ar_title', 'title'],
        ['ar_address', 'address'],
        'slug',
        ['ar_property_status_type', 'propertyStatusType'],
        ['ar_property_source_type', 'source'],
        ['ar_property_main_type', 'propertyMainType'],
        ['ar_property_type', 'propertyType'],
        // ["ar_property_type_option", "propertyMainTypeOption"],
        'publishedAt',
        'createdAt',
        ['no_of_bedrooms', 'noOfBedrooms'],
        ['no_of_bathrooms', 'noOfBathrooms'],
        ['ar_unit_type', 'unitType'],
        ['built_up_area', 'builtUpArea'],
        ['carpet_area', 'carpetArea'],
        ['ar_currency_type', 'currencyType'],
        ['sale_price', 'salePrice'],
        ['expected_rent', 'expectedRent'],
        ['yearly_charges', 'yearlyCharges'],
        ['user_id', 'userId'],
        ['owner_full_name', 'fullName'],
        ['external_360_link', 'external360Link'],
        ['external_video_link', 'externalVideoUrl'],
        [<any>literal(`published_at + INTERVAL '30d'`), 'expiryDate'],
        ['ar_user_role', 'role'],
        ['ar_property_region_type', 'propertyRegionType'],
        'sourceTypeId',
        'isRecommended',
        'isSold',
        'isHotDeal',
        'isExclusive',
        'isFeatured',
        'isInspected',
        'isWhatsappLater',
        'propertyRegionId',
        'mainTypeId',
        'listingTypeId',
        'statusTypeId',
        'darReference',
        'updatedAt',
        'postPropertyId',
        'completionYear',
        'managedById',
        'postedAs',
        ['en_slug', 'enSlug'],
        ['ar_slug', 'arSlug'],
        'subuserId',
        'subuserFullName',
        ['ar_unit_type', 'unitType'],
        'propertyTypeId',
        ['wathq_verified', 'wathqVerified'],
        ['success_date', 'successDate'],
        'cityId',
        ['ar_property_name', 'property_name'],
    ];

    setPropertyInfoResponse(property: any): any {
        return {
            regionId: property.PropertyLocation?.stateId,
            cityId: property.PropertyLocation?.cityId,
            mainTypeId: property?.dataValues?.mainTypeId,
            listingTypeId: property?.dataValues?.listingTypeId, // added new key in response as per new figma design
            districtId: property.PropertyLocation?.zoneId,
            landArea: {
                unit: property.PropertyAttribute?.unitTypeId,
                carpetArea: property.PropertyAttribute?.carpetArea,
                builtUpArea: property.PropertyAttribute?.builtUpArea,
            },
            facingId: property.PropertyAttribute?.facingTypeId,
            facingTypeId: property.PropertyAttribute?.facingTypeId,
            possessionTypeId: property.PropertyAttribute?.possessionTypeId,
            street: {
                noOfStreets: property.PropertyAttribute?.noOfStreet,
                street1Width: property.PropertyAttribute?.street1Width,
                street2Width: property.PropertyAttribute?.street2Width,
                street3Width: property.PropertyAttribute?.street3Width,
                street4Width: property.PropertyAttribute?.street4Width,
            },
            salePrice:
                property.listingTypeId == 3
                    ? property.PropertyAttribute?.salePrice
                    : '',
            rentalPrice:
                property.listingTypeId == 4
                    ? property.PropertyAttribute?.expectedRent
                    : '',
            currencyTypeId: property.PropertyAttribute?.currencyTypeId,
            purposeId: property.listingTypeId,
            propertyType: property.mainTypeId,
            residential: property.propertyTypeId,
            propertyTypeId: property.propertyTypeId,
            propertyStatus: property.PropertyAttribute?.possessionTypeId,
            buildYear: property.PropertyAttribute?.completionYear,
            propertyFiles: property.PropertyFiles,
            location: {
                latitude: property.PropertyLocation?.latitude,
                longitude: property.PropertyLocation?.longitude,
                address: property.PropertyTranslations[0]?.dataValues.address,
            },
        };
    }
    setPropertyFeatureInfoResponse(property: any, locale: any): any {
        let propertyTraslation = property.PropertyTranslations.find(
            (o: any) => o.locale === locale
        );
        return {
            furnishingTypeId: property.PropertyAttribute.furnishingTypeId,
            propertyArea: {
                builtUpArea: property.PropertyAttribute.builtUpArea,
                carpetArea: property.PropertyAttribute.carpetArea,
                unitTypeId: property.PropertyAttribute.unitTypeId,
            },
            Bedroom: property.PropertyAttribute.noOfBedrooms,
            Bathroom: property.PropertyAttribute.noOfBathrooms,
            LivingRoom: property.PropertyAttribute.noOfLivingrooms,
            GuestRoom: property.PropertyAttribute.noOfGuestrooms,
            TotalCarParking: property.PropertyAttribute.noOfParkings,
            PropertyFloor: property.PropertyAttribute.floorNumber,
            ApartmentTotalFloor: property.PropertyAttribute.noOfFloors,
            description: propertyTraslation.dataValues.description,
            mainTypeId: property.dataValues.mainTypeId,
            propertyTypeId: property.dataValues.propertyTypeId,
        };
    }
    setPropertyFeatureAttributeInfoResponse(property: any): any {
        return {
            furnishingTypeId: property.PropertyAttribute.furnishingTypeId,
            propertyArea: {
                builtUpArea: property.PropertyAttribute.builtUpArea,
                carpetArea: property.PropertyAttribute.carpetArea,
            },
            Bedroom: property.PropertyAttribute.noOfBedrooms,
            Bathroom: property.PropertyAttribute.noOfBathrooms,
            LivingRoom: property.PropertyAttribute.noOfLivingrooms,
            GuestRoom: property.PropertyAttribute.noOfGuestrooms,
            TotalCarParking: property.PropertyAttribute.noOfParkings,
            PropertyFloor: property.PropertyAttribute.floorNumber,
            ApartmentTotalFloor: property.PropertyAttribute.noOfFloors,
        };
    }
    setPropertyFeatureTranslationInfoResponse(property: any): any {
        return {
            description:
                property.PropertyTranslations[0].dataValues.description,
        };
    }
    setSavedLongPropertyResponse(postData: any): any {
        return {
            propertyRegionId: 56, // 56 is for KSA
            statusTypeId:
                postData.statusTypeId || PropertyErrorCodes.INCOMPLETE, // missing
            listingTypeId: postData.listingTypeId,
            managedById: postData.managedById || SELF_MANAGED, // added for self managed property
            mainTypeId: postData.mainTypeId,
            propertyTypeId: postData.propertyTypeId,
            //   userId: postData.userId,
            addedBy: postData.addedBy,
            darReference: uuidv4(),
            unitReference: `${postData.userId}-${uuidv4()}`,
            isSold: false,
            isAlreadyLeased: false,
            isHotDeal: false,
            isExclusive: false,
            isFeatured: false,
            isInspected: false,
            slug: uuidv4(),
            isActive: true,
            postPropertyId: postData.id,
            isRecommended: false,
            isAuction: false,
            sourceTypeId: 580,
            realestateDeedId: postData?.realestateDeedId,
            propertyVerificationInfoId: postData?.propertyVerificationInfoId,
        };
    }

    setUpdateLongPropertyResponse(postData: any): any {
        return {
            statusTypeId: PropertyErrorCodes.INCOMPLETE, //incomplete status,
            listingTypeId: postData.listingTypeId,
            mainTypeId: postData.mainTypeId,
            propertyTypeId: postData.propertyTypeId,
            propertyVerificationInfoId: postData?.propertyVerificationInfoId,
        };
    }

    setLongPropertyLocationResponse(postData: any, propertyId: any): any {
        return {
            propertyId: propertyId,
            cityId: postData.cityId,
            zoneId: postData.districtId,
            stateId: postData.regionId,
            latitude: postData.latitude,
            longitude: postData.longitude,
            countryId: postData.countryId || 1,
            address: postData.address,
        };
    }

    setSavedLongPropertyAttribute(postData: any, propertyId: any): any {
        // this will set property features to null, which are getiing saved/updated in next step
        let resetAttributes = postData.propertyTypeChanged
            ? this.setFeaturePropertyAttribute({}, propertyId)
            : {};
        let formatedAttributes: any = {
            ...resetAttributes,
            propertyId: propertyId || null,
            unitTypeId: postData.unitTypeId || null,
            // builtUpArea: postData.builtUpArea,
            // carpetArea: postData.carpetArea,
            facingTypeId: postData.facingTypeId || null,
            noOfStreet: postData.noOfStreets,
            electricityMeter: postData.electricityMeter,
            waterMeter: postData.waterMeter,
            street1Face: postData.street1Face,
            street2Face: postData.street2Face,
            street3Face: postData.street3Face,
            street4Face: postData.street4Face,
            street1Width: postData.street1Width, // here code comment because as per design
            street2Width: postData.street2Width,
            street3Width: postData.street3Width,
            street4Width: postData.street4Width,
            streetWidth: Math.max(
                ...[
                    Number(postData.street1Width) || 0,
                    Number(postData.street2Width) || 0,
                    Number(postData.street3Width) || 0,
                    Number(postData.street4Width) || 0,
                ]
            ),
            possessionTypeId: postData.possessionTypeId || null,
            completionYear: postData.buildYear || null,
            currencyTypeId: postData.currencyTypeId || CURRENCY_TYPE_ID,
            salePrice: postData.listingTypeId == 3 ? postData.salePrice : null,
            expectedRent:
                postData.listingTypeId == 4 ? postData.rentalPrice : null,
            rentCycle:
                postData.listingTypeId == 4
                    ? MAINTENANCE_CYCLE_TYPE_YEARLY
                    : null, // It is contantly define and value define in type_master table
        };
        // commented code to reset property feature attributes in db
        // Object.keys(formatedAttributes).forEach(
        //   (key) => !formatedAttributes[key] && delete formatedAttributes[key]
        // )
        (formatedAttributes.salePrice =
            postData.listingTypeId == 3 ? postData.salePrice : null),
            (formatedAttributes.expectedRent =
                postData.listingTypeId == 4 ? postData.rentalPrice : null),
            (formatedAttributes.rentCycle =
                postData.listingTypeId == 4
                    ? MAINTENANCE_CYCLE_TYPE_YEARLY
                    : null); // It is contantly define and value define in type_master table
        // formatedAttributes['streetWidth'] =
        //   formatedAttributes['streetWidth'] ?? null
        return formatedAttributes;
    }
    setFeaturePropertyAttribute(postData: any, propertyId: any): any {
        let formatedAttributes: any = {
            propertyId: propertyId,
            noOfBedrooms: postData.Bedroom || null,
            noOfBathrooms: postData.Bathroom || null,
            noOfGuestrooms: postData.GuestRoom || null,
            noOfLivingrooms: postData.LivingRoom || null,
            builtUpArea: postData.builtUpArea || null,
            carpetArea: postData.carpetArea || null,
            furnishingTypeId: postData.furnishingTypeId || null,
            floorNumber: postData.PropertyFloor || null,
            noOfParkings: postData.TotalCarParking || null,
            noOfFloors: postData.ApartmentTotalFloor || null,
            unitTypeId: PROPERTY_AREA_UNIT, // property unit count in square
        };
        // Object.keys(formatedAttributes).forEach(
        //   (key) => !formatedAttributes[key] && delete formatedAttributes[key]
        // )
        return formatedAttributes;
    }
    setPropertyTranslationResponse(postData: any, propertyId: any): any {
        return {
            propertyId: propertyId,
            title: postData.title,
            description: postData.description,
            locale: postData.locale || 'ar',
            address: postData.address,
            slug: `${slugify(String(postData.title), {
                remove: /[*+~.()'"!:@]/g,
                lower: true,
            })}-${propertyId}`,
        };
    }

    savePostPropertyFiles = async (filesPostData: any, propertyId: any) => {
        try {
            let imageValues = [];
            if (filesPostData && filesPostData.length > 0) {
                for (let i = 0; i < filesPostData.length; i++) {
                    imageValues.push({
                        property_id: propertyId,
                        name: filesPostData[i],
                        type: 'main',
                    });
                }
                await PropertyFile.destroy({
                    where: { property_id: propertyId, type: 'main' },
                    force: true,
                });
            } else {
                await PropertyFile.destroy({
                    where: { property_id: propertyId, type: 'main' },
                    force: true,
                });
            }
            if (imageValues && imageValues.length > 0) {
                await PropertyFile.bulkCreate(imageValues);
                return true;
            }
            return true;
        } catch (err: any) {
            console.log(err.message);
            logger.error(
                `PostPropertyRepository::savePostPropertyFiles : ${err.message}`
            );
        }
    };

    getPostedProperty = async (postData: any) => {
        return await this.findPostedPropertyByUserOrPostedId(
            postData.userId,
            postData.id
        );
    };

    savePostProperty = async (postData: any) => {
        let result = {};
        let property: any = await this.findPostedPropertyByUserOrPostedId(
            null,
            postData.id
        );

        if (property) {
            if (property.currentStep == 'property-info' && postData) {
                delete postData.currentStep;
            }
            if (
                property?.isDifferentOwner == false &&
                property?.isDifferentOwner != null &&
                property?.userTypeId == 47
            ) {
                let verifiedUserData = await getVerifiedUserDetails(
                    postData?.userId
                );
                postData.idType = verifiedUserData?.ksa_citizen
                    ? 'nid'
                    : 'iqma';
                postData.nationalIdNumber = verifiedUserData?.absher_id;
                postData.ownerName = verifiedUserData?.fullName;
                postData.ownerMobileNo = verifiedUserData?.phoneNumber;
                postData.ownerMobileCountryCode =
                    verifiedUserData?.phone_number_country_code;
            }
            result = await property.update(postData);
        } else {
            result = await PostProperty.create(postData);
        }
        return result;
    };

    generateRandomNumber = async (number: any) => {
        let add = 1;
        let max: any = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

        // if (number > max) {
        //   let res: any = number - max;
        //   return this.generateRandomNumber(max) + this.generateRandomNumber(res);
        // }

        max = Math.pow(10, number + add);
        let min = max / 10; // Math.pow(10, n) basically
        let numbers = Math.floor(Math.random() * (max - min + 1)) + min;

        return ('' + numbers).substring(add);
    };

    private async findPostedPropertyByUserOrPostedId(userId: any, id?: any) {
        if (id) {
            return await PostProperty.findByPk(id);
        } else {
            return await PostProperty.findOne({
                where: { userId: userId },
                order: [['createdAt', 'desc']],
            });
        }
    }

    getPropertyById = async (postData: any) => {
        let result = {};
        let property: any = await this.findPostedPropertyByUserOrPostedId(
            postData.userId,
            postData.id
        );

        if (property) {
            if (property.currentStep == 'property-info' && postData) {
                delete postData.currentStep;
            }
            result = await property.update(postData);
        } else {
            result = await PostProperty.create(postData);
        }
        return result;
    };
    // Step 3 [Get API] fetch detail from property table
    getPropertyInfobyId = async (postData: any) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };

        try {
            let property: any = await Property.findOne({
                where: {
                    [Op.or]: [
                        { userId: postData.userId },
                        { subuserId: postData.userId },
                        { addedBy: postData.userId },
                    ],
                    postPropertyId: postData.propertyId,
                },
                include: [
                    //{ model: PropertyLocation },
                    { model: PropertyAttribute },
                    // { model: PropertyFile },
                    { model: PostProperty },
                    { model: PropertyTypeOption },
                    {
                        model: PropertyTranslation,
                        where: { locale: postData.locale },
                    },
                    {
                        model: TypeMaster,
                        as: 'propertyFor',
                        include: [
                            {
                                model: TypeMasterTranslation,
                                where: { locale: postData.locale },
                            },
                        ],
                    },
                ],
            });

            if (property) {
                let propertyResponse: any =
                    this.setPropertyInfoResponse(property);
                responseData.property = propertyResponse;
                responseData.status = true;
                responseData.message = '';
                // return propertyResponse;
            } else {
                responseData.status = false;
                responseData.message = `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`;
            }
        } catch (err: any) {
            console.log(err.message);
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::getPropertyInfobyId : ${err.message}`
            );
        }
        return responseData;
    };

    getPropertyByPostPropertyId = async (postData: any) => {
        return await Property.findOne({
            where: { post_property_id: postData.id },
            include: [
                { model: PropertyLocation },
                { model: PropertyAttribute },
                { model: PropertyFile },
                { model: PostProperty },
                { model: PropertyTypeOption },
                {
                    model: TypeMaster,
                    as: 'propertyFor',
                    include: [
                        {
                            model: TypeMasterTranslation,
                            where: { locale: postData.locale },
                        },
                    ],
                },
            ],
        });
    };

    getPropertyFeatureByPostPropertyId = async (postData: any) => {
        return await Property.findOne({
            where: { post_property_id: postData.id },
            include: [
                { model: PropertyAttribute, required: false },
                {
                    model: PropertyTranslation,
                    where: { locale: postData.locale },
                    required: false,
                },
            ],
        });
    };
    getPropertyByPostedId = async (postData: any) => {
        return await Property.findOne({
            where: { post_property_id: postData.id },
            include: [
                { model: PropertyAttribute, required: false },
                { model: StreetInfo, required: false },
            ],
        });
    };

    // save property detail, location , attribute save in table
    saveLongJourneyProperty = async (postData: any) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };
        const transaction = await sequelize.transaction();
        try {
            let postedProperty: any = await this.getPostedProperty(postData);
            if (postedProperty) {
                // let userParentId:any = await this.getParentUserById(postData.userId)
                let propertyRes: any =
                    this.setSavedLongPropertyResponse(postData);
                const typeMaster = await TypeMaster.findOne({
                    raw: true,
                    where: {
                        type: 'property_source_platform',
                        slug: postData.source,
                    },
                    attributes: ['id'],
                });
                if (typeMaster) {
                    propertyRes.sourcePlatformTypeId = typeMaster.id;
                }
                propertyRes.propertyOwnerId = postData?.propertyOwnerId;

                // managing user/subuser
                propertyRes.userId = postData?.userId;
                propertyRes.subuserId = postData?.subUserId;
                propertyRes.postedAs = postData?.postedAs;

                propertyRes.titleDeedNo =
                    postedProperty?.dataValues.titleDeedNo;
                let title = await this.createTitlePostProperty(postData, null);
                propertyRes.darReference = title.darReference;
                let propertyData: any = await Property.create(propertyRes, {
                    transaction: transaction,
                });
                // set property location detail
                let locationRes = await this.setLongPropertyLocationResponse(
                    postData,
                    propertyData.id
                );
                // set property attribute detail
                let attributeRes = await this.setSavedLongPropertyAttribute(
                    postData,
                    propertyData.id
                );
                // save property attribute function
                await this.upInsertPropertyAttribute(
                    propertyData.id,
                    attributeRes,
                    transaction
                );

                // Property location save property_location table
                await this.upInsertPropertyLocation(
                    propertyData.id,
                    locationRes,
                    transaction
                );
                let enAddress,
                    arAddress = null;
                if (postData.locale == 'en') {
                    enAddress = postData.address;
                }
                if (postData.locale == 'ar') {
                    arAddress = postData.address;
                }
                let enTransaltion = this.setPropertyTranslationResponse(
                    {
                        locale: 'en',
                        title: title.enTitle,
                        propertyId: propertyData.id,
                        address: enAddress,
                    },
                    propertyData.id
                );
                let arTransaltion = this.setPropertyTranslationResponse(
                    {
                        locale: 'ar',
                        title: title.arTitle,
                        propertyId: propertyData.id,
                        address: arAddress,
                    },
                    propertyData.id
                );
                // english transalation save in property transaction table
                await this.upInsertPropertyTranslation(
                    propertyData.id,
                    enTransaltion,
                    transaction
                );
                // arabic transalation save in property transaction table
                await this.upInsertPropertyTranslation(
                    propertyData.id,
                    arTransaltion,
                    transaction
                );
                // let PropertyLocationRes = await PropertyLocation.create(locationRes)

                await transaction.commit();
                // not getting image file therfore not saving image file.
                // await this.savePostPropertyFiles(
                //   postData.PropertyFiles,
                //   propertyData.id
                // )
                responseData.status = true;
                responseData.property = postData.id;
            } else {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (err: any) {
            console.log('error==>saveLongJourneyProperty', err);
            await transaction.rollback();

            responseData.status = false;
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::saveLongJourneyProperty : ${err.message}`
            );
            throw new Error(
                `${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}:${err.message}`
            );
        }
        return responseData;
    };

    getFeaturePropertyInfobyId = async (postData: any) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };

        try {
            let property: any = await Property.findOne({
                where: {
                    [Op.or]: [
                        { userId: postData.userId },
                        { subuserId: postData.userId },
                        { addedBy: postData.userId },
                    ],
                    postPropertyId: postData.propertyId,
                },
                include: [
                    { model: PropertyAttribute },
                    { model: PropertyTranslation },
                    {
                        model: TypeMaster,
                        as: 'propertyFor',
                        include: [
                            {
                                model: TypeMasterTranslation,
                                where: { locale: postData.locale },
                            },
                        ],
                    },
                ],
            });
            if (property) {
                let propertyResponse: any = this.setPropertyFeatureInfoResponse(
                    property,
                    postData.locale
                );

                responseData.property = propertyResponse;
                responseData.status = true;
                responseData.message = '';
                // return propertyResponse;
            } else {
                responseData.status = false;
                responseData.message = `${PropertyErrorCodes.PROPERTY_NOT_FOUND}`;
            }
        } catch (err: any) {
            console.log(err.message);
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::getFeaturePropertyInfobyId : ${err.message}`
            );
        }

        return responseData;
    };
    // update property feature detail
    updateFeatureLongJourneyProperty = async (
        postData: any,
        propertyId: any
    ) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };
        const transaction = await sequelize.transaction();
        try {
            let propertyData = {
                attribute: this.setFeaturePropertyAttribute(
                    postData,
                    propertyId
                ),
                translation: this.setPropertyTranslationResponse(
                    postData,
                    propertyId
                ),
                title: { propertyId, locale: postData.locale },
            };
            await this.upInsertPropertyAttribute(
                propertyId,
                propertyData.attribute,
                transaction
            );
            await this.upInsertPropertyTranslation(
                propertyId,
                propertyData.translation,
                transaction
            );
            await transaction.commit();
            let title = await this.createTitlePostProperty(
                propertyData.title,
                null
            );
            let enTransaltion = this.setPropertyTranslationResponse(
                { locale: 'en', title: title.enTitle, propertyId: propertyId },
                propertyId
            );
            let arTransaltion = this.setPropertyTranslationResponse(
                { locale: 'ar', title: title.arTitle, propertyId: propertyId },
                propertyId
            );
            await this.upInsertPropertyTranslation(
                propertyId,
                enTransaltion,
                null
            );
            await this.upInsertPropertyTranslation(
                propertyId,
                arTransaltion,
                null
            );
            responseData.property = propertyId;
        } catch (err: any) {
            await transaction.rollback();
            console.log(
                'PostPropertyRepository::updateFeatureLongJourneyProperty:Catch',
                err.message
            );
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::updateFeatureLongJourneyProperty : ${err.message}`
            );
            throw new Error(
                `${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}:${err.message}`
            );
        }
        return responseData;
    };

    // update property detail, location , attribute
    updateLongJourneyProperty = async (
        postData: any,
        updatePropertyData: any
    ) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };
        const transaction = await sequelize.transaction();
        try {
            // this  boolean value is use to reset property features and amenities, which are getiing saved/updated in next step of UI
            postData.propertyTypeChanged =
                updatePropertyData.mainTypeId != postData.mainTypeId ||
                updatePropertyData.propertyTypeId != postData.propertyTypeId;
            let propertyData = {
                property: this.setUpdateLongPropertyResponse(postData),
                // set property attribute
                attribute: this.setSavedLongPropertyAttribute(
                    postData,
                    updatePropertyData.id
                ),
                // set property location
                location: this.setLongPropertyLocationResponse(
                    postData,
                    updatePropertyData.id
                ),
            };
            propertyData.property.statusTypeId = PropertyErrorCodes.INCOMPLETE; //incomplete status
            if (
                updatePropertyData.statusTypeId ==
                    PropertyErrorCodes.APPROVED ||
                updatePropertyData.statusTypeId == PropertyErrorCodes.REJECTED
            ) {
                propertyData.property.statusTypeId =
                    PropertyErrorCodes.BRE_APPROVAL;
                rabbitMQService.publishToDeleteProperty({
                    environment: process.env.NODE_ENV,
                    propertyId: updatePropertyData?.id,
                });
            }
            if (postData.propertyTypeChanged) {
                propertyData.property.statusTypeId =
                    PropertyErrorCodes.BRE_VERIFICATION;
                await AmenityProperty.destroy({
                    where: { propertyId: updatePropertyData.id },
                    transaction,
                });
            }
            propertyData.property.propertyOwnerId = postData?.propertyOwnerId;
            propertyData.property.postedAs = postData?.postedAs;
            propertyData.property.titleDeedNo = updatePropertyData?.titleDeedNo;
            if (postData.darReference) {
                delete postData.darReference;
            }

            await updatePropertyData.update(propertyData.property, {
                transaction: transaction,
            });
            // update property attribute
            await this.upInsertPropertyAttribute(
                updatePropertyData.id,
                propertyData.attribute,
                transaction
            );
            // update property location
            await this.upInsertPropertyLocation(
                updatePropertyData.id,
                propertyData.location,
                transaction
            );
            let enAddress,
                arAddress = null;
            if (postData.locale == 'en') {
                enAddress = postData.address;
            }
            if (postData.locale == 'ar') {
                arAddress = postData.address;
            }
            let enTransaltion = this.setPropertyTranslationResponse(
                {
                    locale: 'en',
                    propertyId: updatePropertyData.id,
                    address: enAddress,
                },
                updatePropertyData.id
            );
            let arTransaltion = this.setPropertyTranslationResponse(
                {
                    locale: 'ar',
                    propertyId: updatePropertyData.id,
                    address: arAddress,
                },
                updatePropertyData.id
            );
            await this.upInsertPropertyTranslation(
                updatePropertyData.id,
                enTransaltion,
                transaction
            );
            await this.upInsertPropertyTranslation(
                updatePropertyData.id,
                arTransaltion,
                transaction
            );
            await transaction.commit();
            // not getting file
            // await this.savePostPropertyFiles(
            //   postData.PropertyFiles,
            //   updatePropertyData.id
            // )
            responseData.property = postData.id;
            responseData.message = '';
        } catch (err: any) {
            console.log(err.message);
            await transaction.rollback();
            responseData.status = false;
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::updateLongJourneyProperty : ${err.message}`
            );
            throw new Error(
                `${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}:${err.message}`
            );
        }
        return responseData;
    };
    getPropertyInfoByPostPropertyId = async (id: any) => {
        return await Property.findOne({
            where: { post_property_id: id },
            attributes: ['id'],
        });
    };

    getPostedPropertyDetailsByUserId = async (postData: any) => {
        try {
            let propertyIds = await PostProperty.findAll({
                where: {
                    [Op.or]: [
                        { userId: postData.userId },
                        { subUserId: postData.userId },
                    ],
                },
                attributes: ['id'],
            });
            let ids = propertyIds.map((data: any) => data.dataValues.id);
            let prop = await Property.findAll({
                where: {
                    [Op.or]: [
                        { userId: postData.userId },
                        { subuserId: postData.userId },
                    ],
                    postPropertyId: { [Op.in]: ids },
                },
                attributes: ['id', 'UserId'],
            });
            return prop.map((data: any) => data.dataValues.id);
        } catch (err: any) {
            console.log(err.message);
            logger.error(
                `PostPropertyRepository::getPostedPropertyByUserId : ${err.message}`
            );
        }
    };
    getPostedPropertiesByUserId = async (postData: any) => {
        try {
            // let propertyIds = await PostProperty.findAll({
            //   where: { userId: postData.userId },
            //   attributes: ['id'],
            // })
            // let ids = propertyIds.map((data: any) => data.dataValues.id)
            // return ids;
            let prop = await Property.findAll({
                where: {
                    userId: postData.userId,
                    postPropertyId: {
                        [Op.not]: null,
                    },
                    statusTypeId: {
                        [Op.in]: [
                            PropertyErrorCodes.BRE_VERIFICATION,
                            PropertyErrorCodes.VERIFIED,
                            PropertyErrorCodes.BRE_APPROVAL,
                            PropertyErrorCodes.LOCALIZATION,
                            PropertyErrorCodes.APPROVED,
                            PropertyErrorCodes.UNPUBLISHED,
                            PropertyErrorCodes.BRE_VERIFICATION,
                            PropertyErrorCodes.VERIFIED,
                            PropertyErrorCodes.BRE_APPROVAL,
                            PropertyErrorCodes.LOCALIZATION,
                            PropertyErrorCodes.REJECTED,
                            PropertyErrorCodes.MISSING,
                        ],
                    },
                },
                attributes: ['id', 'UserId'],
            });
            return prop.map((data: any) => data.dataValues.id);
        } catch (err: any) {
            console.log(err.message);
            logger.error(
                `PostPropertyRepository::getPostedPropertyByUserId : ${err.message}`
            );
        }
    };

    getUserPropertiesByUserId = async (data: any) => {
        let responseData: {
            data: any | null;
            count: any | null;
        } = {
            data: null,
            count: null,
        };

        try {
            const checkUser: any = await userService.checkUser(data.userId);

            let order: any = ['updatedAt', 'DESC'];
            let where: any = {
                user_id: data.userId,
                postPropertyId: {
                    [Op.not]: null,
                },
                status_type_id: GroupStatusCodes.GROUP_STATUS_ALL,
            };

            if (data.isVerified != undefined) {
                where['wathq_verified'] = data.isVerified;
            }
            // checking if agent or super user
            if (checkUser.parent_id) {
                where['subuser_id'] = checkUser.id;
                where['user_id'] = checkUser.parent_id;
            } else if (data.agentId && data.agentId.length > 0) {
                where['subuser_id'] = data.agentId;
            }
            // console.log(where);
            // to do==> will remove below comments later
            // let property: any = {}
            // let propertyId: any = await PostPropertyRepo.getPostedPropertiesByUserId({
            //   userId: data.userId,
            // })

            if (data.subStatusTypeId != 0) {
                switch (parseInt(data.subStatusTypeId)) {
                    case PropertyErrorCodes.APPROVED:
                        where['status_type_id'] = PropertyErrorCodes.APPROVED;
                        break;
                    case PropertyErrorCodes.PENDING:
                        where['status_type_id'] =
                            GroupStatusCodes.GROUP_STATUS_PENDING;
                        break;
                    case PropertyErrorCodes.REJECTED:
                        where['status_type_id'] = PropertyErrorCodes.REJECTED;
                        break;
                    case PropertyErrorCodes.ARCHIVED:
                        where['status_type_id'] =
                            GroupStatusCodes.GROUP_STATUS_ARCHIVED;
                        break;
                    default:
                        where['status_type_id'] =
                            GroupStatusCodes.GROUP_STATUS_ALL;
                        break;
                }
            }

            // if (data.typeId && data.typeId != 0) {
            //   where['property_type_d'] = data.typeId
            // }
            // if (data.bedrooms && data.bedrooms != 0) {
            //   where['no_of_bedrooms'] = data.bedrooms
            // }
            // if (data.bathrooms && data.bathrooms != 0) {
            //   where['no_of_bathrooms'] = data.bathrooms
            // }
            // if (data.cityId && data.cityId != 0) {
            //   where['city_id'] = data.cityId
            // }

            // Finding total property count
            let propertyCount: any = await PropertyView.count({
                distinct: true,
                where: where,
            });

            // find property list by query and pagination
            let propertyData: any = await PropertyView.findAll({
                // raw: true,
                subQuery: true,
                attributes: data.locale == 'en' ? this.enAttr : this.arAttr,
                include: [
                    {
                        model: PropertyFile,
                        where: {
                            type: {
                                [Op.in]: ['main', 'interior', 'exterior'],
                            },
                        },
                        attributes: ['name'],
                        order: ['type', 'DESC'],
                        required: false,
                    },
                ],
                where: where,
                order: [order],
                limit: data.limit,
                offset: data.offset,
            });
            // propertyCount variable not is use that's why commented
            // let propertyCount = await PropertyView.count({
            //   where: {
            //     id: { [Op.in]: propertyId },
            //     user_id: data.userId,
            //   },
            // })
            if (propertyData) {
                let userPropertyResponse: any = [];
                for (let i = 0; i < propertyData.length; i++) {
                    const property = propertyData[i];

                    let userPropertyResponseData =
                        await PropertyRepo.setUserPropertyResponse(
                            property.toJSON(),
                            data.locale
                        );

                    userPropertyResponse.push(userPropertyResponseData);
                }
                responseData.count = propertyCount || 0;
                responseData.data = userPropertyResponse;
            }
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUserPropertiesByUserId → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };

    getUserPostPropertyStatusCount = async (data: any) => {
        let responseData: {
            headers: any | null;
        } = {
            headers: null,
        };
        let where: any = {
            user_id: data.userId,
            postPropertyId: {
                [Op.not]: null,
            },
            status_type_id: GroupStatusCodes.GROUP_STATUS_ALL,
        };
        const locale = data.locale || 'ar';
        try {
            const user: any = await userService.checkUser(data.userId);

            if (user.parent_id) {
                where['subuser_id'] = user.id;
                where['user_id'] = user.parent_id;
            } else if (data.agentId && data.agentId.length > 0) {
                where['subuser_id'] = data.agentId;
            }
            if (data.isVerified != undefined) {
                where['wathq_verified'] = data.isVerified;
            }
            // let propertyids: any = await this.getPostedPropertyDetailsByUserId({
            //   userId: data.userId,
            // })
            const propertyViewCount = await PropertyView.findAll({
                raw: true,
                where: where,
                attributes: [
                    'status_type_id',
                    [Sequelize.fn('COUNT', 'status_type_id'), 'status_count'],
                ],
                group: ['status_type_id'],
            });
            let propertyCountByStatus: any = propertyViewCount.reduce(
                (obj: any, item: any) => {
                    let status_id =
                        FilterRequestSingleCodeByGroup[item.status_type_id] ||
                        item.status_type_id;
                    const currentCount = parseInt(item.status_count || 0);
                    if (!obj[status_id]) {
                        obj[status_id] = currentCount;
                    } else {
                        obj[status_id] =
                            parseInt(obj[status_id]) + currentCount;
                    }

                    obj[PropertyErrorCodes.ALL_STATUS] =
                        parseInt(obj[PropertyErrorCodes.ALL_STATUS] || 0) +
                        currentCount;

                    return obj;
                },
                {}
            );
            // console.log('propertyViewCount',propertyCountByStatus);
            // const approvedCount = await PropertyView.count({
            //   where: {
            //     ...where,
            //     statusTypeId: GroupStatusCodes.GROUP_STATUS_APPROVED,
            //   },
            // })

            // const pendingCount = await PropertyView.count({
            //   where: {
            //     ...where,
            //     statusTypeId: GroupStatusCodes.GROUP_STATUS_PENDING,
            //   },
            // })
            // const rejectedCount = await PropertyView.count({
            //   where: {
            //     ...where,
            //     statusTypeId: GroupStatusCodes.GROUP_STATUS_REJECTED,

            //   },
            // })
            // const archivedCount = await PropertyView.count({
            //   where: {
            //     ...where,
            //     statusTypeId: GroupStatusCodes.GROUP_STATUS_ARCHIVED,

            //   },
            // })

            const headers: any = [];
            headers.push({
                statusTypeId: '',
                statusType: i18next.t(`${PropertyErrorCodes.ALL_STATUS}`, {
                    lng: locale,
                }),
                count:
                    propertyCountByStatus[PropertyErrorCodes.ALL_STATUS] || 0,
                active: false,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.APPROVED,
                statusType: i18next.t(`${PropertyErrorCodes.APPROVED}`, {
                    lng: locale,
                }),
                count: propertyCountByStatus[PropertyErrorCodes.APPROVED] || 0,
                active:
                    data.statusTypeId == PropertyErrorCodes.APPROVED
                        ? true
                        : false,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.PENDING,
                statusType: i18next.t(`${PropertyErrorCodes.PENDING}`, {
                    lng: locale,
                }),
                count: propertyCountByStatus[PropertyErrorCodes.PENDING] || 0,
                active:
                    data.statusTypeId == PropertyErrorCodes.PENDING
                        ? true
                        : false,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.REJECTED,
                statusType: i18next.t(`${PropertyErrorCodes.REJECTED}`, {
                    lng: locale,
                }),
                count: propertyCountByStatus[PropertyErrorCodes.REJECTED] || 0,
                active:
                    data.statusTypeId == PropertyErrorCodes.REJECTED
                        ? true
                        : false,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.ARCHIVED,
                statusType: i18next.t(`${PropertyErrorCodes.ARCHIVED}`, {
                    lng: locale,
                }),
                count: propertyCountByStatus[PropertyErrorCodes.ARCHIVED] || 0,
                active:
                    data.statusTypeId == PropertyErrorCodes.ARCHIVED
                        ? true
                        : false,
            });

            // code commented because it will implment in next phase
            // headers.push({
            //   statusTypeId: PropertyErrorCodes.INCOMPLETE,
            //   statusType: i18next.t(`${PropertyErrorCodes.INCOMPLETE}`, {
            //     lng: locale,
            //   }),
            //   count: propertyCountByStatus[PropertyErrorCodes.INCOMPLETE] || 0,
            //   active: data.statusTypeId == PropertyErrorCodes.INCOMPLETE ? true : false,
            // })

            responseData = headers;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUserPostPropertyStatusCount → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };

    updatePostPropertyStatus = async (data: any) => {
        let responseData: any = {};
        try {
            let statusTypeId = null;
            let userDetails = await User.findOne({
                where: { id: data.userId },
            });
            let propertyIds: any =
                await PostPropertyRepo.getPostedPropertyDetailsByUserId({
                    userId: userDetails.parent_id || data.userId,
                });

            if (propertyIds.includes(`${data.propertyId}`)) {
                if (data.action && data.action != '') {
                    switch (data.action) {
                        case 'activate':
                            statusTypeId = PropertyErrorCodes.BRE_APPROVAL;
                            break;
                        case 'deactivate':
                            statusTypeId = PropertyErrorCodes.UNPUBLISHED;
                            break;
                        default:
                            null;
                    }
                }
            } else {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            if (statusTypeId) {
                await Property.update(
                    { statusTypeId },
                    {
                        where: {
                            id: data.propertyId,
                            // user_id: data.userId,
                        },
                    }
                );
            }

            responseData.data = data.propertyId;
            responseData.message = 'PROPERTY_STATUS_UPDATED_SUCCESSFULLY';
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUserPostPropertyStatusCount → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };

    getPropertyIdByPostPropertyId = async (id: any) => {
        return await Property.findOne({
            where: { post_property_id: id },
            attributes: ['id', 'mainTypeId', 'propertyTypeId'],
        });
    };

    private async upInsertPropertyTranslation(
        propertyId: any,
        translation: any,
        trans: any
    ) {
        let res: any = {};
        let propertyTranslation = await PropertyTranslation.findOne({
            where: { propertyId: propertyId, locale: translation.locale },
        });
        if (propertyTranslation && translation) {
            if (translation.title && translation.title == 'default') {
                delete translation.title;
            }
            res = await propertyTranslation.update(translation, {
                transaction: trans,
            });
        } else {
            res = await PropertyTranslation.create(
                {
                    ...translation,
                    propertyId: propertyId,
                },
                {
                    transaction: trans,
                }
            );
        }
        return res;
    }

    private async upInsertPropertyAttribute(
        propertyId: any,
        data: any,
        trans: any
    ) {
        let res: any = {};
        let propertyAttribute = await PropertyAttribute.findOne({
            where: { propertyId: propertyId },
        });
        if (propertyAttribute && data) {
            res = await propertyAttribute.update(data, {
                transaction: trans,
            });
        } else {
            res = await PropertyAttribute.create(
                {
                    ...data,
                    propertyId: propertyId,
                },
                {
                    transaction: trans,
                }
            );
        }
        return res;
    }
    private async upInsertPropertyLocation(
        propertyId: any,
        data: any,
        trans: any
    ) {
        let res: any = {};
        let propertyLocation = await PropertyLocation.findOne({
            where: { propertyId: propertyId },
        });
        if (propertyLocation && data) {
            res = await propertyLocation.update(data, {
                transaction: trans,
            });
        } else {
            res = await PropertyLocation.create(
                {
                    ...data,
                    propertyId: propertyId,
                },
                {
                    transaction: trans,
                }
            );
        }
        return res;
    }
    createTitlePostProperty = async (postData: any, darReference: string) => {
        try {
            let entitle,
                artitle = null;
            let propertyTitle: any = {};
            if (!postData.propertyId) {
                let randomCode = await this.generateRandomNumber(6);
                if (darReference) {
                    const darArr = darReference.split(/[\s-]+/);
                    randomCode = darArr[darArr.length - 1];
                }
                if (postData.listingTypeId == '3') {
                    propertyTitle.darReference = `${postData.userId}-SAU-BU-${randomCode}`;
                    propertyTitle.enTitle = 'property for sale';
                    propertyTitle.arTitle = 'property for sale';
                } else if (postData.listingTypeId == '4') {
                    propertyTitle.darReference = `${postData.userId}-SAU-RE-${randomCode}`;
                    propertyTitle.enTitle = 'property for rent';
                    propertyTitle.arTitle = 'property for rent';
                }
                return propertyTitle;
            }
            let property: any = await Property.findOne({
                where: { id: postData.propertyId },
                include: [
                    { model: PropertyAttribute },
                    { model: PropertyTranslation },
                    {
                        model: TypeMaster,
                        as: 'propertyFor',
                        include: [
                            {
                                model: TypeMasterTranslation,
                                where: { locale: postData.locale },
                            },
                        ],
                    },
                ],
            });

            let purposeName: any = await TypeMaster.findOne({
                attributes: ['code'],
                where: { id: property.listingTypeId },
                include: [
                    {
                        model: TypeMasterTranslation,
                        attributes: ['name', 'locale'],
                    },
                ],
            });
            let enPurpose = purposeName?.TypeMasterTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let arPurpose = purposeName?.TypeMasterTranslations.find(
                (o: any) => o.locale === 'ar'
            );

            let enUnitTypeName: any = {},
                arUnitTypeName: any = {};
            let unitTypeName: any = await TypeMaster.findOne({
                attributes: ['id'],
                where: { id: property.PropertyAttribute.unitTypeId },
                include: [
                    {
                        model: TypeMasterTranslation,
                        attributes: ['name', 'locale'],
                    },
                ],
            });
            enUnitTypeName = unitTypeName?.TypeMasterTranslations.find(
                (o: any) => o.locale === 'en'
            );
            arUnitTypeName = unitTypeName?.TypeMasterTranslations.find(
                (o: any) => o.locale === 'ar'
            );

            var landFarmIds = [43, 44, 49];
            let enPropertyTypeName: any,
                arPropertyTypeName: any = {};
            let propertyTypeSlug: any = await PropertyTypesTranslation.findAll({
                attributes: ['name', 'locale'],
                where: { property_type_id: property.propertyTypeId },
            });

            enPropertyTypeName = propertyTypeSlug?.find(
                (o: any) => o.locale === 'en'
            );
            arPropertyTypeName = propertyTypeSlug?.find(
                (o: any) => o.locale === 'ar'
            );

            let propertyData = {
                mainTypeId: property.mainTypeId,
                noOfBedrooms: property.PropertyAttribute.noOfBedrooms,
                propertyTypeId: property.propertyTypeId,
                carpetArea: property.PropertyAttribute.carpetArea,
                builtUpArea: property.PropertyAttribute.builtUpArea,
                enUnitType: enUnitTypeName,
                arPropertyType: arPropertyTypeName,
                enPropertyType: enPropertyTypeName,
                arPurposeSlug: arPurpose,
                enPurposeSlug: enPurpose,
            };

            propertyTitle.enTitle = this.setEnTitle(propertyData);
            propertyTitle.arTitle = this.setArTitle(propertyData);
            let randomCode = await this.generateRandomNumber(6);
            if (darReference) {
                const darArr = darReference.split(/[\s-]+/);
                randomCode = darArr[darArr.length - 1];
            }
            if (postData.listingTypeId == '3') {
                propertyTitle.darReference = `${postData.userId}-SAU-BU-${randomCode}`;
            } else if (postData.listingTypeId == '4') {
                propertyTitle.darReference = `${postData.userId}-SAU-RE-${randomCode}`;
            }
            return propertyTitle;
        } catch (err: any) {
            logger.error(`PropertyRepository::createTitle → ${err.message}`);
            throw err;
        }
    };

    setArTitle(postData: any) {
        var bedCount = '',
            areaUnit = 'متر مربع',
            builtUpArea;
        var landFarmIds = [43, 44, 49];
        let isResidential = postData.mainTypeId == 2;
        let bedrooms = postData.noOfBedrooms;

        if (isResidential && bedrooms != null) {
            bedCount =
                bedrooms == '0'
                    ? 'ستوديو'
                    : bedrooms >= 10
                    ? '9+ غرف نوم'
                    : bedrooms + ' غرف نوم';
        }

        var selectedSubPropertyTypeId = postData.propertyTypeId;
        if (landFarmIds.indexOf(parseInt(selectedSubPropertyTypeId)) > -1) {
            builtUpArea = postData.carpetArea;
        } else {
            builtUpArea = isResidential ? '' : postData.builtUpArea;
        }

        if (selectedSubPropertyTypeId == RESIDENTIAL_BUILDING) {
            // if it is building-residential
            builtUpArea = postData.carpetArea;
        }

        if (postData.enUnitType && postData.enUnitType.name == 'SQFT') {
            builtUpArea = builtUpArea ? Math.round(builtUpArea * 0.092903) : '';
        }

        let titleWithBuiltUpArea = builtUpArea
            ? `${builtUpArea} ${areaUnit} `
            : '';
        let propertyTitleAr =
            isResidential && bedrooms != null
                ? `${bedCount} ${
                      postData.arPropertyType
                          ? postData.arPropertyType.name
                          : ''
                  }  إلى عن على ${
                      postData.arPurposeSlug ? postData.arPurposeSlug.name : ''
                  }`
                : `${titleWithBuiltUpArea}${
                      postData.arPropertyType
                          ? postData.arPropertyType.name
                          : ''
                  }  إلى عن على ${
                      postData.arPurposeSlug ? postData.arPurposeSlug.name : ''
                  }`;
        propertyTitleAr = propertyTitleAr?.replace(/,\s*$/, '');
        propertyTitleAr = propertyTitleAr?.replace(/ , , \s*$/, '');
        propertyTitleAr = propertyTitleAr?.replace(/,\s*$/, '');
        propertyTitleAr = propertyTitleAr?.replace(/ ,\s*$/, '');
        propertyTitleAr = propertyTitleAr?.replace(/,,\s*$/, '');
        return propertyTitleAr;
    }

    setEnTitle(postData: any) {
        var bedCount = '',
            areaUnit = 'SQM',
            builtUpArea;
        let isResidential = postData.mainTypeId == 2;
        let bedrooms = postData.noOfBedrooms;
        var landFarmIds = [43, 44, 49];
        if (isResidential && bedrooms != null) {
            bedCount =
                bedrooms == '0'
                    ? 'Studio'
                    : bedrooms >= 10
                    ? '9+ Bedroom(s)'
                    : bedrooms + ' Bedroom(s)';
        }

        var selectedSubPropertyTypeId = postData.propertyTypeId;
        if (landFarmIds.indexOf(parseInt(selectedSubPropertyTypeId)) > -1) {
            builtUpArea = postData.carpetArea;
        } else {
            builtUpArea = isResidential ? '' : postData.builtUpArea;
        }

        if (selectedSubPropertyTypeId == RESIDENTIAL_BUILDING) {
            // if it is building-residential
            builtUpArea = postData.carpetArea;
        }

        //areaUnit = builtUpArea != "" ? "" : $("#unit_type_id option:selected").text();
        if (postData.enUnitType && postData.enUnitType.name == 'SQFT') {
            builtUpArea = builtUpArea ? Math.round(builtUpArea * 0.092903) : '';
        }

        let titleWithBuiltUpArea = builtUpArea
            ? `${builtUpArea} ${areaUnit} `
            : '';
        let propertyTitleEn =
            isResidential && bedrooms != null
                ? `${bedCount} ${
                      postData.enPropertyType
                          ? postData.enPropertyType.name
                          : ''
                  } for ${
                      postData.enPurposeSlug ? postData.enPurposeSlug.name : ''
                  }`
                : `${titleWithBuiltUpArea}${
                      postData.enPropertyType
                          ? postData.enPropertyType.name
                          : ''
                  } for ${
                      postData.enPurposeSlug ? postData.enPurposeSlug.name : ''
                  }`;

        propertyTitleEn = propertyTitleEn.replace(/,\s*$/, '');
        propertyTitleEn = propertyTitleEn.replace(/ , , \s*$/, '');
        propertyTitleEn = propertyTitleEn.replace(/,\s*$/, '');
        propertyTitleEn = propertyTitleEn.replace(/ ,\s*$/, '');
        propertyTitleEn = propertyTitleEn.replace(/,,\s*$/, '');
        return propertyTitleEn;
    }

    getPostedPropertyForXML = async (postData: any) => {
        return await this.findPostedPropertyByUserOrPostedId(
            postData.userId,
            postData.id
        );
    };

    upInsertPropertyTranslationMap = async (
        propertyId: any,
        enTransaltion: any,
        arTransaltion: any
    ) => {
        this.upInsertPropertyTranslation(propertyId, enTransaltion, null);
        this.upInsertPropertyTranslation(propertyId, arTransaltion, null);
    };
    /**
     * method to get  parent id
     * @param data {userId}
     * @returns   data {parentId}
     */
    getParentUserById = async (userId: number) => {
        try {
            return await User.findOne({
                raw: true,
                attributes: ['parent_id'],
                where: {
                    id: userId,
                },
            });
        } catch (err) {
            throw err;
        }
    };

    validatePostPropertyId = async (postPropertyId: number, userId: number) => {
        return await Property.findOne({
            raw: true,
            where: {
                postPropertyId: postPropertyId,
                [Op.or]: [
                    { userId: userId },
                    { subuser_id: userId },
                    { addedBy: userId },
                ],
            },
            attributes: ['id', 'postPropertyId', 'external_video_link'],
        });
    };

    /**
     * @description accepts an array of images in reqBody, deletes any other images entry corresponding
     * to a property from PropertyFiles and its mapping from PropertyFileUser
     * add new images entry in PropertyFiles and its mapping in PropertyFileUser
     */
    addOrEditImages = async (reqBody: any) => {
        //deleting previous images
        await PropertyFile.destroy({
            where: {
                property_id: reqBody.propertyId,
                type: { [Op.not]: propertyFileTypes.REGA },
            },
        });
        // check image cdn link or direct name
        if (reqBody.PropertyFiles.length > 0) {
            for (let i = 0; i < reqBody.PropertyFiles.length; i++) {
                let resultImageUrl = await this.isValidImageUrl(
                    reqBody.PropertyFiles[i].name
                );
                if (resultImageUrl) {
                    let imageResult = await setImageFilesForProperty(
                        reqBody.PropertyFiles[i].name,
                        reqBody?.userId
                    );
                    reqBody.PropertyFiles[i].name = imageResult;
                }
            }
        }
        let imagesData1: any[] = [];
        let fileNames: any[] = [];
        reqBody.PropertyFiles.forEach((imageObject: { name: string }) => {
            let propertyFileDataObject = {
                property_id: reqBody.propertyId,
                type: propertyFileTypes.MAIN,
                name: imageObject.name,
            };
            imagesData1.push(propertyFileDataObject);
            fileNames.push(imageObject.name);
        });

        //fetch existing files of this property
        let existingFiles = await PropertyFile.findAll({
            where: {
                property_id: reqBody.propertyId,
                type: { [Op.not]: propertyFileTypes.REGA },
            },
        });

        await this.destroyFiles({
            existingFiles,
            propertyId: reqBody.propertyId,
            fileNames,
        });
        //get images payload to enter in Property File
        const imagesData = this.serializeFilesToCreate({
            existingFiles,
            fileNames,
            propertyId: reqBody.propertyId,
        });

        //creating seperate row for every image in property_files table
        const createdFiles = await PropertyFile.bulkCreate(imagesData);
        let mappedCreatedFiles: any = [];
        let fileUserMapping: any = [];

        /*
// Todo: To be checked in wasalt pro.
    createdFiles.forEach((file: any) => {
      fileUserMapping.push({
        propertyFileId: file.id,
        userId: reqBody.addedBy ||  reqBody.userId,
        roleId: reqBody.roleId
      })
    });

    //create a mapping of newly created entries in property_file_user table
    // await PropertyFileUser.bulkCreate(fileUserMapping)
 */
        //return all the entries of PropertyFile corresponding to this property id
        let allFilesArr = existingFiles.concat(createdFiles);
        allFilesArr.forEach((file: any) => {
            if (fileNames.includes(file?.dataValues?.name)) {
                mappedCreatedFiles.push({
                    id: file?.dataValues?.id,
                    name: file?.dataValues?.name,
                    property_id: reqBody.propertyId,
                    type: file?.dataValues?.type,
                });
            }
        });

        return mappedCreatedFiles;
    };

    //updating video link in properties table
    editExternalVideoUrl = async (reqBody: any) => {
        return Property.update(
            {
                external_video_link: reqBody.videoURL,
            },
            {
                where: {
                    postPropertyId: reqBody.id,
                },
            }
        );
    };

    // method to add property files (property photos and external video link), called from property service
    addPropertyPhotosAndVideo = async (reqBody: any) => {
        console.log('addPropertyPhotosAndVideo', reqBody);
        let responseData: addPropertyMediaRes = {
            status: false,
            data: null,
            message: '',
        };

        reqBody.id = parseInt(reqBody.id);

        const validatePostPropertyId = await this.validatePostPropertyId(
            reqBody.id as number,
            reqBody.userId as number
        );

        if (validatePostPropertyId) {
            reqBody.propertyId = validatePostPropertyId.id;
            let filesCreated;
            let dataStructure;
            if (reqBody.PropertyFiles) {
                filesCreated = await PostPropertyRepo.addOrEditImages({
                    ...reqBody,
                });
                dataStructure = {
                    id: reqBody.id,
                    PropertyFiles: filesCreated,
                };
            }

            if (reqBody.videoURL) {
                await PostPropertyRepo.editExternalVideoUrl(reqBody);
            }
            if (reqBody.PropertyFiles.length > 0 || reqBody.videoURL) {
                await PostProperty.update(
                    { currentStep: reqBody.currentStep },
                    { where: { id: reqBody.id } }
                ); //
                responseData.status = true;
                responseData.data = dataStructure;
                responseData.message = 'MEDIA_ADDED';
            } else {
                responseData.status = true;
                responseData.message = '';
            }
        } else {
            responseData.message = 'PROPERTY_AND_USER_NOT_FOUND';
        }
        return responseData;
    };

    // method to get property files (property photos and external video link), called from property service
    getPropertyPhotosAndVideo = async (reqBody: any) => {
        const responseData: getPropertyMediaRes = {
            status: false,
            data: null,
            message: '',
        };

        i18next.changeLanguage(reqBody.locale);
        const validatePostPropertyId: any =
            await this.getPropertyByPostPropertyAndUserId(
                reqBody.id as number,
                reqBody.userId as number
            );
        if (validatePostPropertyId) {
            let mappedPropertyFiles: string[] = [];
            if (validatePostPropertyId.dataValues.PropertyFiles) {
                validatePostPropertyId.dataValues.PropertyFiles =
                    validatePostPropertyId.dataValues.PropertyFiles.filter(
                        (pFile: any) => pFile.type != propertyFileTypes.REGA
                    );
                mappedPropertyFiles =
                    validatePostPropertyId.dataValues.PropertyFiles.map(
                        (file: any) => {
                            return {
                                id: file.id,
                                name: file.name,
                                property_id:
                                    validatePostPropertyId.dataValues.id,
                                type: file.type,
                            };
                        }
                    );
            }

            let mappedData = {
                id: reqBody.id,
                PropertyFiles: mappedPropertyFiles,
                videoURL: validatePostPropertyId.dataValues.external_video_link,
            };
            responseData.status = true;
            responseData.data = mappedData;
            responseData.message = i18next.t('SUCCESS');
        } else {
            responseData.message = i18next.t('PROPERTY_AND_USER_NOT_FOUND');
        }
        return responseData;
    };

    //getting property row through post property id and user id
    getPropertyByPostPropertyAndUserId = (
        postPropertyId: number,
        userId: number
    ) => {
        return Property.findOne({
            where: {
                postPropertyId: postPropertyId,
                [Op.or]: [
                    { userId: userId },
                    { subuser_id: userId },
                    { addedBy: userId },
                ],
            },
            attributes: [
                'id',
                'postPropertyId',
                'external_video_link',
                'mainTypeId',
                'darReference',
            ],
            include: {
                model: PropertyFile,
                attributes: ['id', 'name', 'type'],
                required: false,
            },
        });
    };

    /**
     * method to assign user to property
     * @param data {userId, subuserId, propertyId}
     * @returns
     */
    assignPropertyToUser = async (data: any) => {
        // check if subuser exists under parent user
        const subuser = await User.findOne({
            where: {
                id: data.subuserId,
                parent_id: data.userId,
            },
        });
        // if loggedIn user and subuser is same then set subuser = null(assigned to me case)
        if (data.userId == data.subuserId) {
            data.subuserId = null;
        } else if (!subuser) {
            throw new Error(`${PropertyErrorCodes.USER_NOT_FOUND}`);
        }
        // find the property
        let property: any = await Property.findOne({
            where: { id: data?.propertyId },
            include: PostProperty,
        });
        // find in postproperty as well
        let postProperty: any = await PostProperty.findOne({
            where: { id: data?.propertyId },
        });

        // check property ownership with logged in user
        if (property && property.userId == data.userId) {
            // assign the subuser
            await property.update({ subuserId: data.subuserId });
            await property?.PostProperty.update({ subUserId: data.subuserId });
        } else if (postProperty && postProperty?.userId == data.userId) {
            await postProperty?.update({ subUserId: data.subuserId });
        } else {
            throw new Error(
                `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
            );
        }
        return property || postProperty;
    };

    /**
     * @description add/update the post-property basic details
     * @param postData {id, roleId, listingTypeId. cityId, userId, subUserId}
     * @returns saved post-property id
     */
    savePropertyBasicDetails = async (postData: any) => {
        let postPropertyData: any = {
            cityId: postData?.cityId,
            listingTypeId: postData?.listingTypeId,
            userId: postData?.userId,
            userTypeId: postData?.roleId,
            source: postData?.source,
            districtId: postData?.districtId || null,
            currentStep: postData?.currentStep || null,
        };
        if (
            !postData.id &&
            postData.roleId !== AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM
        ) {
            postPropertyData['addedBy'] = postData?.addedBy || postData?.userId;
        }
        // attributes to change
        let attributes: any = {};
        if (postData?.subUserId) {
            postPropertyData.subUserId = postData?.subUserId;
        }
        // existing property & post property data
        let existingPostProperty: any = await PostProperty.findOne({
            where: {
                id: postData?.id || null,
                userId: postData?.userId || null,
            },
            include: [
                { model: Property, include: [PropertyAttribute] },
                PropertyVerificationInfo,
            ],
        });
        // throw error if id is provided for updating property basic details but existingPostProperty is null
        if (postData?.id && !existingPostProperty)
            throw new Error('CANT_FIND_PROPERTY');

        if (existingPostProperty) {
            if (
                postPropertyData.listingTypeId == 4 &&
                postPropertyData.listingTypeId !=
                    existingPostProperty.listingTypeId
            ) {
                // if it is rent

                if (
                    existingPostProperty?.Property?.statusTypeId ==
                        PropertyErrorCodes.APPROVED ||
                    existingPostProperty?.Property?.statusTypeId ==
                        PropertyErrorCodes.REJECTED
                ) {
                    await existingPostProperty?.Property?.update({
                        statusTypeId: PropertyErrorCodes.BRE_VERIFICATION,
                    });
                    await PropertyStatusLog.create({
                        property_id: postData.id,
                        status_type_id: PropertyErrorCodes.BRE_VERIFICATION,
                    });
                    rabbitMQService.publishToDeleteProperty({
                        environment: process.env.NODE_ENV,
                        propertyId: existingPostProperty?.Property?.id,
                    });
                }
                postPropertyData.titleDeedNo = null;
                attributes.salePrice = null;
            }
            if (
                postPropertyData.listingTypeId == 3 &&
                postPropertyData.listingTypeId !=
                    existingPostProperty.listingTypeId
            ) {
                // if it is sell
                if (
                    existingPostProperty?.Property?.statusTypeId ==
                        PropertyErrorCodes.APPROVED ||
                    existingPostProperty?.Property?.statusTypeId ==
                        PropertyErrorCodes.REJECTED
                ) {
                    await existingPostProperty?.Property?.update({
                        statusTypeId: PropertyErrorCodes.BRE_VERIFICATION,
                    });
                    await PropertyStatusLog.create({
                        property_id: postData.id,
                        status_type_id: PropertyErrorCodes.BRE_VERIFICATION,
                    });
                    rabbitMQService.publishToDeleteProperty({
                        environment: process.env.NODE_ENV,
                        propertyId: existingPostProperty?.Property?.id,
                    });
                }
                attributes.rentCycle = null;
                attributes.expectedRent = null;
            }
            if (
                postPropertyData.cityId != existingPostProperty.cityId ||
                postPropertyData.districtId != existingPostProperty.districtId
            ) {
                // if city changes
                postPropertyData.address = null;
                // postPropertyData.districtId = null; commented we are receiving districtId in request
                postPropertyData.latitude = null;
                postPropertyData.longitude = null;
            }
            if (
                existingPostProperty?.Property?.statusTypeId ==
                    PropertyErrorCodes.APPROVED ||
                existingPostProperty?.Property?.statusTypeId ==
                    PropertyErrorCodes.REJECTED
            ) {
                await existingPostProperty?.Property?.update({
                    statusTypeId: PropertyErrorCodes.BRE_VERIFICATION,
                });
                await PropertyStatusLog.create({
                    property_id: postData.id,
                    status_type_id: PropertyErrorCodes.BRE_VERIFICATION,
                });
                rabbitMQService.publishToDeleteProperty({
                    environment: process.env.NODE_ENV,
                    propertyId: existingPostProperty?.Property?.id,
                });
            }
            await existingPostProperty?.Property?.PropertyAttribute?.update(
                attributes
            );
            await existingPostProperty.update(postPropertyData);
        } else {
            //put status to draft for newly created post property
            postPropertyData.status = PostPropertyStatus.DRAFT;
            existingPostProperty = await PostProperty.create(postPropertyData);
            if (postData.is_ambassador_app) {
                // creating entry for new listing agent seller if a listing agent adds a seller
                ListingAgentUsers.findOrCreate({
                    where: {
                        sellerId: postData?.userId,
                        userId: postData?.addedBy,
                    },
                });
            }
        }
        return existingPostProperty?.id;
    };

    /**
     * @description get the post-property basic details
     * @param postData {id, userId}
     * @returns post-property data
     */
    getPropertyBasicDetails = async (postData: any) => {
        if (postData?.id) {
            return await PostProperty.findOne({
                where: {
                    id: postData.id,
                    [Op.or]: [
                        { userId: postData.userId },
                        { subUserId: postData.userId },
                        { addedBy: postData.userId },
                    ],
                },
            });
        } else {
            return await PostProperty.findOne({
                where: {
                    posted: false,
                    [Op.or]: [
                        { userId: postData.userId },
                        { subUserId: postData.userId },
                        { addedBy: postData.userId },
                    ],
                },
                order: [['createdAt', 'desc']],
            });
        }
    };

    // method to get property amenities (selected and all amenities), called from property service
    getPropertyAmenities = async (reqBody: any) => {
        const responseData: any = {
            status: false,
            data: null,
            message: '',
        };

        i18next.changeLanguage(reqBody.locale);
        const validatePostPropertyId: any =
            await this.getPropertyByPostPropertyAndUserId(
                reqBody.id as number,
                reqBody.userId as number
            );

        if (validatePostPropertyId) {
            if (
                validatePostPropertyId.mainTypeId ==
                mainPropertyMapping.commercial.id
            ) {
                reqBody.mainTypeId = mainPropertyMapping.residential.id;
            } else {
                reqBody.mainTypeId = mainPropertyMapping.commercial.id;
            }

            let getAllAmenities: any = await this.getAllAmenities(reqBody);
            getAllAmenities = getAllAmenities.map((amenity: any) => {
                let englishAmenityName: string;
                let arabicAmenityName: string;
                amenity.AmenityTranslations.forEach((amenTran: any) => {
                    if (amenTran.locale == 'en')
                        englishAmenityName = amenTran.name;
                    else arabicAmenityName = amenTran.name;
                });
                return {
                    id: amenity.id,
                    name: {
                        en: englishAmenityName,
                        ar: arabicAmenityName,
                    },
                };
            });

            let selectedAmenities = await this.getSelectedAmenities(
                validatePostPropertyId.id as number
            );

            selectedAmenities = selectedAmenities.map((amenity: any) => {
                return amenity.amenityId;
            });

            let finalData = {
                id: validatePostPropertyId.darReference.slice(
                    validatePostPropertyId.darReference.length - 6
                ),
                selectedAmenities: selectedAmenities,
                amenities: getAllAmenities,
            };
            responseData.status = true;
            responseData.data = finalData;
            responseData.message = i18next.t('SUCCESS');
        } else {
            responseData.message = i18next.t('PROPERTY_AND_USER_NOT_FOUND');
        }
        return responseData;
    };

    getAllAmenities = (reqBody: any) => {
        return Amenity.findAll({
            attributes: ['id'],
            where: {
                is_active: true,
                property_main_type_id: reqBody.mainTypeId,
            },
            include: [
                {
                    model: AmenityTranslation,
                    attributes: ['name', 'locale'],
                },
            ],
        });
    };

    getSelectedAmenities = (propertyId: number) => {
        return AmenityProperty.findAll({
            raw: true,
            where: {
                propertyId: propertyId,
            },
            attributes: ['amenityId'],
        });
    };

    /**
     * Get property amenities counts
     * @param propertyId property id
     * @returns
     */
    getAmenitiesCountByPropertyId = (propertyId: number) => {
        return AmenityProperty.count({
            where: {
                propertyId: propertyId,
            },
        });
    };

    /**
     * @description use to save PropertyVerificationInfo of specific property
     * @param postData {id, userId, idType, idNumber, regaAuthNumber, isWathqVerified}
     * @returns id of post-proeprty
     */
    propertyHolderVerification = async (postData: any) => {
        let existigPostPropertyData = await PostProperty.findOne({
            where: {
                id: postData.id,
                [Op.or]: [
                    { userId: postData.userId },
                    { subUserId: postData.userId },
                    { addedBy: postData.userId },
                ],
            },
            include: [PropertyVerificationInfo, { model: Property }],
        });

        if (!existigPostPropertyData) throw new Error('CANT_FIND_PROPERTY');
        if (postData.validReq) {
            // if it is sell
            if (!postData?.deedNumber) throw new Error('ENTER_TITLE_DEED');
        }

        let verifiedInfoData = {
            identity: postData.idType || null,
            deedNumber: postData?.deedNumber || null,
            identityNumber: postData?.idNumber || null,
            regaAuthNumber: postData?.regaAuthNumber || null,
            wathqVerified: postData?.isWathqVerified || false,
            currentStep: postData?.currentStep || null,
            authDraft: postData?.authDraft || false,
        };
        // save the data in property_verification_info
        let verifiedInfo: PropertyVerificationInfo;
        if (!existigPostPropertyData?.PropertyVerificationInfo) {
            verifiedInfo = await PropertyVerificationInfo.create(
                verifiedInfoData
            );
        } else {
            verifiedInfo =
                await existigPostPropertyData?.PropertyVerificationInfo.update(
                    verifiedInfoData
                );
        }

        existigPostPropertyData.propertyVerificationInfoId = verifiedInfo?.id;
        existigPostPropertyData.realestateDeedId = postData?.realestateDeedId;

        existigPostPropertyData.currentStep = postData?.currentStep;
        await existigPostPropertyData.save();
        // calling rabbitmq event for elastic sync
        if (existigPostPropertyData?.Property?.id && postData.validReq) {
            await existigPostPropertyData?.Property?.update({
                realestateDeedId: postData?.realestateDeedId,
                propertyVerificationInfoId:
                    existigPostPropertyData?.propertyVerificationInfoId,
            });
        } else {
            await existigPostPropertyData?.Property?.update({
                statusTypeId: PropertyErrorCodes.INCOMPLETE,
                propertyVerificationInfoId:
                    existigPostPropertyData?.propertyVerificationInfoId,
            });
            rabbitMQService.publishToDeleteProperty({
                environment: process.env.NODE_ENV,
                propertyId: existigPostPropertyData?.Property?.id,
            });
        }
        return {
            id: existigPostPropertyData?.id,
            isVerified: verifiedInfo?.wathqVerified || false,
        };
    };

    /**
     * @description use to save PropertyVerificationInfo of specific property
     * @param postData {id, userId}
     * @returns PropertyVerificationInfo
     */
    getPropertyHolderVerification = async (postData: any) => {
        let verifiedInfo = await PropertyVerificationInfo.findOne({
            include: [
                {
                    model: PostProperty,
                    attributes: ['id', 'listing_type_id', 'realestateDeedId'],
                    where: {
                        id: postData.id,
                        [Op.or]: [
                            { userId: postData.userId },
                            { subUserId: postData.userId },
                            { addedBy: postData.userId }, //for wasalt pro app
                        ],
                    },
                },
            ],
        });
        //  if (!verifiedInfo) throw new Error("CANT_FIND_PROPERTY");

        return verifiedInfo;
    };

    /**
     * @description use to save Property amenities of specific property
     * @param postData {id, userId, selectedAmenities}
     * @returns post property id
     */
    addPropertyAmenities = async (reqBody: any) => {
        const responseData: addPropertyAmenitiesRes = {
            status: false,
            data: null,
            message: '',
        };

        i18next.changeLanguage(reqBody.locale);
        const validatePostPropertyId: any =
            await this.getPropertyByPostPropertyAndUserId(
                reqBody.id as number,
                reqBody.userId as number
            );
        if (validatePostPropertyId) {
            let mappedAmenitiesData: amenitiesMappedArray[] = [];
            if (reqBody.selectedAmenities.length > 0) {
                await AmenityProperty.destroy({
                    where: { propertyId: validatePostPropertyId.id },
                });

                reqBody.selectedAmenities.forEach((amenity: any) => {
                    let mappedObject = {
                        amenityId: parseInt(amenity),
                        propertyId: parseInt(validatePostPropertyId.id),
                    };
                    mappedAmenitiesData.push(mappedObject);
                });

                await this.addBulkAmenities(mappedAmenitiesData);
                responseData.status = true;
                (responseData.data = {
                    id: reqBody.id,
                    referenceNo: validatePostPropertyId.darReference.slice(
                        validatePostPropertyId.darReference.length - 6
                    ),
                }),
                    (responseData.message = i18next.t('SUCCESS'));
            } else {
                responseData.status = true;
                responseData.message = '';
            }
        } else {
            responseData.message = i18next.t('PROPERTY_AND_USER_NOT_FOUND');
        }
        return responseData;
    };

    addBulkAmenities = (mappedData: amenitiesMappedArray[]) => {
        return AmenityProperty.bulkCreate(mappedData);
    };

    //get property assignee details
    getAssigneeDetails = async (reqBody: any) => {
        const responseData: getAssigneeDetailsRes = {
            status: false,
            data: null,
            message: '',
        };
        i18next.changeLanguage(reqBody.locale);
        const validatePostPropertyId: any =
            await this.getPropertyAndUserDetails(
                reqBody.id as number,
                reqBody.userId as number
            );
        if (validatePostPropertyId) {
            // update status type
            await this.updatePropertyStatus(
                reqBody.id as number,
                reqBody.userId as number
            );
            await PostProperty.update(
                { posted: true, status: 'completed' },
                { where: { id: reqBody.id } }
            );
            await Property.update(
                { successDate: Sequelize.fn('NOW') },
                { where: { post_property_id: reqBody.id } }
            );
            await PropertyStatusLog.create({
                property_id: Number(validatePostPropertyId?.id),
                status_type_id: PropertyErrorCodes.BRE_VERIFICATION,
            });
            // if wathqVerification is done then set true otherwise value of wathqVerified is false.
            const isVerified =
                validatePostPropertyId?.PropertyVerificationInfo
                    ?.wathqVerified || false;

            //if parentId is present then give details of the parentId otherwise give details of the userId present in properties table
            if (validatePostPropertyId.User.parent_id) {
                const parentUserData: any = await this.getParentUser(
                    validatePostPropertyId.User.parent_id as number
                );
                const finalData = {
                    propertyId: validatePostPropertyId.id,
                    assigneeId: validatePostPropertyId.User.parent_id,
                    phoneNumber: parentUserData.phone_number,
                    phoneNumberCountryCode:
                        parentUserData.phone_number_country_code,
                    name: parentUserData.UserInfo.full_name,
                    referenceNo: validatePostPropertyId.darReference.slice(
                        validatePostPropertyId.darReference.length - 6
                    ),
                    isVerified,
                    listingTypeId: validatePostPropertyId.listing_type_id,
                };
                responseData.status = true;
                responseData.data = finalData;
                responseData.message = i18next.t('SUCCESS');
            } else {
                const finalData = {
                    propertyId: validatePostPropertyId.id,
                    assigneeId: validatePostPropertyId.userId,
                    phoneNumber: validatePostPropertyId.User.phone_number,
                    phoneNumberCountryCode:
                        validatePostPropertyId.User.phone_number_country_code,
                    name: validatePostPropertyId.User.UserInfo.full_name,
                    referenceNo: validatePostPropertyId.darReference.slice(
                        validatePostPropertyId.darReference.length - 6
                    ),
                    isVerified,
                    listingTypeId: validatePostPropertyId.listing_type_id,
                };
                responseData.status = true;
                responseData.data = finalData;
                responseData.message = i18next.t('SUCCESS');
            }
        } else {
            responseData.message = i18next.t('PROPERTY_AND_USER_NOT_FOUND');
        }
        return responseData;
    };

    //get property and user's details
    getPropertyAndUserDetails = (postPropertyId: number, userId: number) => {
        return Property.findOne({
            where: {
                postPropertyId: postPropertyId,
                [Op.or]: [
                    { userId: userId },
                    { subuserId: userId },
                    { addedBy: userId },
                ],
            },
            attributes: [
                'id',
                'postPropertyId',
                'userId',
                'darReference',
                'listing_type_id',
            ],
            include: [
                {
                    model: User,
                    include: [UserInfo],
                    attributes: [
                        'parent_id',
                        'phone_number',
                        'phone_number_country_code',
                    ],
                    required: true,
                },
                {
                    model: PropertyVerificationInfo,
                    attributes: ['wathqVerified'],
                    required: false,
                },
            ],
        });
    };

    //get parent user data
    getParentUser = (userId: number) => {
        return User.findOne({
            where: {
                id: userId,
            },
            attributes: [
                'phone_number',
                'phone_number_country_code',
                'id',
                'parent_id',
            ],
            include: {
                model: UserInfo,
                attributes: ['full_name'],
                required: true,
            },
        });
    };

    /**
     * @description use to save property location of specific property in post properties table
     * @param postData {id, userId, lat, long, districtId, address}
     * @returns id of post-proeprty
     */
    savePropertyLocation = async (postData: any) => {
        let locationData = {
            address: postData.address,
            districtId: postData.districtId,
            latitude: postData.lat,
            longitude: postData.long,
            currentStep: postData?.currentStep,
        };

        let [_, existigPostPropertyData] = await PostProperty.update(
            locationData,
            {
                where: {
                    id: postData.id,
                    [Op.or]: [
                        { userId: postData.userId },
                        { subUserId: postData.userId },
                        { addedBy: postData.userId },
                    ],
                },
                returning: true,
            }
        );

        if (!existigPostPropertyData?.length)
            throw new Error('CANT_FIND_PROPERTY');
        return existigPostPropertyData[0].id;
    };

    /**
     * @description use to get property location of specific property from post properties table
     * @param postData {id, userId, lat, long, districtId, address}
     * @returns id of post-proeprty
     */
    getPropertyLocation = async (postData: any) => {
        let existigPostPropertyData = await PostProperty.findOne({
            where: {
                id: postData.id,
                [Op.or]: [
                    { userId: postData.userId },
                    { subUserId: postData.userId },
                    { addedBy: postData.userId },
                ],
            },
        });
        if (!existigPostPropertyData) throw new Error('CANT_FIND_PROPERTY');
        let locationData = {
            address: existigPostPropertyData.address,
            districtId: existigPostPropertyData.districtId,
            lat: existigPostPropertyData.latitude,
            long: existigPostPropertyData.longitude,
            id: existigPostPropertyData.id,
        };

        return locationData;
    };

    /**
     * remove sub user from properties
     * @param subUserId  sub user id
     * @returns property ids
     */
    removeSubUserFromProperties = async (
        subUserId: number
    ): Promise<Number[]> => {
        const properties = await Property.findAll({
            where: { subuser_id: subUserId },
        });
        const propertyIds = properties.map((item) => Number(item.id));
        await Property.update(
            { subuser_id: null },
            {
                where: {
                    id: {
                        [Op.in]: propertyIds,
                    },
                },
            }
        );
        return propertyIds;
    };

    //edit assignee details
    editAssigneeDetails = async (reqBody: any) => {
        const responseData: addPropertyMediaRes = {
            status: false,
            data: null,
            message: '',
        };

        i18next.changeLanguage(reqBody.locale);
        const validateSubUser = await this.getSubUser(
            reqBody.assigneeMobile as string
        );
        if (validateSubUser) {
            responseData.message = i18next.t('SUBUSER_EXISTS');
        } else {
            //making a new subuser in user's table
            const subUser: any = await this.createSubUser(reqBody);

            //making user info for the subuser created
            await this.createSubUserInfo(subUser.id, reqBody.assigneeName);

            //updating subuer_id in properties table
            await this.updatePropertySubUserId(subUser.id, reqBody);

            await sequelize.query(
                `insert into role_user (role_id, user_id) values (${userRoles.customer} , ${subUser.id})`
            );

            responseData.status = true;
            responseData.data = subUser.id;
            responseData.message = i18next.t('SUB_USER_UPDATED_SUCCESS');
        }
        return responseData;
    };

    getSubUser = (phoneNumber: string) => {
        return User.findOne({
            where: {
                phone_number: phoneNumber,
            },
        });
    };

    createSubUser = (reqBody: any) => {
        return User.create({
            parent_id: reqBody.userId,
            phone_number: reqBody.assigneeMobile,
            phone_number_country_code: reqBody.assigneeCountryCode,
            is_active: true,
            status: userStatusTypes.ACTIVE,
        });
    };

    createSubUserInfo = (userId: number, name: string) => {
        return UserInfo.create({
            user_id: userId,
            full_name: name,
        });
    };

    updatePropertySubUserId = async (userId: number, reqBody: any) => {
        await PostProperty.update(
            {
                subUserId: userId,
            },
            {
                where: { id: reqBody.id, userId: reqBody.userId },
            }
        );
        return Property.update(
            {
                subuser_id: userId,
            },
            {
                where: {
                    postPropertyId: reqBody.id,
                    userId: reqBody.userId,
                },
            }
        );
    };

    getPostPropertyDetailsById = async (postData: {
        postPropertyId: number;
        locale: string;
    }) => {
        let property: any = await PostProperty.findOne({
            where: { id: postData.postPropertyId },
            include: [
                { model: PropertyVerificationInfo },
                {
                    model: Property,
                    include: [
                        { model: PropertyLocation },
                        { model: PropertyAttribute },
                        { model: PropertyFile },
                        {
                            model: PropertyTranslation,
                            where: { locale: postData.locale || 'ar' },
                        },
                    ],
                },
            ],
        });
        return property;
    };

    //get post property data required for preview screen in wasalt pro
    getPostPropertyPreviewDetailsById = async (postData: {
        propertyId: number;
        locale: string;
    }) => {
        let property: any = await PostProperty.findOne({
            where: { id: postData.propertyId },
            include: [
                { model: PropertyVerificationInfo },
                {
                    model: Property,
                    include: [
                        {
                            model: PropertyLocation,
                            attributes: [
                                'id',
                                'city_id',
                                'zone_id',
                                [
                                    literal(
                                        `(SELECT name FROM city_translations WHERE city_translations.city_id = "Property->PropertyLocation"."city_id" and city_translations.locale='${postData.locale}')`
                                    ),
                                    'cityName',
                                ],
                                [
                                    literal(
                                        `(SELECT name FROM zone_translations WHERE zone_translations.zone_id = "Property->PropertyLocation"."zone_id" and zone_translations.locale='${postData.locale}')`
                                    ),
                                    'zoneName',
                                ],
                            ],
                        },
                        { model: PropertyAttribute },
                        { model: PropertyFile },
                        {
                            model: Amenity,
                            attributes: [
                                'id',
                                'icon',
                                'icon_class',
                                [
                                    literal(
                                        `(SELECT name FROM amenity_translations WHERE amenity_translations.amenity_id = "Property->Amenities"."id"  and amenity_translations.locale='${postData.locale}')`
                                    ),
                                    'amenityName',
                                ],
                            ],
                        },
                        {
                            model: PropertyTranslation,
                            where: { locale: postData.locale },
                        },
                        { model: PropertyVerificationInfo },
                    ],
                },
            ],
        });
        return property;
    };

    // update property status
    updatePropertyStatus = async (PostPropertyId: number, userId: number) => {
        const result: any = await Property.update(
            {
                // update property status
                statusTypeId: PropertyErrorCodes.BRE_VERIFICATION,
            },
            { where: { post_property_id: PostPropertyId } }
        );
        return result;
    };

    /**
     * @description get the post-property basic details
     * @param postData {id,}
     * @returns post-property data
     */
    getPropertyBasicDetailsById = async (postData: any) => {
        if (postData?.id) {
            return await PostProperty.findOne({
                raw: true,
                where: {
                    id: postData.id,
                },
            });
        }
    };

    // get approved date
    getPropertyApprovedDate = async (propertyData: any) => {
        try {
            const result: any = await PropertyStatusLog.findAll({
                where: {
                    property_id: propertyData.id,
                    status_type_id: propertyStatusTypeIds.APPROVED,
                },
                attributes: [[fn('max', col('updated_at')), 'max']],
                raw: true,
            });
            if (result.length > 0) {
                return result[0]?.max;
            }
        } catch (err: any) {
            logger.error(
                `PropertyModel::getPropertyApprovedDate → ${err.message}`
            );
            throw err;
        }
    };

    // check Cr no is available or not
    getCommercialDetail = async (data: any) => {
        return await CommercialRegistrationDetails.findOne({
            where: {
                cr_number: data.CommercialRegistrationNumber,
                is_verified: true,
            },
            raw: true,
        });
    };

    // function used for save and update company name
    saveAndUpdateCompanyName = async (data: any) => {
        // check cr_number is_verified status  in db
        let resultIsVerified: any = await CommercialRegistrationDetails.findOne(
            {
                where: {
                    cr_number: data?.response?.crNumber,
                },
            }
        );
        if (resultIsVerified) {
            // if is_verified status is false then it will update
            if (!resultIsVerified?.is_verified) {
                await CommercialRegistrationDetails.update(
                    {
                        is_verified: true,
                        company_name: data?.response?.crName,
                        issue_date: data?.response?.issueDate,
                        expiry_date: data?.response?.expiryDate,
                    },
                    {
                        where: {
                            cr_number: data?.response?.crNumber,
                        },
                    }
                );
                let result: any = await this.getCommercialDetail({
                    CommercialRegistrationNumber: data?.response?.crNumber,
                });
            }
        } else {
            // if company name is not available in db we will save.
            return await CommercialRegistrationDetails.create({
                cr_number: data?.response?.crNumber,
                is_verified: true,
                company_name: data?.response?.crName,
                created_at: new Date(),
                issue_date: data?.response?.issueDate,
                expiry_date: data?.response?.expiryDate,
            });
        }
    };

    // get user cr no
    getUserCrNoByUserId = async (postData: any) => {
        if (postData?.id) {
            return await UserPostInfo.findOne({
                raw: true,
                where: {
                    user_id: postData.id,
                    identity_number: COMPANY_IDENTITY_NUMBER,
                },
            });
        }
    };

    // get user cr no
    getUserPostInfoByUserId = async (userId: string): Promise<any> => {
        return await UserPostInfo.findOne({
            raw: true,
            where: {
                user_id: userId,
            },
        });
    };

    // check Cr no is available or not
    getCrNoStatus = async (data: any) => {
        return await CommercialRegistrationDetails.findOne({
            where: {
                cr_number: data.CommercialRegistrationNumber,
            },
            raw: true,
        });
    };
    // update company name and return value
    updateCompanyDetail = async (data: any) => {
        await CommercialRegistrationDetails.update(
            { company_name: data?.company_name },
            {
                where: {
                    cr_number: data?.cr_number,
                },
            }
        );
        let result: any = await this.getCrNoStatus({
            CommercialRegistrationNumber: data?.cr_number,
        });
        return result;
    };

    // save company name
    saveCompanyDetail = async (data: any) => {
        return await CommercialRegistrationDetails.create({
            cr_number: data?.cr_number,
            is_verified: false,
            company_name: data?.company_name,
            created_at: new Date(),
        });
    };
    //adding REGA property authorization files
    addPropertyAuthFiles = async (reqBody: any) => {
        // getting property and property verification info
        let propertyData: any =
            await PostPropertyRepo.getPropertyVerificationInfo(
                reqBody.propertyId
            );

        //deleting previous images
        await PropertyFile.destroy({
            where: {
                property_id: reqBody?.propertyId,
                type: propertyFileTypes.REGA,
            },
        });

        let imagesData: any[] = [];
        reqBody.RegaFiles.forEach((name: string) => {
            let propertyFileDataObject = {
                property_id: reqBody?.propertyId,
                type: propertyFileTypes.REGA,
                name: name,
            };
            imagesData.push(propertyFileDataObject);
        });

        //creating seperate row for every image in property_files table
        const createdFiles = await PropertyFile.bulkCreate(imagesData);
        let mappedCreatedFiles: any = [];

        createdFiles.forEach((file: any) => {
            let mappedDataObject = {
                id: file.id,
                name: file.name,
                property_id: reqBody?.propertyId,
                type: file.type,
            };
            mappedCreatedFiles.push(mappedDataObject);
        });
        return mappedCreatedFiles;
    };

    getPropertyVerificationInfo = async (id: string) => {
        return PostProperty.findOne({
            where: { id },
            include: [PropertyVerificationInfo, Property],
        });
    };

    updatePropertyVerificationInfo = async (id: number, data: any) => {
        return PropertyVerificationInfo.update(data, { where: { id } });
    };

    //udpating authorisation type in property
    propertyUpdateAuthType = async (reqBody: any) => {
        await sequelize.query(`update properties set auth_type = ${reqBody.authType} 
  where id = ${reqBody.propertyId}`);
    };

    // getting rega auth details
    getPostPropertyAuthorization = async (data: any) => {
        let response = await PostProperty.findOne({
            where: {
                id: data.id,
            },
            include: [
                {
                    model: Property,
                    include: [
                        {
                            model: PropertyFile,
                            required: false,
                            where: {
                                type: propertyFileTypes.REGA,
                            },
                        },
                    ],
                },
                PropertyVerificationInfo,
            ],
        });
        return response.get({ plain: true });
    };

    getpropertyFiles = async (data: any) => {
        return await PropertyFile.findAll({
            where: {
                property_id: {
                    [Op.in]: data.propertyIds,
                },
                type: 'main',
            },
            raw: true,
            nest: true,
        });
    };

    // get real estate deed details from db
    getRealEstateDeed = (data: any) => {
        return Realestate_deed.findOne({
            where: {
                Deedcode: data.Deedcode,
                OwnerId: data.OwnerId,
                Idtype: data.Idtype,
            },
        });
    };

    createRealEstateDeed = (data: any) => {
        return Realestate_deed.create(data);
    };

    // get deed status from realEstate deed id "isCondtrained","isHalt","isPawned","isTestament"
    getRealEstateDeedById = (id: any) => {
        if (!id) return null;
        return Realestate_deed.findOne({
            attributes: ['isCondtrained', 'isHalt', 'isPawned', 'isTestament'],
            where: {
                id: id,
            },

            raw: true,
        });
    };

    // get deed details from realEstate deed id
    getRealEstateDeedDetailsById = (id: any) => {
        if (!id) return null;
        return Realestate_deed.findOne({
            where: {
                id: id,
            },

            raw: true,
        });
    };

    saveAndDeleteStreetDerails = async (data: any, id: any) => {
        //first delete street details and save again ;
        let saveData;
        await StreetInfo.destroy({ where: { propertyId: id } });
        data.map(async (staffPermissionData: any) => {
            saveData = {
                propertyId: id,
                streetWidth: staffPermissionData?.streetWidth || null,
                facingTypeId: staffPermissionData?.facingTypeId || null,
                position: staffPermissionData?.position,
            };
            await StreetInfo.create(saveData);
        });
        return true;
    };

    // save property detail, location , attribute save in table
    saveLongJourneyPropertyV3 = async (postData: any) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };
        const transaction = await sequelize.transaction();
        try {
            let postedProperty: any = await this.getPostedProperty(postData);
            if (postedProperty) {
                // let userParentId:any = await this.getParentUserById(postData.userId)
                let propertyRes: any =
                    this.setSavedLongPropertyResponse(postData);
                const typeMaster = await TypeMaster.findOne({
                    raw: true,
                    where: {
                        type: 'property_source_platform',
                        slug: postData.source,
                    },
                    attributes: ['id'],
                });
                if (typeMaster) {
                    propertyRes.sourcePlatformTypeId = typeMaster.id;
                }
                propertyRes.propertyOwnerId = postData?.propertyOwnerId;

                // managing user/subuser
                propertyRes.userId = postData?.userId;
                propertyRes.subuserId = postData?.subUserId;
                propertyRes.postedAs = postData?.postedAs;
                propertyRes.addedBy = postData?.addedBy || postData?.userId;
                propertyRes.titleDeedNo =
                    postedProperty?.dataValues.titleDeedNo;
                let title = await this.createTitlePostProperty(postData, null);
                propertyRes.darReference = title.darReference;
                // update current-step
                if (postData.currentStep) {
                    await postedProperty.update(
                        { currentStep: postData.currentStep },
                        {
                            transaction: transaction,
                        }
                    );
                }

                let propertyData: any = await Property.create(propertyRes, {
                    transaction: transaction,
                });
                // set property location detail
                let locationRes = await this.setLongPropertyLocationResponse(
                    postData,
                    propertyData.id
                );
                // set property attribute detail
                let attributeRes = await this.setSavedLongPropertyAttributeV3(
                    postData,
                    propertyData.id
                );
                // save property attribute function
                await this.upInsertPropertyAttribute(
                    propertyData.id,
                    attributeRes,
                    transaction
                );

                // Property location save property_location table
                await this.upInsertPropertyLocation(
                    propertyData.id,
                    locationRes,
                    transaction
                );
                let enAddress,
                    arAddress = null;
                if (postData.locale == 'en') {
                    enAddress = postData.address;
                }
                if (postData.locale == 'ar') {
                    arAddress = postData.address;
                }
                let enTransaltion = this.setPropertyTranslationResponse(
                    {
                        locale: 'en',
                        // title: title.enTitle,
                        propertyId: propertyData.id,
                        address: enAddress,
                    },
                    propertyData.id
                );
                let arTransaltion = this.setPropertyTranslationResponse(
                    {
                        locale: 'ar',
                        // title: title.enTitle,
                        propertyId: propertyData.id,
                        address: arAddress,
                    },
                    propertyData.id
                );
                // english transalation save in property transaction table
                await this.upInsertPropertyTranslation(
                    propertyData.id,
                    enTransaltion,
                    transaction
                );
                // arabic transalation save in property transaction table
                await this.upInsertPropertyTranslation(
                    propertyData.id,
                    arTransaltion,
                    transaction
                );
                // let PropertyLocationRes = await PropertyLocation.create(locationRes)
                // save and delete street details
                if (postData?.streetInfo.length > 0) {
                    await this.saveAndDeleteStreetDerails(
                        postData?.streetInfo,
                        propertyData.id
                    );
                }

                await transaction.commit();
                // not getting image file therfore not saving image file.
                // await this.savePostPropertyFiles(
                //   postData.PropertyFiles,
                //   propertyData.id
                // )
                responseData.status = true;
                responseData.property = postData.id;
            } else {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
        } catch (err: any) {
            console.log('error==>saveLongJourneyPropertyV3', err);
            await transaction.rollback();

            responseData.status = false;
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::saveLongJourneyPropertyV3 : ${err.message}`
            );
            throw new Error(
                `${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}:${err.message}`
            );
        }
        return responseData;
    };

    setSavedLongPropertyAttributeV3(postData: any, propertyId: any): any {
        // this will set property features to null, which are getiing saved/updated in next step
        let resetAttributes = postData.propertyTypeChanged
            ? this.setFeaturePropertyAttributeV3({}, propertyId)
            : {};
        const longPropertyAttribute: any = {
            ...resetAttributes,
            propertyId: propertyId || null,
            unitTypeId: postData.unitTypeId || PROPERTY_AREA_UNIT, // property unit count in square,
            builtUpArea: postData.builtUpArea || null,
            carpetArea: postData.carpetArea || null,
            residenceTypeId: postData?.residenceTypeId,
            facingTypeId: null, // postData.facingTypeId  || null,
            noOfStreet: postData.noOfStreets,
            // street1Width: postData.street1Width, // here code comment because as per design
            // street2Width: postData.street2Width,
            // street3Width: postData.street3Width,
            // street4Width: postData.street4Width,
            // streetWidth: Math.max(
            //   ...[
            //     Number(postData.street1Width) || 0,
            //     Number(postData.street2Width) || 0,
            //     Number(postData.street3Width) || 0,
            //     Number(postData.street4Width) || 0,
            //   ]
            // ),
            possessionTypeId: postData.possessionTypeId || null,
            completionYear: postData.buildYear || null,
            currencyTypeId: postData.currencyTypeId || CURRENCY_TYPE_ID,
            salePrice: postData.listingTypeId == 3 ? postData.salePrice : null,
            expectedRent:
                postData.listingTypeId == 4 ? postData.rentalPrice : null,
            rentCycle:
                postData.listingTypeId == 4
                    ? MAINTENANCE_CYCLE_TYPE_YEARLY
                    : null, // It is contantly define and value define in type_master table
            waterMeter: postData.waterMeter,
            electricityMeter: postData.electricityMeter,
        };
        // commented code to reset property feature attributes in db
        // Object.keys(formatedAttributes).forEach(
        //   (key) => !formatedAttributes[key] && delete formatedAttributes[key]
        // )
        (longPropertyAttribute.salePrice =
            postData.listingTypeId == 3 ? postData.salePrice : null),
            (longPropertyAttribute.expectedRent =
                postData.listingTypeId == 4 ? postData.rentalPrice : null),
            (longPropertyAttribute.rentCycle =
                postData.listingTypeId == 4
                    ? MAINTENANCE_CYCLE_TYPE_YEARLY
                    : null); // It is contantly define and value define in type_master table
        // formatedAttributes['streetWidth'] =
        //   formatedAttributes['streetWidth'] ?? null
        return longPropertyAttribute;
    }
    setFeaturePropertyAttributeV3(postData: any, propertyId: any): any {
        //allow value 0 for bedroom, guestroom and livingroom
        const featureAttributes: any = {
            propertyId: propertyId,
            noOfBedrooms:
                postData.Bedroom || postData.Bedroom === 0
                    ? postData.Bedroom
                    : null,
            noOfBathrooms: postData.Bathroom || null,
            noOfGuestrooms:
                postData.GuestRoom || postData.GuestRoom === 0
                    ? postData.GuestRoom
                    : null,
            noOfLivingrooms:
                postData.LivingRoom || postData.LivingRoom === 0
                    ? postData.LivingRoom
                    : null,
            furnishingTypeId: postData.furnishingTypeId || null,
            floorNumber: postData.PropertyFloor || null,
            noOfParkings: postData.TotalCarParking || null,
            noOfFloors: postData.ApartmentTotalFloor || null,
            noOfOffice: postData.noOfOffice || null,
            noOfPalmTrees: postData.noOfPalmTrees || null,
            noOfOpening: postData.noOfOpening || null,
            noOfWaterWells: postData.noOfWaterWells || null,
            landDepth: postData.landDepth || null,
            landLength: postData.landLength || null,
            noOfApartments: postData.noOfApartments || null,
            residenceTypeId: postData.residenceTypeId || null,
        };
        return featureAttributes;
    }

    // update property detail, location , attribute
    updateLongJourneyPropertyV3 = async (
        postData: any,
        updatePropertyData: any
    ) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };
        const transaction = await sequelize.transaction();
        try {
            // this  boolean value is use to reset property features and amenities, which are getiing saved/updated in next step of UI
            postData.propertyTypeChanged =
                updatePropertyData.mainTypeId != postData.mainTypeId ||
                updatePropertyData.propertyTypeId != postData.propertyTypeId;

            let isMainTypeIdChanged =
                updatePropertyData.mainTypeId != postData.mainTypeId;
            let propertyData = {
                property: this.setUpdateLongPropertyResponse(postData),
                // set property attribute
                attribute: this.setSavedLongPropertyAttributeV3(
                    postData,
                    updatePropertyData.id
                ),
                // set property location
                location: this.setLongPropertyLocationResponse(
                    postData,
                    updatePropertyData.id
                ),
            };
            propertyData.property.statusTypeId = PropertyErrorCodes.INCOMPLETE; //incomplete status
            if (
                updatePropertyData.statusTypeId ==
                    PropertyErrorCodes.APPROVED ||
                updatePropertyData.statusTypeId == PropertyErrorCodes.REJECTED
            ) {
                propertyData.property.statusTypeId =
                    PropertyErrorCodes.BRE_APPROVAL;
                rabbitMQService.publishToDeleteProperty({
                    environment: process.env.NODE_ENV,
                    propertyId: updatePropertyData?.id,
                });
            }
            if (postData.propertyTypeChanged) {
                propertyData.property.statusTypeId =
                    PropertyErrorCodes.BRE_VERIFICATION;
                await AmenityProperty.destroy({
                    where: { propertyId: updatePropertyData.id },
                    transaction,
                });
            }
            propertyData.property.propertyOwnerId = postData?.propertyOwnerId;
            propertyData.property.postedAs = postData?.postedAs;
            propertyData.property.titleDeedNo = updatePropertyData?.titleDeedNo;
            if (postData.darReference) {
                delete postData.darReference;
            }

            await updatePropertyData.update(propertyData.property, {
                transaction: transaction,
            });
            // update property attribute
            await this.upInsertPropertyAttribute(
                updatePropertyData.id,
                propertyData.attribute,
                transaction
            );
            // update property location
            await this.upInsertPropertyLocation(
                updatePropertyData.id,
                propertyData.location,
                transaction
            );
            // here we have remove  translation detail because We are providing in V3 version Title edit section
            // save and delete street details
            if (postData?.streetInfo.length > 0) {
                await this.saveAndDeleteStreetDerails(
                    postData?.streetInfo,
                    updatePropertyData.id
                );
            }
            // if mainTypeId will change that time title and desc will be update
            if (isMainTypeIdChanged) {
                this.savePropertyTranslation({
                    propertyId: updatePropertyData.id,
                    en: { description: '', title: '' },
                    ar: { description: '', title: '' },
                });
            }

            await transaction.commit();
            // not getting file
            // await this.savePostPropertyFiles(
            //   postData.PropertyFiles,
            //   updatePropertyData.id
            // )

            responseData.property = postData.id;
            responseData.message = '';
        } catch (err: any) {
            console.log(err.message);
            await transaction.rollback();
            responseData.status = false;
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::updateLongJourneyPropertyV3 : ${err.message}`
            );
            throw new Error(
                `${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}:${err.message}`
            );
        }
        return responseData;
    };

    setPropertyInfoResponseV3(property: any, realEstateResult: any): any {
        property?.StreetInfos?.sort(function (a: any, b: any) {
            var x = a['position'];
            var y = b['position'];
            return x < y ? -1 : x > y ? 1 : 0;
        });
        return {
            regionId: property.PropertyLocation?.stateId,
            cityId: property.PropertyLocation?.cityId,
            mainTypeId: property?.dataValues?.mainTypeId,
            listingTypeId: property?.dataValues?.listingTypeId, // added new key in response as per new figma design
            districtId: property.PropertyLocation?.zoneId,
            landArea: {
                unit: property.PropertyAttribute?.unitTypeId,
                carpetArea: property.PropertyAttribute?.carpetArea,
                builtUpArea: property.PropertyAttribute?.builtUpArea,
            },
            facingId: property.PropertyAttribute?.facingTypeId,
            facingTypeId: property.PropertyAttribute?.facingTypeId,
            possessionTypeId: property.PropertyAttribute?.possessionTypeId,
            street: {
                noOfStreets: property.PropertyAttribute?.noOfStreet,
                street1Width: property.PropertyAttribute?.street1Width,
                street2Width: property.PropertyAttribute?.street2Width,
                street3Width: property.PropertyAttribute?.street3Width,
                street4Width: property.PropertyAttribute?.street4Width,
            },
            salePrice:
                property.listingTypeId == 3
                    ? property.PropertyAttribute?.salePrice
                    : '',
            rentalPrice:
                property.listingTypeId == 4
                    ? property.PropertyAttribute?.expectedRent
                    : '',
            currencyTypeId: property.PropertyAttribute?.currencyTypeId,
            purposeId: property.listingTypeId,
            propertyType: property.mainTypeId,
            residential: property.propertyTypeId,
            propertyTypeId: property.propertyTypeId,
            propertyStatus: property.PropertyAttribute?.possessionTypeId,
            buildYear: property.PropertyAttribute?.completionYear,
            propertyFiles: property.PropertyFiles,
            location: {
                latitude: property.PropertyLocation?.latitude,
                longitude: property.PropertyLocation?.longitude,
                address: property.PropertyTranslations[0]?.dataValues.address,
            },
            waterMeter: property.PropertyAttribute.waterMeter,
            electricityMeter: property.PropertyAttribute.electricityMeter,
            propertyArea: {
                builtUpArea: property.PropertyAttribute?.builtUpArea,
                carpetArea: property.PropertyAttribute?.carpetArea,
                unitTypeId: property.PropertyAttribute?.unitTypeId,
            },
            streetInfo: property?.StreetInfos,
            isCondtrained: realEstateResult?.isCondtrained,
            isHalt: realEstateResult?.isHalt,
            isPawned: realEstateResult?.isPawned,
            isTestament: realEstateResult?.isTestament,
            residenceTypeId: property.PropertyAttribute?.residenceTypeId
                ? true
                : false,
        };
    }
    // Step 3 [Get API] fetch detail from property table for version v4
    getPropertyInfobyIdV3 = async (postData: any) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };

        try {
            let property: any = await Property.findOne({
                where: {
                    [Op.or]: [
                        { userId: postData.userId },
                        { subuserId: postData.userId },
                    ],
                    postPropertyId: postData.propertyId,
                },
                include: [
                    //{ model: PropertyLocation },
                    { model: PropertyAttribute },
                    // { model: PropertyFile },
                    { model: PostProperty },
                    { model: PropertyTypeOption },
                    { model: StreetInfo },
                    {
                        model: PropertyTranslation,
                        where: { locale: postData.locale },
                    },
                    {
                        model: TypeMaster,
                        as: 'propertyFor',
                        include: [
                            {
                                model: TypeMasterTranslation,
                                where: { locale: postData.locale },
                            },
                        ],
                    },
                ],
            });

            if (property) {
                // fetch from realstate data
                const realEstateResult: any = await this.getRealEstateDeedById(
                    property.PostProperty?.realestateDeedId
                );
                let propertyResponse: any = this.setPropertyInfoResponseV3(
                    property,
                    realEstateResult
                );
                responseData.property = propertyResponse;
                responseData.status = true;
                responseData.message = '';
                // return propertyResponse;
            } else {
                let postPropertyResult: any = await PostProperty.findOne({
                    where: {
                        [Op.or]: [
                            { userId: postData.userId },
                            { subUserId: postData.userId },
                        ],
                        id: postData.propertyId,
                    },
                    raw: true,
                });
                // fetch from realstate data
                const realEstateResult: any = await this.getRealEstateDeedById(
                    postPropertyResult?.realestateDeedId
                );
                responseData.message = ''; //`${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                let response: any = {
                    isCondtrained: realEstateResult?.isCondtrained,
                    isHalt: realEstateResult?.isHalt,
                    isPawned: realEstateResult?.isPawned,
                    isTestament: realEstateResult?.isTestament,
                };
                responseData.property = response;
                responseData.status = true;
            }
        } catch (err: any) {
            console.log(err.message);
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::getPropertyInfobyId : ${err.message}`
            );
        }
        return responseData;
    };
    // update property feature detail  for v3
    updateFeatureLongJourneyPropertyV3 = async (
        postData: any,
        propertyId: any
    ) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };
        const transaction = await sequelize.transaction();
        try {
            let propertyData = {
                attribute: this.setFeaturePropertyAttributeV3(
                    postData,
                    propertyId
                ),
                translation: this.setPropertyTranslationResponse(
                    postData,
                    propertyId
                ),
                title: { propertyId, locale: postData.locale },
            };
            await this.upInsertPropertyAttribute(
                propertyId,
                propertyData.attribute,
                transaction
            );
            if (postData.mainTypeId == PropertyType.RESIDENTIAL_TYPE_ID) {
                let title = await generateTitle(postData);

                let enTransaltion = this.setPropertyTranslationResponse(
                    {
                        locale: 'en',
                        title: title.enTitle,
                        propertyId: propertyId,
                    },
                    propertyId
                );
                let arTransaltion = this.setPropertyTranslationResponse(
                    {
                        locale: 'ar',
                        title: title.arTitle,
                        propertyId: propertyId,
                    },
                    propertyId
                );
                await this.upInsertPropertyTranslation(
                    propertyId,
                    enTransaltion,
                    transaction
                );
                await this.upInsertPropertyTranslation(
                    propertyId,
                    arTransaltion,
                    transaction
                );
            }
            // commented against WB2B-1406, will revert once title is finalized

            // if (postData.mainTypeId == PropertyType.RESIDENTIAL_TYPE_ID) {
            //   let title = await generateTitle(postData);
            //   let enTransaltion = this.setPropertyTranslationResponse(
            //     { locale: 'en', title: title.enTitle, propertyId: propertyId },
            //     propertyId
            //     )
            //   let arTransaltion = this.setPropertyTranslationResponse(
            //     { locale: 'ar', title: title.arTitle, propertyId: propertyId },
            //     propertyId
            //     )
            //   await this.upInsertPropertyTranslation(propertyId, enTransaltion, transaction)
            //   await this.upInsertPropertyTranslation(propertyId, arTransaltion, transaction)
            // }
            await transaction.commit();
            responseData.property = propertyId;
        } catch (err: any) {
            await transaction.rollback();
            console.log(
                'PostPropertyRepository::updateFeatureLongJourneyPropertyV3:Catch',
                err.message
            );
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::updateFeatureLongJourneyPropertyV3 : ${err.message}`
            );
            throw new Error(
                `${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}:${err.message}`
            );
        }
        return responseData;
    };
    // get property feature detail  for v3
    getFeaturePropertyInfobyIdV3 = async (postData: any) => {
        let responseData: {
            status: boolean;
            message: string;
            property: Property | null;
        } = {
            status: false,
            message: '',
            property: null,
        };

        try {
            let property: any = await Property.findOne({
                where: {
                    [Op.or]: [
                        { userId: postData.userId },
                        { subuserId: postData.userId },
                        { addedBy: postData.userId }, //for wasalt pro
                    ],
                    postPropertyId: postData.propertyId,
                },
                include: [
                    { model: PropertyAttribute },
                    { model: PropertyTranslation },
                    {
                        model: TypeMaster,
                        as: 'propertyFor',
                        include: [
                            {
                                model: TypeMasterTranslation,
                                where: { locale: postData.locale },
                            },
                        ],
                    },
                ],
            });
            if (property) {
                let propertyResponse: any =
                    this.setPropertyFeatureInfoResponseV3(
                        property,
                        postData.locale
                    );

                responseData.property = propertyResponse;
                responseData.status = true;
                responseData.message = '';
                // return propertyResponse;
            } else {
                responseData.status = false;
                responseData.message = `${PropertyErrorCodes.PROPERTY_NOT_FOUND}`;
            }
        } catch (err: any) {
            console.log(err.message);
            responseData.message = err.message;
            logger.error(
                `PostPropertyRepository::getFeaturePropertyInfobyIdV3 : ${err.message}`
            );
        }

        return responseData;
    };

    setPropertyFeatureInfoResponseV3(property: any, locale: any): any {
        let propertyTraslation = property.PropertyTranslations.find(
            (o: any) => o.locale === locale
        );
        return {
            furnishingTypeId: property.PropertyAttribute.furnishingTypeId,
            propertyArea: {
                builtUpArea: property.PropertyAttribute.builtUpArea,
                carpetArea: property.PropertyAttribute.carpetArea,
                unitTypeId: property.PropertyAttribute.unitTypeId,
            },
            Bedroom: property.PropertyAttribute.noOfBedrooms,
            Bathroom: property.PropertyAttribute.noOfBathrooms,
            LivingRoom: property.PropertyAttribute.noOfLivingrooms,
            GuestRoom: property.PropertyAttribute.noOfGuestrooms,
            TotalCarParking: property.PropertyAttribute.noOfParkings,
            PropertyFloor: property.PropertyAttribute.floorNumber,
            ApartmentTotalFloor: property.PropertyAttribute.noOfFloors,
            description: propertyTraslation.dataValues.description,
            mainTypeId: property.dataValues.mainTypeId,
            propertyTypeId: property.dataValues.propertyTypeId,
            noOfApartments: property.PropertyAttribute.noOfApartments,
            noOfOffice: property.PropertyAttribute.noOfOffice,
            noOfOpening: property.PropertyAttribute.noOfOpening,
            noOfPalmTrees: property.PropertyAttribute.noOfPalmTrees,
            noOfWaterWells: property.PropertyAttribute.noOfWaterWells,
            landDepth: property.PropertyAttribute.landDepth,
            landLength: property.PropertyAttribute.landLength,
            residenceTypeId: property.PropertyAttribute.residenceTypeId,
        };
    }

    /**
     * @description use to save Property amenities of specific property
     * @param postData {id, userId, selectedAmenities}
     * @returns post property id
     */
    addPropertyAmenitiesV3 = async (reqBody: any) => {
        const responseData: addPropertyAmenitiesRes = {
            status: false,
            data: null,
            message: '',
        };

        i18next.changeLanguage(reqBody.locale);
        const validatePostPropertyId: any =
            await this.getPropertyByPostPropertyAndUserId(
                reqBody.id as number,
                reqBody.userId as number
            );
        if (validatePostPropertyId) {
            let mappedAmenitiesData: amenitiesMappedArray[] = [];
            if (reqBody.selectedAmenities.length > 0) {
                await AmenityProperty.destroy({
                    where: { propertyId: validatePostPropertyId.id },
                });

                reqBody.selectedAmenities.forEach((amenity: any) => {
                    let mappedObject = {
                        amenityId: parseInt(amenity),
                        propertyId: parseInt(validatePostPropertyId.id),
                    };
                    mappedAmenitiesData.push(mappedObject);
                });

                await this.addBulkAmenities(mappedAmenitiesData);
                responseData.status = true;
                responseData.data = {
                    id: reqBody.id,
                    referenceNo: validatePostPropertyId.darReference.slice(
                        validatePostPropertyId.darReference.length - 6
                    ),
                };
                // update title and description
                await this.updateTitleAndDescription(
                    validatePostPropertyId,
                    reqBody
                );
                responseData.message = i18next.t('SUCCESS');
            } else {
                // update title and description
                await this.updateTitleAndDescription(
                    validatePostPropertyId,
                    reqBody
                );
                responseData.status = true;
                responseData.data = {
                    id: reqBody.id,
                    referenceNo: validatePostPropertyId.darReference.slice(
                        validatePostPropertyId.darReference.length - 6
                    ),
                };
                responseData.message = i18next.t('SUCCESS');
            }
            if (reqBody?.currentStep) {
                await PostProperty.update(
                    { currentStep: reqBody.currentStep },
                    {
                        where: { id: reqBody.id },
                    }
                );
            }
            responseData.data.propertyId = validatePostPropertyId.id;
        } else {
            responseData.message = i18next.t('PROPERTY_AND_USER_NOT_FOUND');
        }
        return responseData;
    };

    // method to get property amenities (selected and all amenities), called from property service for v3
    getPropertyAmenitiesV3 = async (reqBody: any) => {
        const responseData: any = {
            status: false,
            data: null,
            message: '',
        };

        i18next.changeLanguage(reqBody.locale);
        const validatePostPropertyId: any =
            await this.getPropertyByPostPropertyAndUserId(
                reqBody.id as number,
                reqBody.userId as number
            );

        if (validatePostPropertyId) {
            if (
                validatePostPropertyId.mainTypeId ==
                mainPropertyMapping.commercial.id
            ) {
                reqBody.mainTypeId = mainPropertyMapping.residential.id;
            } else {
                reqBody.mainTypeId = mainPropertyMapping.commercial.id;
            }

            let getAllAmenities: any = await this.getAllAmenities(reqBody);
            getAllAmenities = getAllAmenities.map((amenity: any) => {
                let englishAmenityName: string;
                let arabicAmenityName: string;
                amenity.AmenityTranslations.forEach((amenTran: any) => {
                    if (amenTran.locale == 'en')
                        englishAmenityName = amenTran.name;
                    else arabicAmenityName = amenTran.name;
                });
                return {
                    id: amenity.id,
                    name: {
                        en: englishAmenityName,
                        ar: arabicAmenityName,
                    },
                };
            });

            let selectedAmenities = await this.getSelectedAmenities(
                validatePostPropertyId.id as number
            );

            selectedAmenities = selectedAmenities.map((amenity: any) => {
                return amenity.amenityId;
            });

            let finalData: any = {
                id: validatePostPropertyId.darReference.slice(
                    validatePostPropertyId.darReference.length - 6
                ),
                selectedAmenities: selectedAmenities,
                amenities: getAllAmenities,
                title: '',
                description: '',
            };
            // get title and description
            let propertyTranslationRes = await PropertyTranslation.findOne({
                where: {
                    propertyId: validatePostPropertyId.id,
                    locale: reqBody.locale,
                },
                raw: true,
            });
            finalData.title = propertyTranslationRes?.title;
            finalData.description = propertyTranslationRes?.description;
            finalData.mainTypeId = validatePostPropertyId.mainTypeId;
            responseData.status = true;
            responseData.data = finalData;
            responseData.message = i18next.t('SUCCESS');
        } else {
            responseData.message = i18next.t('PROPERTY_AND_USER_NOT_FOUND');
        }
        return responseData;
    };
    // get property detail by user id for v3
    getPropertyDetailsByUserId = async (userId: number) => {
        let result: any = { postPropertyId: '', currentStep: '' };
        let recentPostPropertyId = null;
        let propertyResult: any = await Property.findOne({
            where: {
                [Op.or]: [{ userId: userId }, { subuserId: userId }],
                statusTypeId: PropertyErrorCodes.INCOMPLETE,
            },
            order: [['created_at', 'DESC']],
            raw: true,
        });
        let postPropertyResult: any = await PostProperty.findOne({
            where: {
                [Op.and]: literal(
                    `((select id from properties where "PostProperty".id = properties.post_property_id limit 1 ) is null)`
                ),
                [Op.or]: [{ userId: userId }, { subUserId: userId }],
            },
            order: [['created_at', 'DESC']],
            raw: true,
        });
        if (propertyResult == null) {
            recentPostPropertyId = postPropertyResult?.id;
        } else if (postPropertyResult == null) {
            recentPostPropertyId = propertyResult?.PostPropertyId;
        } else if (postPropertyResult && postPropertyResult) {
            recentPostPropertyId =
                postPropertyResult?.createdAt > propertyResult?.createdAt
                    ? postPropertyResult?.id
                    : propertyResult?.PostPropertyId;
        }
        if (recentPostPropertyId) {
            let postPropertyResult: any = await PostProperty.findOne({
                where: {
                    id: recentPostPropertyId,
                },
                raw: true,
            });
            result = {
                postPropertyId: recentPostPropertyId,
                currentStep: postPropertyResult?.currentStep,
            };
        }
        return result;
    };

    /**
     * Get post property current step and id
     * @param id post property id.
     * @returns current step and post property id.
     */
    getPostPropertyCurrentStepById = async (id: number) => {
        const result: any = await PostProperty.findOne({
            raw: true,
            where: {
                id: id,
            },
            attributes: ['id', 'current_step'],
        });
        return {
            postPropertyId: result?.id,
            currentStep: result?.current_step,
        };
    };

    getPostPropertyByPostPropertyId = async (id: any) => {
        return await PostProperty.findOne({
            where: { id: id },
        });
    };

    /**
     * @description return users properties and post properties data.
     * @param data data to fetch user properties
     * @param checkUser user
     * @returns user properties
     */
    getUserPropertiesByUserIdV3 = async (data: any, checkUser: any) => {
        try {
            let order: any = ['updatedAt', 'DESC'];
            let where: any = {
                user_id: data.userId,
                postPropertyId: {
                    [Op.not]: null,
                },
            };

            if (data.isVerified != undefined) {
                where['wathq_verified'] = data.isVerified;
            }
            // checking if agent or super user
            if (!data.is_ambassador_app) {
                if (checkUser.parent_id) {
                    where['subuser_id'] = checkUser.id;
                    where['user_id'] = checkUser.parent_id;
                } else if (data.agentId && data.agentId.length > 0) {
                    where['subuser_id'] = data.agentId;
                }
            } else {
                where['added_by'] = data.userId;
            }
            where['status_type_id'] = data.statusTypeIds;
            where['listing_type_id'] = data.listingTypeIds;

            return SellerProperties.findAll({
                raw: true,
                attributes:
                    data.locale == 'en'
                        ? [
                              ...this.enAttr,
                              ['en_full_address', 'fullAddress'],
                              'propId',
                          ]
                        : [
                              ...this.arAttr,
                              ['ar_full_address', 'fullAddress'],
                              'propId',
                          ],
                where: where,
                order: [order],
                limit: data.limit,
                offset: data.offset,
            });
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUserPropertiesByUserIdV3 → ${err.message}`
            );
            throw err;
        }
    };

    getUserPostPropertyStatusCountV3 = async (
        statusTypeIds: PropertyErrorCodes[],
        data: any,
        user: any
    ) => {
        let where: any = {
            user_id: data.userId,
            postPropertyId: {
                [Op.not]: null,
            },
            status_type_id: statusTypeIds,
        };
        try {
            if (user.parent_id) {
                where['subuser_id'] = user.id;
                where['user_id'] = user.parent_id;
            } else if (data.agentId && data.agentId.length > 0) {
                where['subuser_id'] = data.agentId;
            }
            if (data.isVerified != undefined) {
                where['wathq_verified'] = data.isVerified;
            }

            return SellerProperties.findAll({
                raw: true,
                where: where,
                attributes: [
                    'status_type_id',
                    'listing_type_id',
                    [Sequelize.fn('COUNT', 'status_type_id'), 'status_count'],
                ],
                group: ['status_type_id', 'listing_type_id'],
            });
        } catch (err: any) {
            logger.error(
                `PostPropertyV3Repo::getUserPostPropertyStatusCount → ${err.message}`
            );
            throw err;
        }
    };

    getpropertyCount = async (data: any) => {
        return Property.findAll({
            where: {
                id: {
                    [Op.in]: data.propertyIds,
                },
                status_type_id: propertyStatusTypeIds.APPROVED,
            },
            raw: true,
            nest: true,
            attributes: ['id', 'status_type_id'],
        });
    };

    // get property data for generating description
    getPropertyDataForDesc = async (propertyId: string) => {
        let pData: any = await Property.findOne({
            where: {
                id: propertyId,
            },
            include: [
                PropertyAttribute,
                Realestate_deed,
                {
                    model: Amenity,
                    include: [AmenityTranslation],
                },
                {
                    model: PropertyTypes,
                    as: 'propertyType',
                    include: [PropertyTypesTranslation],
                },
                {
                    model: PropertyLocation,
                    include: [
                        { model: City, include: [CityTranslation] },
                        { model: Zone, include: [ZoneTranslation] },
                    ],
                },
                {
                    model: StreetInfo,
                    include: [
                        {
                            model: TypeMaster,
                            as: 'facing',
                            include: [TypeMasterTranslation],
                        },
                    ],
                },
            ],
        });
        pData = pData.get({ plain: true });
        pData.PropertyAttribute.unitType = {
            TypeMasterTranslations: await this.getTypeMasterFromRedis(
                pData.PropertyAttribute.unitTypeId
            ),
        };
        pData.PropertyAttribute.residenceType = {
            TypeMasterTranslations: await this.getTypeMasterFromRedis(
                pData.PropertyAttribute.residenceTypeId
            ),
        };
        pData.PropertyAttribute.furnishingStatus = {
            TypeMasterTranslations: await this.getTypeMasterFromRedis(
                pData.PropertyAttribute.furnishingTypeId
            ),
        };
        pData.PropertyAttribute.currencyType = {
            TypeMasterTranslations: await this.getTypeMasterFromRedis(
                pData.PropertyAttribute.currencyTypeId
            ),
        };
        pData.propertyFor = {
            TypeMasterTranslations: await this.getTypeMasterFromRedis(
                pData.listingTypeId
            ),
        };

        return pData;
    };

    // get data from typemaster by id
    getTypeMasterFromRedis = async (typeMasterId: string) => {
        let typeData = await redisCache.getValue(TYPE_MASTERS_REDIS_KEY);
        if (!typeData) {
            typeData = (await utilityGrpcService.getTypeMasterDataByType([]))
                ?.data;
        } else {
            typeData = JSON.parse(typeData);
        }
        return typeData?.filter((el: any) => el.id == typeMasterId);
    };

    // save property translation en and arabic
    savePropertyTranslation = async (data: {
        propertyId: string;
        en: any;
        ar: any;
    }) => {
        let propertyId: string = data.propertyId;

        data.en.locale = Locale.ENGLISH;
        data.ar.locale = Locale.ARABIC;
        let en = await this.upInsertPropertyTranslation(
            propertyId,
            data.en,
            undefined
        );
        let ar = await this.upInsertPropertyTranslation(
            propertyId,
            data.ar,
            undefined
        );
        return [en, ar];
    };
    // get english or arabic title from database
    getTitle = async (propertyId: string, locale: string) => {
        return PropertyTranslation.findOne({
            where: { propertyId: propertyId, locale: locale },
        });
    };

    // update title and description
    async updateTitleAndDescription(validatePostPropertyId: any, reqBody: any) {
        let propertyTranslationRes = await PropertyTranslation.findAll({
            where: { propertyId: validatePostPropertyId.id },
        });
        if (propertyTranslationRes.length) {
            let res = await PropertyTranslation.update(
                {
                    description: reqBody.description,
                },
                {
                    where: { propertyId: validatePostPropertyId.id },
                }
            );
        } else {
            let enTransaltion = this.setPropertyTranslationResponse(
                {
                    locale: Locale.ENGLISH,
                    description: reqBody.description,
                    propertyId: validatePostPropertyId.id,
                },
                validatePostPropertyId.id
            );
            let arTransaltion = this.setPropertyTranslationResponse(
                {
                    locale: Locale.ARABIC,
                    description: reqBody.description,
                    propertyId: validatePostPropertyId.id,
                },
                validatePostPropertyId.id
            );
            // english transalation save in property translations table
            await this.upInsertPropertyTranslation(
                validatePostPropertyId.id,
                enTransaltion,
                null
            );
            // arabic transalation save in property translations table
            await this.upInsertPropertyTranslation(
                validatePostPropertyId.id,
                arTransaltion,
                null
            );
        }
    }

    /**
     *
     * @param postPropertyId
     * @param userId
     * @returns active property row through post property id and user id
     */
    getActivePropertyByUserId = (postPropertyId: number, userId: number) => {
        return Property.findOne({
            where: {
                postPropertyId: postPropertyId,
                [Op.or]: [{ userId: userId }, { subuser_id: userId }],
                statusTypeId: PropertyErrorCodes.APPROVED, // Only APPROVED Properties
                property_region_id: ENUMS.PROPERTY_REGION_KSA, // only KSA Properties
            },
        });
    };

    // check valid url or not
    isValidImageUrl = (imgurl: any) => /^[a-z][a-z0-9+.-]*:/.test(imgurl);

    /**
     * @description to get propertyCount by userId
     * @param userId
     * @returns returns propertyCount by userId
     */
    getUserPropertiesCount = async (userId: number) => {
        return PostProperty.count({
            where: {
                [Op.or]: [{ userId: userId }, { subUserId: userId }],
            },
        });
    };

    // Get the seller properties count based on status (approved,incomplete,in-review.)
    listingUserPropertyBifurcation = async (data: any) => {
        const locale = data.locale || 'ar';
        try {
            // get the counts of seller properties grouped by property status(approved, incomplete and BRE_VERIFICATION)
            const propertyViewCount: any = await SellerProperties.findAll({
                raw: true,
                where: {
                    user_id: data.userId,
                    postPropertyId: {
                        [Op.not]: null,
                    },
                    status_type_id: [
                        PropertyErrorCodes.APPROVED,
                        PropertyErrorCodes.BRE_VERIFICATION,
                        PropertyErrorCodes.INCOMPLETE,
                    ],
                },
                attributes: [
                    'status_type_id',
                    [Sequelize.fn('COUNT', 'status_type_id'), 'status_count'],
                ],
                group: ['status_type_id'],
            });
            const headers: any = [];
            // Transform the property counts with status type, count and statusId
            headers.push({
                statusTypeId: PropertyErrorCodes.APPROVED,
                statusType: i18next.t(`${PropertyErrorCodes.APPROVED}`, {
                    lng: locale,
                }),
                count:
                    propertyViewCount.find(
                        (countObj: Record<string, any>) =>
                            countObj.status_type_id ==
                            PropertyErrorCodes.APPROVED
                    )?.status_count ?? 0,
                active:
                    data.statusTypeId == PropertyErrorCodes.APPROVED
                        ? true
                        : false,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.BRE_VERIFICATION,
                statusType: i18next.t(
                    `${PropertyErrorCodes.BRE_VERIFICATION}`,
                    { lng: locale }
                ),
                count:
                    propertyViewCount.find(
                        (countObj: Record<string, any>) =>
                            countObj.status_type_id ==
                            PropertyErrorCodes.BRE_VERIFICATION
                    )?.status_count ?? 0,
                active:
                    data.statusTypeId == PropertyErrorCodes.BRE_VERIFICATION
                        ? true
                        : false,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.INCOMPLETE,
                statusType: i18next.t(`${PropertyErrorCodes.INCOMPLETE}`, {
                    lng: locale,
                }),
                count:
                    propertyViewCount.find(
                        (countObj: Record<string, any>) =>
                            countObj.status_type_id ==
                            PropertyErrorCodes.INCOMPLETE
                    )?.status_count ?? 0,
                active:
                    data.statusTypeId == PropertyErrorCodes.INCOMPLETE
                        ? true
                        : false,
            });

            return headers;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUserPostPropertyStatusCount → ${err.message}`
            );
            throw err;
        }
    };

    //destroy old files and their mapping from PropertyFileUser
    destroyFiles = async (data: any) => {
        //get files to be deleted(which previously existed but are not present incoming data i.e fileNames)
        let fileIdsToDelete: any = [];
        data?.existingFiles.forEach((item: any) => {
            if (!data.fileNames.includes(item?.dataValues?.name)) {
                fileIdsToDelete.push(item?.dataValues?.id);
            }
        }, []);

        //destroy property file
        await PropertyFile.destroy({
            where: {
                id: { [Op.in]: fileIdsToDelete },
            },
        });

        //delete its mapping from property_file_user table
        await PropertyFileUser.destroy({
            where: {
                propertyFileId: { [Op.in]: fileIdsToDelete },
            },
        });
        return { fileIdsToDelete };
    };

    //returns array of file object to enter
    serializeFilesToCreate = (data: any) => {
        //from fileNames array filter out those files by name already exist in db
        let filesData: any = [];
        data.fileNames.forEach((fileName: any) => {
            if (
                !data.existingFiles?.find(
                    (file: any) => file?.dataValues?.name == fileName
                )
            ) {
                filesData.push({
                    property_id: data.propertyId,
                    type: propertyFileTypes.MAIN,
                    name: fileName,
                });
            }
        });
        return filesData;
    };

    // UMS Validation to check if user has any open listings
    getUserOpenListingsCount = async (data: any) => {
        let responseData: {
            count: any | null;
        } = {
            count: null,
        };

        try {
            const checkUser: any = await userService.checkUser(data.userId);
            let where: any = {
                added_by: data.userId,
                status_type_id: GroupStatusCodes.GROUP_STATUS_PENDING,
            };

            // Finding total property count
            let propertyCount: any = await PropertyView.count({
                distinct: true,
                where: where,
            });
            responseData.count = propertyCount || 0;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUserOpenListingsCount → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };
}

const PostPropertyRepo = new PostPropertyRepository();
export default PostPropertyRepo;
