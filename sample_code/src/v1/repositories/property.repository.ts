import slugify from 'slugify';
import { PropertyTranslation } from '../../models/propertyTranslation.model';
import { PropertyAttribute } from '../../models/propertyAttribute.model';
import { PropertyLocation } from '../../models/propertyLocation.model';
import { AmenityProperty } from '../../models/amenityProperty.model';
import { PropertyFile } from '../../models/propertyFile.model';
import { User } from '../../models/user.model';
import { UserInfo } from '../../models/userInfo.model';
import { Property } from '../../models/property.model';
import { sequelize } from '../../models/sequelize';
import { Sequelize, Op, fn, literal } from 'sequelize';
import { getOptionTypeName } from '../../util/general';
import { XmlUploadErrors } from '../../models/xmlUploadErrors.model';
import PostPropertyRepo from '../repositories/postProperty.repository';
import { XmlBulkUploadFileSummary } from '../../models/xmlBulkUploadFileSummary.model';
import i18next from 'i18next';

import {
    FilterRequestSingleCodeByGroup,
    PropertyErrorCodes,
    PropertyFindFor,
    PropertyType,
    UserStatus,
    GROUP_STATUS_PENDING,
    InternalReviewStatusSlugEnum,
    AgentRoleIdEnums,
    MessageEntityTypes,
    InternalReviewEntityTypes,
} from '../../util/enums';
import logger from '../../util/logger';
import { TypeMaster } from '../../models/typeMaster.model';
import { PropertyTypes } from '../../models/propertyTypes.model';
import { StaffAssignedProperty } from '../../models/staffAssignedProperty.model';
import { StaffPermission } from '../../models/staffPermission.model';
import { TypeMasterTranslation } from '../../models/typeMasterTranslation.model';
import { PropertyTypeOption } from '../../models/propertyTypeOptions.model';
import { PropertyTypeOptionTranslation } from '../../models/propertyTypeOptionTranslations.model';
import { Project } from '../../models/project.model';
import { ProjectTranslation } from '../../models/projectTranslations.model';
import { Country } from '../../models/country.model';
import { CountryTranslation } from '../../models/countryTranslations.model';
import { City } from '../../models/city.model';
import { CityTranslation } from '../../models/cityTranslations.model';
import { ZoneTranslation } from '../../models/zoneTranslations.model';
import { Zone } from '../../models/zone.model';
import { Developer } from '../../models/developer.model';
import { PropertyView } from '../../models/propertyView.model';
import { Amenity } from '../../models/amenity.model';
import { DeveloperTranslation } from '../../models/developerTranslation.model';
import { v4 as uuidv4 } from 'uuid';
import { AgentOwnershipTranferHistory } from '../../models/agentOwnershipTranferHistory';
import { AgentUserPermission } from '../../models/agentUserPermission.model';
import { PropertyStatusLog } from '../../models/propertyStatusLog.model';
import { where } from 'sequelize';
import { Currency } from '../../models/currency.model';
import { cloneDeep, get } from 'lodash';
import {
    CITY_ID,
    countryAliases,
    PROPERTY_DISABLED_MINUTES,
    PROPERTY_TYPES,
} from '../../util/constant';
import PropertyServiceHelper from '../../util/PropertyServiceHelper';
import { userService } from '../../services/user.service';
import {
    propertyAttributes,
    propertyDetailsAttributes,
} from '../../util/static';
import { InternalTeamReview } from '../../models/internalTeamReviews.model';
import { SellerProperties } from '../../models/sellerProperties.model';
import { StreetInfo } from '../../models/streetInfo.model';

class PropertyRepository {
    private enAttr: any = [
        'id',
        ['en_title', 'title'],
        'slug',
        ['en_property_status_type', 'propertyStatusType'],
        ['en_property_source_type', 'sourceType'],
        ['en_property_main_type', 'propertyMainType'], //change source column name
        ['en_property_type', 'propertyType'], //newly added
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
    ];
    private enAttrDetails: any = [
        ...this.enAttr,
        ['owner_phone_number', 'phoneNumber'],
        ['phone_number_country_code', 'phoneNumberCountryCode'],
        ['en_furnishing_type', 'furnishingType'],
        ['en_possession_type', 'possessionType'],
        ['en_address', 'address'],
        'latitude',
        'longitude',
        ['en_managed_by', 'managedBy'],
        ['no_of_livingrooms', 'noOfLivingrooms'],
        ['no_of_livingrooms', 'noOfGuestrooms'],
        ['authorization_number', 'authorizationNumber'],
        ['wasalt_rega_advertiser_id', 'wasaltRegaAdvertiserId'],
        ['en_description', 'description'],
        ['land_length', 'landLength'],
        ['land_depth', 'landDepth'],
        ['electricity_meter', 'electricityMeter'],
        ['water_meter', 'waterMeter'],
        ['no_of_palm_trees', 'noOfPalmTrees'],
        ['no_of_water_wells', 'noOfWaterWells'],
        ['no_of_parkings', 'noOfParkings'],
        ['no_of_opening', 'noOfOpening'],
        ['no_of_floors', 'noOfFloors'],
        ['floor_number', 'floorNumber'],
        ['en_residence_type', 'residenceType'],
        ['en_zone', 'district'],
        ['is_halt', 'isHalt'],
        ['is_condtrained', 'isCondtrained'],
    ];
    private arAttr: any = [
        'id',
        ['ar_title', 'title'],
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
    ];
    private arAttrDetails: any = [
        ...this.arAttr,
        ['owner_phone_number', 'phoneNumber'],
        ['phone_number_country_code', 'phoneNumberCountryCode'],
        ['ar_furnishing_type', 'furnishingType'],
        ['ar_possession_type', 'possessionType'],
        ['ar_address', 'address'],
        'latitude',
        'longitude',
        ['ar_managed_by', 'managedBy'],
        ['no_of_livingrooms', 'noOfLivingrooms'],
        ['no_of_livingrooms', 'noOfGuestrooms'],
        ['authorization_number', 'authorizationNumber'],
        ['wasalt_rega_advertiser_id', 'wasaltRegaAdvertiserId'],
        ['ar_description', 'description'],
        ['land_length', 'landLength'],
        ['land_depth', 'landDepth'],
        ['electricity_meter', 'electricityMeter'],
        ['water_meter', 'waterMeter'],
        ['no_of_palm_trees', 'noOfPalmTrees'],
        ['no_of_water_wells', 'noOfWaterWells'],
        ['no_of_parkings', 'noOfParkings'],
        ['no_of_opening', 'noOfOpening'],
        ['no_of_floors', 'noOfFloors'],
        ['floor_number', 'floorNumber'],
        ['ar_residence_type', 'residenceType'],
        ['ar_zone', 'district'],
    ];

    setPropertyStatus = async (
        userId: number,
        propertyRegionId: Number,
        files: any,
        sourceTypeId: any
    ) => {
        try {
            let statusTypeId;
            const userData: any = await User.findOne({
                raw: true,
                subQuery: false,

                where: {
                    id: userId,
                },
                include: [
                    {
                        model: User,
                        as: 'parentUser',
                    },
                ],
            });
            // if (sourceTypeId == PropertyErrorCodes.XML_SOURCE_ID) {
            //   return PropertyErrorCodes.BRE_APPROVAL;
            // }
            if (
                userData &&
                (userData.isPropertyFieldsRequired ||
                    (userData.parentUser &&
                        userData.parentUser.isPropertyFieldsRequired))
            ) {
                if (files && files.images && files.images.length > 0) {
                    statusTypeId = PropertyErrorCodes.BRE_APPROVAL;
                } else {
                    statusTypeId = PropertyErrorCodes.MISSING;
                }
            } else {
                if (propertyRegionId == PropertyErrorCodes.REGION_ID) {
                    statusTypeId = PropertyErrorCodes.BRE_VERIFICATION;
                } else {
                    if (files && files.images && files.images.length > 0) {
                        statusTypeId = PropertyErrorCodes.BRE_APPROVAL;
                    } else {
                        statusTypeId = PropertyErrorCodes.MISSING;
                    }
                }
            }
            return statusTypeId;
        } catch (e: any) {
            logger.error(
                `PropertyRepository::setPropertyStatus : ${e.message}`
            );
            throw e;
        }
    };

    // return property attributes with unit and their respective icons for property details screen.
    setPropertyDetailsAttributeResponse = (data: any = {}, locale: string) => {
        let attributes: any = [];
        propertyDetailsAttributes.forEach((attribute) => {
            // check if studio apartment then bedroom should display in attributes even value 0 otherwise do not display.
            const isStudioApartmentBedRoom =
                data.propertyType === 'Apartment' &&
                attribute.key == 'noOfBedrooms' &&
                data[attribute.key] == 0;
            if (isStudioApartmentBedRoom || data[attribute.key]) {
                let newData = {
                    key: attribute.key,
                    name: i18next.t(attribute.key, { lng: locale }),
                    value: data[attribute.key],
                    image: attribute.image,
                    unit: data[attribute.unitKey] || '',
                    iconClass: attribute.iconClass,
                };
                if (attribute.key == 'completionYear' && data[attribute.key]) {
                    newData.value =
                        new Date().getFullYear() - data[attribute.key];
                    if (
                        !newData.value ||
                        newData.value == NaN ||
                        newData.value < 0
                    )
                        newData.value = 0;
                    newData.unit = i18next.t(attribute.unitKey, {
                        lng: locale,
                    });
                }
                attributes.push(newData);
            } else {
                let newData = {
                    key: attribute.key || '',
                    name: i18next.t(attribute.key, { lng: locale }) || '',
                    value: data[attribute.key] || '',
                    image: attribute.image || '',
                    unit: data[attribute.unitKey] || '',
                    iconClass: attribute.iconClass,
                };
                attributes.push(newData);
            }
        });
        return attributes;
    };

    /**
     * @description it is used for get parent user id
     */
    getParentUserId = async (userId: number) => {
        try {
            const userData = await User.findOne({
                attributes: ['parent_id'],
                where: {
                    id: userId,
                },
            });
            return userData;
        } catch (err: any) {
            throw err;
        }
    };
    /**
     * Save the Property general information in the Database
     *
     */
    saveProperty = async (postData: any) => {
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
        let propertyData: any = [];
        try {
            if (typeof postData.generalInfo.developerId == 'undefined') {
                postData.generalInfo.developerId = null;
            }
            if (typeof postData.generalInfo.projectId == 'undefined') {
                postData.generalInfo.projectId = null;
            }
            if (
                postData.generalInfo.other &&
                postData.generalInfo.other.sourceTypeId
            ) {
                postData.generalInfo.sourceTypeId =
                    postData.generalInfo.other.sourceTypeId;
            } else {
                postData.generalInfo.sourceTypeId =
                    PropertyErrorCodes.SOURCE_MANUAL_TYPE_ID;
            }
            postData.generalInfo.statusTypeId = await this.setPropertyStatus(
                postData.generalInfo.userId,
                postData.generalInfo.propertyRegionId,
                postData.file,
                postData.generalInfo.sourceTypeId
            );

            if (
                !postData.generalInfo.developerId &&
                postData.translation.en.developerName &&
                postData.translation.en.developerName != ''
            ) {
                const savedDeveloper: any = await this.createDeveloper(
                    postData.translation,
                    transaction
                );
                postData.generalInfo.developerId = savedDeveloper.id;
            }

            let developerId = null;
            if (
                postData.generalInfo.developerId &&
                postData.generalInfo.developerId != 0
            ) {
                developerId = postData.generalInfo.developerId;
            }
            if (
                !postData.generalInfo.projectId &&
                postData.translation.en.projectName &&
                postData.translation.en.projectName !== ''
            ) {
                const savedProject: any = await this.createProject(
                    postData.translation,
                    developerId,
                    transaction
                );
                postData.generalInfo.projectId = savedProject.id;
            }
            if (postData.generalInfo.projectId == 0) {
                postData.generalInfo.projectId = null;
            }

            let title = await this.createTitle(postData, null);
            postData.translation.en.title = title.enTitle.replace(/\s+/g, ' ');
            postData.translation.ar.title = title.arTitle.replace(/\s+/g, ' ');

            postData.generalInfo.darReference = title.darReference;

            postData.generalInfo.addedBy = postData.generalInfo.userId
                ? postData.generalInfo.userId
                : null;
            const parentData: any = await this.getParentUserId(
                postData.generalInfo.userId
            );
            postData.generalInfo.addedBy =
                parentData && parentData.parent_id
                    ? parentData.parent_id
                    : postData.generalInfo.userId;
            postData.generalInfo.external_360_link = postData.generalInfo.other
                ? postData.generalInfo.other.external360Link
                : null;
            postData.generalInfo.external_video_link = postData.generalInfo
                .other
                ? postData.generalInfo.other.externalVideoLink
                : null;
            postData.generalInfo.isWhatsappLater = postData.generalInfo.other
                ? postData.generalInfo.other.isWhatsappLater || false
                : false;
            postData.generalInfo.isAlreadyLeased = postData.attribute.area
                ? postData.attribute.area.isAlreadyLeased
                : false;
            postData.generalInfo.unitReference = postData.generalInfo.other
                ? postData.generalInfo.other.unitReference
                : null;

            if (postData.id) {
                let propertyData: any = await Property.findOne({
                    where: { id: postData.id },
                    include: [
                        { model: PropertyTranslation, order: ['id', 'ASC'] },
                        { model: PropertyAttribute },
                        { model: PropertyLocation },
                    ],
                });
                if (
                    postData.generalInfo.darReference ==
                    propertyData.darReference
                ) {
                    delete postData.generalInfo.darReference;
                }
                await propertyData.update(postData.generalInfo, {
                    transaction: transaction,
                });
            } else {
                const slug = await this.createSlug(
                    postData.translation.en.title
                );
                postData.generalInfo.slug = slug;
                propertyData = await Property.create(postData.generalInfo, {
                    transaction: transaction,
                });
            }

            if (propertyData) {
                await this.savePropertyTranslation(
                    postData,
                    propertyData,
                    transaction
                );
                await this.savePropertyAttributes(
                    postData,
                    propertyData,
                    transaction
                );
                await this.savePropertyLocation(
                    postData,
                    propertyData,
                    transaction
                );
                if (postData.amenity && postData.amenity.length > 0) {
                    await this.savePropertyAmenity(
                        postData.amenity,
                        propertyData,
                        transaction
                    );
                }
                if (postData.file) {
                    await this.savePropertyFiles(
                        postData.file,
                        propertyData,
                        transaction
                    );
                }
                await transaction.commit();
                if (propertyData) {
                    await this.savePropertyStatusLog(
                        propertyData,
                        postData.generalInfo.statusTypeId
                    );
                    // await this.createFinalTitle(propertyData.id);

                    let propertyResponse: any =
                        await this.setAddPropertyResponse(
                            propertyData.id,
                            postData.locale
                        );

                    responseData.status = true;
                    responseData.property = propertyResponse;
                }
            }
        } catch (err: any) {
            logger.error(`PropertyRepository::saveProperty → ${err.message}`);
            await transaction.rollback();
            if (
                err.errors &&
                typeof err.errors[0].path != 'undefined' &&
                (err.errors[0].path == 'user_id' ||
                    err.errors[0].path == 'unit_reference') &&
                typeof err.errors[0].message
            ) {
                throw new Error(
                    `${PropertyErrorCodes.UNIT_REFERENCE_ALREADY_EXISTS}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            } else if (
                err.errors &&
                typeof err.errors[0].path != 'undefined' &&
                err.errors[0].path == 'slug' &&
                typeof err.errors[0].message
            ) {
                throw new Error(
                    `${PropertyErrorCodes.SLUG_ALREADY_EXISTS}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            } else {
                throw err;
            }
        }
        return responseData;
    };

    createFinalTitle = async (propertyId: any) => {
        try {
            let propertyData: any = await Property.findOne({
                where: { id: propertyId },
                include: [
                    { model: PropertyTranslation, order: ['id', 'ASC'] },
                    { model: PropertyAttribute },
                    { model: PropertyLocation },
                ],
            });
            let purposeName: any = await TypeMaster.findOne({
                attributes: ['code'],
                where: { id: propertyData.listingTypeId },
                include: [
                    {
                        model: TypeMasterTranslation,
                        attributes: ['name', 'locale'],
                    },
                ],
            });
            let enPurpose = purposeName.TypeMasterTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let arPurpose = purposeName.TypeMasterTranslations.find(
                (o: any) => o.locale === 'ar'
            );

            let enUnitTypeName: any = {},
                arUnitTypeName: any = {};

            if (
                propertyData.PropertyAttribute.unitTypeId &&
                propertyData.PropertyAttribute.unitTypeId != ''
            ) {
                let unitTypeName: any = await TypeMaster.findOne({
                    attributes: ['id'],
                    where: { id: propertyData.PropertyAttribute.unitTypeId },
                    include: [
                        {
                            model: TypeMasterTranslation,
                            attributes: ['name', 'locale'],
                        },
                    ],
                });
                enUnitTypeName = unitTypeName.TypeMasterTranslations.find(
                    (o: any) => o.locale === 'en'
                );
                arUnitTypeName = unitTypeName.TypeMasterTranslations.find(
                    (o: any) => o.locale === 'ar'
                );
            }
            let optionName: any = await PropertyTypeOption.findOne({
                where: { id: propertyData.optionTypeId },
                attributes: ['code'],
                include: [
                    {
                        model: PropertyTypeOptionTranslation,
                        attributes: ['name', 'locale'],
                    },
                ],
            });

            let enOption = optionName.PropertyTypeOptionTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let arOption = optionName.PropertyTypeOptionTranslations.find(
                (o: any) => o.locale === 'ar'
            );
            let enProjectName: any = {};
            let arProjectName: any = {};

            if (
                propertyData.projectId &&
                propertyData.projectId != 0 &&
                propertyData.projectId != ''
            ) {
                let projectName: any = await Project.findOne({
                    where: { id: propertyData.projectId },
                    attributes: ['id'],
                    include: [
                        {
                            model: ProjectTranslation,
                            attributes: ['name', 'locale'],
                        },
                    ],
                });
                enProjectName = await projectName.ProjectTranslations.find(
                    (o: any) => o.locale === 'en'
                );
                arProjectName = await projectName.ProjectTranslations.find(
                    (o: any) => o.locale === 'ar'
                );
            }
            let countryName: any = await Country.findOne({
                attributes: ['id'],
                where: { id: propertyData.PropertyLocation.countryId },
                include: [
                    {
                        model: CountryTranslation,
                        attributes: ['name', 'locale'],
                    },
                ],
            });
            let enCountryName = countryName.CountryTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let arCountryName = countryName.CountryTranslations.find(
                (o: any) => o.locale === 'ar'
            );
            let cityName: any = await City.findOne({
                attributes: ['id'],
                where: { id: propertyData.PropertyLocation.cityId },
                include: [
                    { model: CityTranslation, attributes: ['name', 'locale'] },
                ],
            });
            let enCityName = cityName.CityTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let arCityName = cityName.CityTranslations.find(
                (o: any) => o.locale === 'ar'
            );
            let zoneName: any = await Zone.findOne({
                attributes: ['id'],
                where: { id: propertyData.PropertyLocation.zoneId },
                include: [
                    { model: ZoneTranslation, attributes: ['name', 'locale'] },
                ],
            });
            let enZoneName = zoneName.ZoneTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let arZoneName = zoneName.ZoneTranslations.find(
                (o: any) => o.locale === 'ar'
            );
            if (
                propertyData.PropertyAttribute &&
                propertyData.PropertyAttribute.noOfBedrooms
            ) {
            }
            let propertyTypeSlug: any = await PropertyTypes.findOne({
                attributes: ['slug'],
                where: { id: propertyData.propertyTypeId },
            });
            let bedroom = `${
                propertyData.mainTypeId == PropertyType.mainTypeId &&
                propertyTypeSlug.slug != 'private-island' &&
                propertyTypeSlug.slug != 'residential-land'
                    ? propertyData.PropertyAttribute.noOfBedrooms +
                      ' Bedroom(s)'
                    : propertyData.PropertyAttribute.builtUpArea
                    ? propertyData.PropertyAttribute.builtUpArea +
                      ' ' +
                      enUnitTypeName.name
                    : ''
            } `;
            let propertyTitle: any = {};
            propertyTitle.enTitle = `${enOption.name} ${bedroom} 
       for ${enPurpose.name} in ${
                enProjectName.name ? enProjectName.name + ',' : ''
            } ${enZoneName.name}, ${enCityName.name}, ${enCountryName.name}`;
            propertyTitle.arTitle = `${arOption.name} ${bedroom} 
       for ${arPurpose.name} in ${
                arProjectName.name ? arProjectName.name + ',' : ''
            } ${arZoneName.name}, ${arCityName.name}, ${arCountryName.name}`;

            let en = propertyData.PropertyTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let ar = propertyData.PropertyTranslations.find(
                (o: any) => o.locale === 'ar'
            );

            await en.update({
                title: propertyTitle.enTitle,
            });
            await ar.update({
                title: propertyTitle.enTitle,
            });
            return propertyTitle;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::createFinalTitle → ${err.message}`
            );
            throw err;
        }
    };
    /**
     * Save the Property translation in the Database
     * @route POST /add
     */
    savePropertyTranslation = async (
        postData: any,
        property: any,
        tans: any
    ) => {
        try {
            postData.translation.en['locale'] = 'en';
            postData.translation.ar['locale'] = 'ar';
            postData.translation.en['slug'] = postData.generalInfo.slug;
            postData.translation.ar['slug'] = postData.generalInfo.slug;

            if (postData.id) {
                let en = property.PropertyTranslations.find(
                    (o: any) => o.locale === 'en'
                );
                let ar = property.PropertyTranslations.find(
                    (o: any) => o.locale === 'ar'
                );

                await en.update(postData.translation.en, { transaction: tans });
                await ar.update(postData.translation.ar, { transaction: tans });
            } else {
                await property.createPropertyTranslation(
                    postData.translation.en,
                    {
                        transaction: tans,
                    }
                );
                await property.createPropertyTranslation(
                    postData.translation.ar,
                    {
                        transaction: tans,
                    }
                );
            }

            return true;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::savePropertyTranslation → ${err.message}`
            );
            throw err;
        }
    };

    /**
     * Save the Property attributes in the Database
     * @route POST /add
     */
    savePropertyAttributes = async (
        postData: any,
        property: any,
        tans: any
    ) => {
        try {
            let propertyTypeSlug: any = await PropertyTypes.findOne({
                attributes: ['slug'],
                where: { id: postData.generalInfo.propertyTypeId },
            });

            postData.attribute.noOfBedrooms =
                postData.attribute.general &&
                postData.attribute.general.noOfBedrooms != null &&
                postData.generalInfo.mainTypeId ==
                    PropertyType.RESIDENTIAL_TYPE_ID &&
                propertyTypeSlug.slug != 'private-island' &&
                propertyTypeSlug.slug != 'residential-land'
                    ? postData.attribute.general.noOfBedrooms
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.noOfBedrooms
                    : null;

            postData.attribute.noOfBathrooms =
                postData.attribute.general &&
                postData.attribute.general.noOfBathrooms != null &&
                postData.generalInfo.mainTypeId == PropertyType.mainTypeId &&
                propertyTypeSlug.slug != 'private-island' &&
                propertyTypeSlug.slug != 'residential-land'
                    ? postData.attribute.general.noOfBathrooms
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.noOfBathrooms
                    : null;

            if (
                postData.generalInfo.mainTypeId ==
                    PropertyType.RESIDENTIAL_TYPE_ID &&
                (propertyTypeSlug.slug == 'private-island' ||
                    propertyTypeSlug.slug == 'residential-land')
            ) {
                postData.attribute.noOfBedrooms = null;
                postData.attribute.noOfBathrooms = null;
            }
            postData.attribute.noOfFloors =
                postData.attribute.general &&
                postData.attribute.general.noOfFloors != null
                    ? postData.attribute.general.noOfFloors
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.noOfFloors
                    : null;

            postData.attribute.floorNumber =
                postData.attribute.general &&
                postData.attribute.general.floorNumber != null
                    ? postData.attribute.general.floorNumber
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.floorNumber
                    : null;
            postData.attribute.noOfRetailOutlets =
                postData.attribute.general &&
                postData.attribute.general.noOfRetailOutlets != null
                    ? postData.attribute.general.noOfRetailOutlets
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.noOfRetailOutlets
                    : null;
            postData.attribute.noOfApartments =
                postData.attribute.general &&
                postData.attribute.general.noOfApartments != null
                    ? postData.attribute.general.noOfApartments
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.noOfApartments
                    : null;
            postData.attribute.noOfWaterWells =
                postData.attribute.general &&
                postData.attribute.general.noOfWaterWells != null
                    ? postData.attribute.general.noOfWaterWells
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.noOfWaterWells
                    : null;
            postData.attribute.noOfPalmTrees =
                postData.attribute.general &&
                postData.attribute.general.noOfPalmTrees != null
                    ? postData.attribute.general.noOfPalmTrees
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.noOfPalmTrees
                    : null;
            postData.attribute.noOfParkings =
                postData.attribute.general &&
                postData.attribute.general.noOfParkings != null
                    ? postData.attribute.general.noOfParkings
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.noOfParkings
                    : null;
            postData.attribute.facingTypeId =
                postData.attribute.type &&
                postData.attribute.type.facingTypeId != null
                    ? postData.attribute.type.facingTypeId
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.facingTypeId
                    : null;
            postData.attribute.furnishingTypeId =
                postData.attribute.type &&
                postData.attribute.type.furnishingTypeId != null
                    ? postData.attribute.type.furnishingTypeId
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.furnishingTypeId
                    : null;
            postData.attribute.possessionTypeId =
                postData.attribute.type &&
                postData.attribute.type.possessionTypeId != null
                    ? postData.attribute.type.possessionTypeId
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.possessionTypeId
                    : null;
            postData.attribute.possessionDate =
                postData.attribute.type &&
                postData.attribute.type.possessionDate != null
                    ? postData.attribute.type.possessionDate
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.possessionDate
                    : null;
            postData.attribute.unitTypeId =
                postData.attribute.area &&
                postData.attribute.area.unitTypeId != null
                    ? postData.attribute.area.unitTypeId
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.unitTypeId
                    : null;
            postData.attribute.builtUpArea =
                postData.attribute.area &&
                postData.attribute.area.builtUpArea != null
                    ? postData.attribute.area.builtUpArea
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.unitTypeId
                    : null;
            postData.attribute.carpetArea =
                postData.attribute.area &&
                postData.attribute.area.carpetArea != null
                    ? postData.attribute.area.carpetArea
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.carpetArea
                    : null;
            postData.attribute.completionYear =
                postData.attribute.area &&
                postData.attribute.area.completionYear != null &&
                postData.attribute.area.completionYear != 0
                    ? postData.attribute.area.completionYear
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.completionYear
                    : null;
            postData.attribute.streetWidth =
                postData.attribute.general &&
                postData.attribute.general.streetWidth != null
                    ? postData.attribute.general.streetWidth
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.streetWidth
                    : null;
            postData.attribute.leaseAmount =
                postData.attribute.area &&
                postData.attribute.area.leaseAmount != null
                    ? postData.attribute.area.leaseAmount
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.leaseAmount
                    : null;
            postData.attribute.leaseContractEndDate =
                postData.attribute.area &&
                postData.attribute.area.leaseContractEndDate != null
                    ? postData.attribute.area.leaseContractEndDate
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.leaseContractEndDate
                    : null;

            postData.attribute.campCapacity =
                postData.attribute.area &&
                postData.attribute.area.campCapacity != null
                    ? postData.attribute.area.campCapacity
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.campCapacity
                    : null;
            postData.attribute.currencyTypeId =
                postData.attribute.price &&
                postData.attribute.price.currencyTypeId != null
                    ? postData.attribute.price.currencyTypeId
                    : property && property.PropertyAttribute
                    ? PropertyErrorCodes.CURRENCY_TYPE_ID
                    : null;
            postData.attribute.salePrice =
                postData.attribute.price &&
                postData.attribute.price.salePrice != null
                    ? postData.attribute.price.salePrice
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.salePrice
                    : null;
            postData.attribute.expectedRent =
                postData.attribute.price &&
                postData.attribute.price.expectedRent != null
                    ? postData.attribute.price.expectedRent
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.expectedRent
                    : null;
            postData.attribute.yearlyCharges =
                postData.attribute.price &&
                postData.attribute.price.yearlyCharges != null
                    ? postData.attribute.price.yearlyCharges
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.yearlyCharges
                    : null;
            postData.attribute.rentCycle =
                postData.attribute.price &&
                postData.attribute.price.expectedRent != null
                    ? PropertyErrorCodes.RENT_CYCLE
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.rentCycle
                    : null;
            postData.attribute.monthlyChargeRange =
                postData.attribute.price &&
                postData.attribute.price.monthlyChargeRange != null
                    ? postData.attribute.price.monthlyChargeRange
                    : null;
            postData.attribute.securityDepositAmount =
                postData.attribute.price &&
                postData.attribute.price.securityDepositAmount != null
                    ? postData.attribute.price.securityDepositAmount
                    : property && property.PropertyAttribute
                    ? property.PropertyAttribute.securityDepositAmount
                    : null;

            if (
                postData?.generalInfo?.mainTypeId === 1 &&
                postData?.generalInfo?.propertyTypeId === '59' &&
                postData?.generalInfo?.other?.sourceTypeId === '68'
            ) {
                postData.attribute.noOfBedrooms =
                    postData.attribute.general.noOfBedrooms;
                postData.attribute.noOfBathrooms =
                    postData.attribute.general.noOfBathrooms;
            }
            if (postData.id) {
                await property.PropertyAttribute.update(postData.attribute, {
                    transaction: tans,
                });
            } else {
                await property.createPropertyAttribute(postData.attribute, {
                    transaction: tans,
                });
            }

            return true;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::savePropertyAttributes → ${err.message}`
            );
            throw err;
        }
    };

    /**
     * Save the Property location in the Database
     * @route POST /add
     */
    savePropertyLocation = async (postData: any, property: any, tans: any) => {
        try {
            if (postData.id) {
                await property.PropertyLocation.update(postData.location, {
                    transaction: tans,
                });
            } else {
                await property.createPropertyLocation(postData.location, {
                    transaction: tans,
                });
            }
            return true;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::savePropertyLocation → ${err.message}`
            );
            throw err;
        }
    };

    /**
     * Save the Property amenities information in the Database
     *
     */
    savePropertyAmenity = async (
        aminityPostData: any,
        property: any,
        tans: any
    ) => {
        try {
            let amenityData = [];
            for (let i = 0; i < aminityPostData.length; ++i) {
                if (aminityPostData[i].amenityId) {
                    amenityData.push({
                        amenityId: aminityPostData[i].amenityId,
                        propertyId: property.id,
                    });
                }
            }
            await AmenityProperty.destroy({
                where: { property_id: property.id },
                transaction: tans,
            });

            await AmenityProperty.bulkCreate(amenityData, {
                transaction: tans,
            });
            return true;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::savePropertyAmenity → ${err.message}`
            );
            throw err;
        }
    };
    /**
     * Save the Property files information in the Database
     *
     */
    savePropertyFiles = async (
        filesPostData: any,
        property: any,
        tans: any
    ) => {
        try {
            let imageValues = [];
            if (filesPostData.images && filesPostData.images.length > 0) {
                for (let i = 0; i < filesPostData.images.length; i++) {
                    imageValues.push({
                        property_id: property.id,
                        name: filesPostData.images[i],
                        type: 'main',
                    });
                }
                await PropertyFile.destroy({
                    where: { property_id: property.id, type: 'main' },
                    force: true,
                });
            }

            if (filesPostData.floorPlans) {
                imageValues.push({
                    property_id: property.id,
                    name: filesPostData.floorPlans,
                    type: 'floor_plan',
                });
                await PropertyFile.destroy({
                    where: { property_id: property.id, type: 'floor_plan' },
                    force: true,
                });
            }
            if (filesPostData.deed) {
                imageValues.push({
                    property_id: property.id,
                    name: filesPostData.deed,
                    type: 'deed',
                });
                await PropertyFile.destroy({
                    where: { property_id: property.id, type: 'deed' },
                    force: true,
                });
            }
            if (filesPostData.attorney) {
                imageValues.push({
                    property_id: property.id,
                    name: filesPostData.attorney,
                    type: 'attorney',
                });
                await PropertyFile.destroy({
                    where: { property_id: property.id, type: 'attorney' },
                    force: true,
                });
            }
            if (filesPostData.nationality) {
                imageValues.push({
                    property_id: property.id,
                    name: filesPostData.nationality,
                    type: 'national_id',
                });
                await PropertyFile.destroy({
                    where: { property_id: property.id, type: 'national_id' },
                    force: true,
                });
            }

            if (filesPostData.brochure) {
                imageValues.push({
                    property_id: property.id,
                    name: filesPostData.brochure,
                    type: 'brochure',
                });
                await PropertyFile.destroy({
                    where: { property_id: property.id, type: 'brochure' },
                    force: true,
                });
            }
            if (imageValues && imageValues.length > 0) {
                await PropertyFile.bulkCreate(imageValues, {
                    transaction: tans,
                });
                return true;
            }
            return true;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::savePropertyFiles → ${err.message}`
            );
            throw err;
        }
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
    /**
     *
     * @param postData
     */
    createProject = async (postData: any, developerId: number, trans: any) => {
        try {
            const propertyProject: any = {
                is_active: false,
                developer_id: developerId,
                slug: slugify(postData.en.projectName, { lower: true }),
            };
            let project: any = [];
            project = await Project.findOne({
                attributes: ['id'],
                where: { slug: propertyProject.slug },
            });
            if (project) {
                if (developerId) {
                    const updateData: any = {
                        developer_id: developerId,
                    };
                    project = await project.update(updateData);
                }

                return project;
            } else {
                project = await Project.create(propertyProject, {
                    // transaction: trans,
                });
                const propertyProjectEn: any = {
                    locale: 'en',
                    name: postData.en.projectName,
                };
                const propertyProjectAr: any = {
                    locale: 'ar',
                    name: postData.ar.projectName,
                };
                await project.createProjectTranslation(propertyProjectEn, {
                    // transaction: trans,
                });
                await project.createProjectTranslation(propertyProjectAr, {
                    // transaction: trans,
                });
                return project;
            }
        } catch (err: any) {
            logger.error(`PropertyRepository::createProject → ${err.message}`);
            throw err;
        }
    };

    /**
     *
     * @param postData
     */
    createDeveloper = async (postData: any, trans: any) => {
        try {
            const developer: any = {
                isActive: false,
            };
            let developerData: any = [];

            developerData = await DeveloperTranslation.findOne({
                where: { name: postData.en.developerName },
                include: [
                    {
                        model: Developer,
                    },
                ],
            });

            if (developerData) {
                return developerData.Developer;
            } else {
                developerData = await Developer.create(developer, {
                    transaction: trans,
                });
                const developerEn: any = {
                    locale: 'en',
                    name: postData.en.developerName,
                };
                const developerAr: any = {
                    locale: 'ar',
                    name: postData.ar.developerName,
                };
                await developerData.createDeveloperTranslation(developerEn, {
                    transaction: trans,
                });
                await developerData.createDeveloperTranslation(developerAr, {
                    transaction: trans,
                });
            }
            return developerData;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::createDeveloper → ${err.message}`
            );
            throw err;
        }
    };
    /**
     *
     * @param postData
     */
    createTitle = async (postData: any, darReference: string) => {
        try {
            let purposeName: any = await TypeMaster.findOne({
                attributes: ['code'],
                where: { id: postData.generalInfo.listingTypeId },
                include: [
                    {
                        model: TypeMasterTranslation,
                        attributes: ['name', 'locale'],
                    },
                ],
            });
            let enPurpose = purposeName.TypeMasterTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let arPurpose = purposeName.TypeMasterTranslations.find(
                (o: any) => o.locale === 'ar'
            );

            let enUnitTypeName: any = {},
                arUnitTypeName: any = {};
            if (
                postData.attribute.area &&
                postData.attribute.area.unitTypeId != null &&
                postData.attribute.area.unitTypeId != ''
            ) {
                let unitTypeName: any = await TypeMaster.findOne({
                    attributes: ['id'],
                    where: { id: postData.attribute.area.unitTypeId },
                    include: [
                        {
                            model: TypeMasterTranslation,
                            attributes: ['name', 'locale'],
                        },
                    ],
                });
                enUnitTypeName = unitTypeName.TypeMasterTranslations.find(
                    (o: any) => o.locale === 'en'
                );
                arUnitTypeName = unitTypeName.TypeMasterTranslations.find(
                    (o: any) => o.locale === 'ar'
                );
            }
            let optionName: any = await PropertyTypeOption.findOne({
                where: { id: postData.generalInfo.optionTypeId },
                attributes: ['code'],
                include: [
                    {
                        model: PropertyTypeOptionTranslation,
                        attributes: ['name', 'locale'],
                    },
                ],
            });

            let enOption = optionName.PropertyTypeOptionTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let arOption = optionName.PropertyTypeOptionTranslations.find(
                (o: any) => o.locale === 'ar'
            );
            let enProjectName: any = {};
            let arProjectName: any = {};

            if (
                postData.generalInfo.projectId &&
                postData.generalInfo.projectId != 0 &&
                postData.generalInfo.projectId != ''
            ) {
                let projectName: any = await Project.findOne({
                    where: { id: postData.generalInfo.projectId },
                    attributes: ['id'],
                    include: [
                        {
                            model: ProjectTranslation,
                            attributes: ['name', 'locale'],
                        },
                    ],
                });
                enProjectName = await projectName.ProjectTranslations.find(
                    (o: any) => o.locale === 'en'
                );
                arProjectName = await projectName.ProjectTranslations.find(
                    (o: any) => o.locale === 'ar'
                );
            }
            let countryName: any = await Country.findOne({
                attributes: ['id', 'iso_code'],
                where: { id: postData.location.countryId },
                include: [
                    {
                        model: CountryTranslation,
                        attributes: ['name', 'locale'],
                    },
                ],
            });
            let enCountryName = countryName.CountryTranslations.find(
                (o: any) => o.locale === 'en'
            );
            let arCountryName = countryName.CountryTranslations.find(
                (o: any) => o.locale === 'ar'
            );
            let cityName: any = await City.findOne({
                attributes: ['id'],
                where: { id: postData.location?.cityId || null },
                include: [
                    { model: CityTranslation, attributes: ['name', 'locale'] },
                ],
            });
            let enCityName = cityName?.CityTranslations?.find(
                (o: any) => o.locale === 'en'
            );
            let arCityName = cityName?.CityTranslations?.find(
                (o: any) => o.locale === 'ar'
            );
            let zoneName: any = await Zone.findOne({
                attributes: ['id'],
                where: { id: postData.location?.zoneId || null },
                include: [
                    { model: ZoneTranslation, attributes: ['name', 'locale'] },
                ],
            });
            let enZoneName = zoneName?.ZoneTranslations?.find(
                (o: any) => o.locale === 'en'
            );
            let arZoneName = zoneName?.ZoneTranslations?.find(
                (o: any) => o.locale === 'ar'
            );

            let propertyTypeSlug: any = await PropertyTypes.findOne({
                attributes: ['slug'],
                where: { id: postData.generalInfo.propertyTypeId },
            });

            let bedroomEn = `${
                postData.generalInfo.mainTypeId == PropertyType.mainTypeId &&
                propertyTypeSlug.slug != 'private-island' &&
                propertyTypeSlug.slug != 'residential-land'
                    ? postData.attribute.general.noOfBedrooms
                        ? postData.attribute.general.noOfBedrooms +
                          ' Bedroom(s)'
                        : ''
                    : postData.attribute.area.builtUpArea
                    ? postData.attribute.area.builtUpArea +
                      ' ' +
                      enUnitTypeName.name
                    : ''
            } `;
            let bedroomAr = `${
                postData.generalInfo.mainTypeId == PropertyType.mainTypeId &&
                propertyTypeSlug.slug != 'private-island' &&
                propertyTypeSlug.slug != 'residential-land'
                    ? postData.attribute.general.noOfBedrooms
                        ? postData.attribute.general.noOfBedrooms + 'غرف نوم)'
                        : ''
                    : postData.attribute.area.builtUpArea
                    ? postData.attribute.area.builtUpArea +
                      ' ' +
                      arUnitTypeName.name
                    : ''
            } `;
            let propertyTitle: any = {};
            propertyTitle.enTitle = `${enOption.name} ${bedroomEn} 
       for ${enPurpose.name} in ${
                enProjectName.name ? enProjectName.name + ',' : ''
            } ${enZoneName?.name ? enZoneName?.name + ',' : ''} ${
                enCityName?.name ? enCityName?.name + ',' : ''
            } ${enCountryName?.name}`;
            propertyTitle.arTitle = `${arOption?.name} ${bedroomAr}
       ل ${arPurpose?.name} في ${
                arProjectName.name ? arProjectName.name + ',' : ''
            } ${arZoneName?.name ? arZoneName.name + ',' : ''}, ${
                arCityName?.name ? arCityName.name + ',' : ''
            } ${arCountryName?.name}`;
            let randomCode = await this.generateRandomNumber(6);
            if (darReference) {
                const darArr = darReference.split(/[\s-]+/);
                randomCode = darArr[darArr.length - 1];
            }

            propertyTitle.darReference = `${postData.generalInfo.userId}-${countryName.iso_code}-${purposeName.code}-${optionName.code}-${randomCode}`;
            return propertyTitle;
        } catch (err: any) {
            logger.error(`PropertyRepository::createTitle → ${err.message}`);
            throw err;
        }
    };

    /**
     *
     * @param data
     */
    editProperty = async (requestData: any) => {
        let responseData: {
            status: boolean;
            message: string;
            propertyData: any | null;
        } = {
            status: false,
            message: '',
            propertyData: null,
        };
        try {
            await userService.checkUser(requestData.userId);
            let userIds = await User.findAll({
                where: { parent_id: requestData.userId },
                attributes: ['id'],
            }).then((users) =>
                users.map((userData: any) => parseInt(userData.id))
            );
            userIds.push(requestData.userId);
            let propertyData: any = await Property.findOne({
                where: { id: requestData.id, userId: userIds },
                include: [
                    { model: PropertyTranslation },
                    { model: PropertyAttribute },
                    { model: PropertyLocation },
                    { model: PropertyFile },
                    { model: Amenity },
                    {
                        model: Developer,

                        required: false,
                        include: [
                            {
                                model: DeveloperTranslation,

                                required: false,
                            },
                        ],
                    },
                    {
                        model: Project,

                        required: false,
                        include: [
                            {
                                model: ProjectTranslation,

                                required: false,
                            },
                        ],
                    },
                ],
            });
            if (!propertyData) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            if (propertyData) {
                let editPropertyResponse = {};
                editPropertyResponse = await this.setEditPropertyResponse(
                    propertyData.toJSON()
                );
                console.log('editPropertyResponse', editPropertyResponse);
                responseData.propertyData = editPropertyResponse;
            }
        } catch (err: any) {
            logger.error(`PropertyRepository::editProperty → ${err.message}`);
            throw err;
        }
        return responseData;
    };

    /**
     * update the Property in the Database
     *
     */
    updateProperty = async (postData: any) => {
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
            if (typeof postData.generalInfo.developerId == 'undefined') {
                postData.generalInfo.developerId = null;
            }
            if (typeof postData.generalInfo.projectId == 'undefined') {
                postData.generalInfo.projectId = null;
            }

            await userService.checkUser(postData.generalInfo.userId);
            // postData.generalInfo.userId = 182;
            let userIds = await User.findAll({
                where: { parent_id: postData.generalInfo.userId },
                attributes: ['id'],
            }).then((users) =>
                users.map((userData: any) => parseInt(userData.id))
            );
            userIds.push(postData.generalInfo.userId);
            let propertyData: any = await Property.findOne({
                where: { id: postData.id, userId: userIds },
                include: [
                    { model: PropertyTranslation, order: ['id', 'ASC'] },
                    { model: PropertyAttribute },
                    { model: PropertyLocation },
                ],
            });
            console.log('postdata', postData);
            if (!propertyData) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            if (
                postData.generalInfo.other &&
                postData.generalInfo.other.sourceTypeId
            ) {
                postData.generalInfo.sourceTypeId =
                    postData.generalInfo.other.sourceTypeId;
            } else {
                postData.generalInfo.sourceTypeId = propertyData.sourceTypeId;
            }
            postData.generalInfo.statusTypeId = await this.setPropertyStatus(
                postData.generalInfo.userId,
                postData.generalInfo.propertyRegionId,
                postData.file,
                postData.generalInfo.sourceTypeId
            );

            if (
                !postData.generalInfo.developerId &&
                postData.translation.en.developerName &&
                postData.translation.en.developerName != ''
            ) {
                const savedDeveloper: any = await this.createDeveloper(
                    postData.translation,
                    transaction
                );
                postData.generalInfo.developerId = savedDeveloper.id;
            }
            let developerId = null;
            if (
                postData.generalInfo.developerId &&
                postData.generalInfo.developerId != 0
            ) {
                developerId = postData.generalInfo.developerId;
            }
            if (
                !postData.generalInfo.projectId &&
                postData.translation.en.projectName &&
                postData.translation.en.projectName !== ''
            ) {
                const savedProject: any = await this.createProject(
                    postData.translation,
                    developerId,
                    transaction
                );
                postData.generalInfo.projectId = savedProject.id;
            } else {
                postData.generalInfo.projectId = propertyData.projectId;
            }

            postData.generalInfo.listingTypeId = postData.generalInfo
                .listingTypeId
                ? postData.generalInfo.listingTypeId
                : propertyData.listingTypeId;
            postData.generalInfo.listingTypeId = postData.generalInfo
                .listingTypeId
                ? postData.generalInfo.listingTypeId
                : propertyData.listingTypeId;
            console.log('postData', propertyData.PropertyAttribute);
            postData.attribute.area.unitTypeId =
                postData.attribute.area &&
                postData.attribute.area.unitTypeId != null
                    ? postData.attribute.area.unitTypeId
                    : propertyData.PropertyAttribute.unitTypeId;
            postData.attribute.area.builtUpArea =
                postData.attribute.area &&
                postData.attribute.area.builtUpArea != null
                    ? postData.attribute.area.builtUpArea
                    : propertyData.PropertyAttribute.builtUpArea;
            postData.attribute.general.noOfBedrooms =
                postData.attribute.general &&
                postData.attribute.general.noOfBedrooms != null
                    ? postData.attribute.general.noOfBedrooms
                    : propertyData.PropertyAttribute.noOfBedrooms;

            let title = await this.createTitle(
                postData,
                propertyData.darReference
            );

            postData.translation.en.title = title.enTitle.replace(/\s+/g, ' ');
            postData.translation.ar.title = title.arTitle.replace(/\s+/g, ' ');
            postData.generalInfo.darReference = title.darReference;
            // const parentData: any = await this.getParentUserId(
            //   postData.generalInfo.userId
            // );
            // postData.generalInfo.addedBy =
            //   parentData && parentData.parent_id
            //     ? parentData.parent_id
            //     : postData.generalInfo.userId;

            postData.generalInfo.external_360_link =
                postData.generalInfo.other &&
                postData.generalInfo.other.external360Link != null
                    ? postData.generalInfo.other.external360Link
                    : propertyData.external360Link;
            postData.generalInfo.external_video_link = postData.generalInfo
                .other
                ? postData.generalInfo.other.externalVideoLink
                : propertyData.externalVideoLink;

            postData.generalInfo.unitReference = postData.generalInfo.other
                ? postData.generalInfo.other.unitReference
                : propertyData.unitReference;
            postData.generalInfo.isWhatsappLater =
                postData.generalInfo.other &&
                postData.generalInfo.other.isWhatsappLater
                    ? postData.generalInfo.other.isWhatsappLater
                    : propertyData.isWhatsappLater;
            postData.generalInfo.isAlreadyLeased =
                postData.attribute.area &&
                postData.attribute.area.isAlreadyLeased
                    ? postData.attribute.area.isAlreadyLeased
                    : propertyData.isAlreadyLeased;
            if (
                postData.generalInfo.darReference == propertyData.darReference
            ) {
                delete postData.generalInfo.darReference;
            }
            const slug = await this.createSlug(postData.translation.en.title);
            postData.generalInfo.slug = slug;

            await propertyData.update(postData.generalInfo, {
                transaction: transaction,
            });

            await this.savePropertyTranslation(
                postData,
                propertyData,
                transaction
            );
            await this.savePropertyAttributes(
                postData,
                propertyData,
                transaction
            );
            await this.savePropertyLocation(
                postData,
                propertyData,
                transaction
            );
            if (postData.amenity) {
                await this.savePropertyAmenity(
                    postData.amenity,
                    propertyData,
                    transaction
                );
            }
            if (postData.file) {
                await this.savePropertyFiles(
                    postData.file,
                    propertyData,
                    transaction
                );
            }

            await transaction.commit();

            await this.savePropertyStatusLog(
                propertyData,
                postData.generalInfo.statusTypeId
            );
            // await this.createFinalTitle(propertyData.id);

            let propertyResponse: any = await this.setAddPropertyResponse(
                propertyData.id,
                postData.locale
            );
            responseData.status = true;
            responseData.property = propertyResponse;
        } catch (err: any) {
            logger.error(`PropertyRepository::updateProperty → ${err.message}`);
            await transaction.rollback();
            if (
                err.errors &&
                typeof err.errors[0].path != 'undefined' &&
                (err.errors[0].path == 'user_id' ||
                    err.errors[0].path == 'unit_reference') &&
                typeof err.errors[0].message
            ) {
                throw new Error(
                    `${PropertyErrorCodes.UNIT_REFERENCE_ALREADY_EXISTS}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            } else {
                throw err;
            }
        }
        return responseData;
    };
    createSlug = async (title: string) => {
        try {
            let slug = uuidv4();
            slug = slugify(slug, {
                replacement: '-',
                remove: /[*+~.()'"!:@]/g,
                lower: true,
            });
            return slug;
        } catch (err: any) {
            logger.error(`PropertyRepository::createSlug → ${err.message}`);
            throw err;
        }
    };

    /**
     *
     * @param data
     */
    getUserProperties = async (data: any) => {
        let responseData: {
            data: any | null;
            count: any | null;
        } = {
            data: null,
            count: null,
        };

        try {
            let where: any = {};
            let order: any = ['updatedAt', 'DESC'];
            let property: any = {};
            if (data.keyword && data.keyword != '') {
                var searchData = { [Op.iLike]: '%' + data.keyword + '%' };
                where = {
                    unitReference: searchData,
                };
            }
            if (!data.is_ambassador_app) {
                const checkUser = await userService.checkUser(data.userId);
                if (!checkUser) {
                    throw new Error(
                        `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                    );
                }
                console.log('data.userId', data.userId);
                let userIds: any = [];
                if (data.agentId && data.agentId != '') {
                    userIds.push(data.agentId);
                } else {
                    userIds = await User.findAll({
                        where: { parent_id: data.userId },
                        attributes: ['id'],
                    }).then((users) =>
                        users.map((userData: any) => parseInt(userData.id))
                    );
                    userIds.push(data.userId);
                }
                where['userId'] = userIds;
            } else {
                where['added_by'] = data.userId;
            }

            if (data.subStatusTypeId && data.subStatusTypeId != 0) {
                where['status_type_id'] = data.subStatusTypeId;
            } else {
                if (data.statusTypeId && data.statusTypeId != 0) {
                    switch (data.statusTypeId) {
                        case PropertyErrorCodes.APPROVED:
                            where['status_type_id'] = {
                                [Op.or]: [
                                    PropertyErrorCodes.APPROVED,
                                    PropertyErrorCodes.UNPUBLISHED,
                                ],
                            };
                            break;
                        case PropertyErrorCodes.PENDING:
                            where['status_type_id'] = {
                                [Op.or]: [
                                    PropertyErrorCodes.BRE_VERIFICATION,
                                    PropertyErrorCodes.VERIFIED,
                                    PropertyErrorCodes.BRE_APPROVAL,
                                    PropertyErrorCodes.LOCALIZATION,
                                ],
                            };
                            break;
                        case PropertyErrorCodes.MISSING:
                            where['status_type_id'] = {
                                [Op.or]: [
                                    PropertyErrorCodes.MISSING,
                                    PropertyErrorCodes.REJECTED,
                                ],
                            };
                            break;
                        case PropertyErrorCodes.ARCHIVED:
                            where['status_type_id'] = {
                                [Op.or]: [PropertyErrorCodes.ARCHIVED],
                            };
                            break;
                        default:
                            null;
                    }
                }
            }

            if (data.typeId && data.typeId != 0) {
                where['property_type_d'] = data.typeId;
            }
            if (data.bedrooms && data.bedrooms != 0) {
                where['no_of_bedrooms'] = data.bedrooms;
            }
            if (data.bathrooms && data.bathrooms != 0) {
                where['no_of_bathrooms'] = data.bathrooms;
            }
            if (data.cityId && data.cityId != 0) {
                where['city_id'] = data.cityId;
            }

            property['locale'] = data.locale;
            let propertyData = await PropertyView.findAll({
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

            let propertyCount = await PropertyView.count({
                where: where,
            });
            if (propertyData) {
                let userPropertyResponse: any = [];
                let self = this;
                for (let i = 0; i < propertyData.length; i++) {
                    const property = propertyData[i];
                    let userPropertyResponseData =
                        await self.setUserPropertyResponse(
                            property.toJSON(),
                            data.locale
                        );

                    userPropertyResponse.push(userPropertyResponseData);
                }
                responseData.count = propertyCount;
                responseData.data = userPropertyResponse;
            }
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUserProperties → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };

    getUserPropertyStatusCount = async (data: any) => {
        let responseData: {
            headers: any | null;
        } = {
            headers: null,
        };
        try {
            let userIds: any = [];
            if (data.agentId && data.agentId != '') {
                userIds.push(data.agentId);
            } else {
                userIds = await User.findAll({
                    where: { parent_id: data.userId },
                    attributes: ['id'],
                }).then((users) =>
                    users.map((userData: any) => parseInt(userData.id))
                );
                userIds.push(data.userId);
            }
            const approvedCount = await PropertyView.count({
                where: {
                    statusTypeId: [
                        PropertyErrorCodes.APPROVED,
                        PropertyErrorCodes.UNPUBLISHED,
                    ],
                    userId: userIds,
                },
            });

            const pendingCount = await PropertyView.count({
                where: {
                    statusTypeId: [
                        PropertyErrorCodes.BRE_VERIFICATION,
                        PropertyErrorCodes.VERIFIED,
                        PropertyErrorCodes.BRE_APPROVAL,
                        PropertyErrorCodes.LOCALIZATION,
                    ],
                    userId: userIds,
                },
            });
            const missingCount = await PropertyView.count({
                where: {
                    statusTypeId: [
                        PropertyErrorCodes.MISSING,
                        PropertyErrorCodes.REJECTED,
                    ],
                    userId: userIds,
                },
            });
            const archivedCount = await PropertyView.count({
                where: {
                    statusTypeId: PropertyErrorCodes.ARCHIVED,
                    userId: userIds,
                },
            });
            const headers: any = [];
            headers.push({
                statusTypeId: PropertyErrorCodes.ARCHIVED,
                statusType: PropertyErrorCodes.ARCHIVED_TYPE,
                count: archivedCount,
                active:
                    data.statusTypeId == PropertyErrorCodes.ARCHIVED
                        ? true
                        : false,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.PENDING,
                statusType: PropertyErrorCodes.PENDING_TYPE,
                count: pendingCount,
                active:
                    data.statusTypeId == PropertyErrorCodes.PENDING
                        ? true
                        : false,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.APPROVED,
                statusType: PropertyErrorCodes.APPROVED_TYPE,
                count: approvedCount,
                active:
                    data.statusTypeId == PropertyErrorCodes.APPROVED
                        ? true
                        : false,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.MISSING,
                statusType: PropertyErrorCodes.MISSING_TYPE,
                count: missingCount,
                active:
                    data.statusTypeId == PropertyErrorCodes.MISSING
                        ? true
                        : false,
            });

            responseData = headers;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUserPropertyStatusCount → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };

    /**
     *
     * @param data
     */
    searchUserProperty = async (data: any) => {
        let responseData: {
            data: any | null;
            count: number;
        } = {
            data: null,
            count: null,
        };

        try {
            await userService.checkUser(data.userId);
            let userIds: any = [];
            if (data.agentId && data.agentId != '') {
                userIds.push(data.agentId);
            } else {
                if (data.findFor && data.findFor != 0) {
                    switch (data.findFor) {
                        case PropertyFindFor.ALL:
                            userIds = await User.findAll({
                                where: { parent_id: data.userId },
                                attributes: ['id'],
                            }).then((users) =>
                                users.map((userData: any) =>
                                    parseInt(userData.id)
                                )
                            );
                            userIds.push(data.userId);
                            break;
                        case PropertyFindFor.SUB_ACCOUNT:
                            userIds = await User.findAll({
                                where: { parent_id: data.userId },
                                attributes: ['id'],
                            }).then((users) =>
                                users.map((userData: any) =>
                                    parseInt(userData.id)
                                )
                            );
                            break;
                        case PropertyFindFor.ME:
                            userIds.push(data.userId);
                            break;
                        default:
                            null;
                    }
                }
            }

            let order: any = ['id', 'DESC'];
            let where: any = {};
            if (data.keyword && data.keyword != '') {
                var searchData = { [Op.iLike]: '%' + data.keyword + '%' };
                where = {
                    [Op.or]: [{ arTitle: searchData }, { enTitle: searchData }],
                };
            }
            where['userId'] = userIds;

            if (data.purposeFor && data.purposeFor != 0) {
                where['listingTypeId'] = data.purposeFor;
            }
            if (data.mainTypeId && data.mainTypeId != 0) {
                where['mainTypeId'] = data.mainTypeId;
            }
            if (data.optionTypeId && data.optionTypeId != 0) {
                where['optionTypeId'] = data.optionTypeId;
            }

            if (data.cityId && data.cityId != 0) {
                where['cityId'] = data.cityId;
            }

            if (data.purposeFor == PropertyErrorCodes.SALE) {
                if (data.priceFrom && data.priceTo) {
                    where['salePrice'] = {
                        [Op.between]: [data.priceFrom, data.priceTo],
                    };
                } else if (data.priceFrom) {
                    where['salePrice'] = {
                        [Op.gte]: data.priceFrom,
                    };
                } else if (data.priceTo) {
                    where['salePrice'] = {
                        [Op.lte]: data.priceTo,
                    };
                }
            }

            if (data.purposeFor == PropertyErrorCodes.RENT) {
                if (data.priceFrom && data.priceTo) {
                    where['expectedRent'] = {
                        [Op.between]: [data.priceFrom, data.priceTo],
                    };
                } else if (data.priceFrom) {
                    where['expectedRent'] = {
                        [Op.gte]: data.priceFrom,
                    };
                } else if (data.priceTo) {
                    where['expectedRent'] = {
                        [Op.lte]: data.priceTo,
                    };
                }
            }

            let propertyData = await PropertyView.findAll({
                attributes: data.locale == 'en' ? this.enAttr : this.arAttr,
                include: [
                    {
                        model: PropertyFile,
                        where: {
                            type: {
                                [Op.in]: ['main'],
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
            let propertyCount = await PropertyView.count({
                where: where,
            });
            if (propertyData) {
                let userPropertyResponse: any = [];
                let self = this;
                for (let i = 0; i < propertyData.length; i++) {
                    const property = propertyData[i];
                    let userPropertyResponseData =
                        await self.setUserPropertyResponse(
                            property.toJSON(),
                            data.locale
                        );
                    userPropertyResponse.push(userPropertyResponseData);
                }
                responseData.data = {
                    rows: userPropertyResponse,
                    count: propertyCount,
                };
            }
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUserProperties → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };
    archiveProperty = async (data: any) => {
        let responseData: {
            status: boolean | null;
        } = {
            status: false,
        };
        try {
            let userIds: any = {};
            userIds = await User.findAll({
                where: { parent_id: data.userId },
                attributes: ['id'],
            }).then((users) =>
                users.map((userData: any) => parseInt(userData.id))
            );
            userIds.push(data.userId);
            var propertyData = await Property.findOne({
                where: {
                    id: data.id,
                    user_id: userIds,
                },
            });
            if (propertyData) {
                await propertyData.update({
                    statusTypeId: PropertyErrorCodes.ARCHIVED,
                });
                await this.savePropertyStatusLog(
                    propertyData,
                    PropertyErrorCodes.ARCHIVED
                );

                responseData.status = true;
            }
        } catch (err: any) {
            logger.error(
                `PropertyRepository::archiveProperty → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };
    updatePropertyStatus = async (data: any) => {
        let responseData: {
            status: boolean | null;
        } = {
            status: false,
        };
        try {
            let userIds: any = {};
            userIds = await User.findAll({
                where: { parent_id: data.userId },
                attributes: ['id'],
            }).then((users) =>
                users.map((userData: any) => parseInt(userData.id))
            );
            userIds.push(data.userId);
            await userService.checkUser(data.userId);
            var propertyData = await Property.findOne({
                where: {
                    id: data.id,
                    user_id: userIds,
                },
            });

            if (propertyData) {
                await propertyData.update({
                    statusTypeId: data.statusTypeId,
                });
                await this.savePropertyStatusLog(
                    propertyData,
                    data.statusTypeId
                );
                switch (data.statusType) {
                    case PropertyErrorCodes.RENEWD_TYPE:
                        await propertyData.update({
                            publishedAt: new Date(),
                        });
                        break;
                    default:
                        null;
                }
                responseData.status = true;
            }
        } catch (err: any) {
            logger.error(
                `PropertyRepository::updatePropertyStatus → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };
    unpublishedProperty = async (data: any) => {
        let responseData: {
            status: boolean | null;
        } = {
            status: false,
        };
        try {
            let userIds: any = {};
            userIds = await User.findAll({
                where: { parent_id: data.userId },
                attributes: ['id'],
            }).then((users) =>
                users.map((userData: any) => parseInt(userData.id))
            );
            userIds.push(data.userId);
            var propertyData = await Property.findOne({
                where: {
                    id: data.id,
                    user_id: data.userId,
                },
            });
            if (propertyData) {
                await propertyData.update({
                    statusTypeId: PropertyErrorCodes.ARCHIVED,
                });
                await this.savePropertyStatusLog(
                    propertyData,
                    PropertyErrorCodes.ARCHIVED
                );

                responseData.status = true;
            }
        } catch (err: any) {
            logger.error(
                `PropertyRepository::unpublishedProperty → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };
    renewProperty = async (data: any) => {
        let responseData: {
            status: boolean | null;
        } = {
            status: false,
        };
        try {
            let userIds: any = {};
            userIds = await User.findAll({
                where: { parent_id: data.userId },
                attributes: ['id'],
            }).then((users) =>
                users.map((userData: any) => parseInt(userData.id))
            );
            userIds.push(data.userId);
            var propertyData = await Property.findOne({
                where: {
                    id: data.id,
                    user_id: data.userId,
                },
            });
            if (propertyData.statusTypeId != PropertyErrorCodes.APPROVED) {
                throw new Error(
                    `${PropertyErrorCodes.PROPERTY_NOT_RENEWED}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            if (propertyData) {
                await propertyData.update({
                    publishedAt: new Date(),
                    statusTypeId: PropertyErrorCodes.APPROVED,
                });
                await this.savePropertyStatusLog(
                    propertyData,
                    PropertyErrorCodes.RENEWD
                );

                responseData.status = true;
            }
        } catch (err: any) {
            logger.error(`PropertyRepository::renewProperty → ${err.message}`);
            throw err;
        }
        return responseData;
    };

    transferProperty = async (data: any) => {
        let responseData: {
            status: boolean | null;
        } = {
            status: false,
        };
        try {
            const checkUser = await userService.checkUser(data.userId);
            let userIds: any = {};
            userIds = await User.findAll({
                where: { parent_id: data.userId },
                attributes: ['id'],
            }).then((users) =>
                users.map((userData: any) => parseInt(userData.id))
            );
            userIds.push(data.userId);
            var propertyData: any = await Property.findOne({
                where: {
                    id: data.propertyId,
                    user_id: userIds,
                },
            });

            if (propertyData) {
                await Property.update(
                    { userId: data.agentId },
                    {
                        where: { id: data.propertyId },
                    }
                );
                await this.saveAgentOwnershipTransferHistory(
                    propertyData.id,
                    propertyData.userId,
                    data.agentId
                );
            }
            responseData.status = true;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::transferProperty → ${err.message}`
            );
            throw err;
        }
        return responseData;
    };
    saveAgentOwnershipTransferHistory = async (
        propertyId: number[],
        fromAgentId: number,
        toAgentId: number
    ) => {
        try {
            await AgentOwnershipTranferHistory.create({
                propertyId: propertyId,
                addedByUserId: fromAgentId,
                transferToUserId: toAgentId,
            });

            return true;
        } catch (e: any) {
            logger.error(
                `PropertyRepository::transferProperties → ${e.message}`
            );
            throw e;
        }
    };
    /**
     * @description method for save property status logs
     * @param arg
     * @param property
     */
    savePropertyStatusLog = async (property: any, statusTypeId: Number) => {
        try {
            const propertyStatusLog: any = {
                status_type_id: statusTypeId,
            };
            let savedPropertyLogs = await property.createPropertyStatusLog(
                propertyStatusLog
            );
            return true;
        } catch (err: any) {
            console.log('err', err);
            logger.error(
                `PropertyRepository::savePropertyStatusLog : ${err.message}`
            );
            throw err;
        }
    };
    /**
     *
     */
    getPropertyDataById = async (propertyRequest: any) => {
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
                where: { id: propertyRequest.id },
                include: [
                    { model: PropertyTranslation },
                    { model: User, include: [{ model: UserInfo }] },
                    { model: PropertyLocation },
                    { model: PropertyAttribute },
                ],
            });
            if (property) {
                let propertyResponse: any = this.setPropertyResponse(property);
                responseData.property = propertyResponse;
                responseData.status = true;
                // return propertyResponse;
            }
        } catch (err: any) {
            responseData.message = err.message;
            logger.error(
                `PropertyRepository::getPropertyDataById : ${err.message}`
            );
        }
        return responseData;
    };

    getPropertyIdByUnitReference = async (propertyRequest: any) => {
        let responseData: {
            status: boolean;
            message: string;
            propertyId: Property | null;
        } = {
            status: false,
            message: '',
            propertyId: null,
        };
        try {
            let property: any = await Property.findOne({
                where: { UnitReference: propertyRequest.UnitReference },
                attributes: ['id'],
            });
            if (property) {
                responseData.propertyId = property.id;
                responseData.status = true;
            } else {
                responseData.propertyId = null;
                responseData.status = true;
            }
        } catch (err: any) {
            responseData.message = err.message;
            logger.error(
                `PropertyRepository::getPropertyIdByUnitReference : ${err.message}`
            );
        }
        return responseData;
    };

    setEditPropertyResponse = async (propertyData: any) => {
        let updatedData: any = {
            id: propertyData.id,
        };
        const en = propertyData.PropertyTranslations.find(
            (o: any) => o.locale === 'en'
        );
        const ar = propertyData.PropertyTranslations.find(
            (o: any) => o.locale === 'ar'
        );
        let developerEn, developerAr, projectEn, projectAr;
        if (
            propertyData.Developer &&
            propertyData.Developer.DeveloperTranslations
        ) {
            developerEn = propertyData.Developer.DeveloperTranslations.find(
                (o: any) => o.locale === 'en'
            ).name;
            developerAr = propertyData.Developer.DeveloperTranslations.find(
                (o: any) => o.locale === 'ar'
            ).name;
        }
        if (propertyData.Project && propertyData.Project.ProjectTranslations) {
            projectEn = propertyData.Project.ProjectTranslations.find(
                (o: any) => o.locale === 'en'
            ).name;
            projectAr = propertyData.Project.ProjectTranslations.find(
                (o: any) => o.locale === 'ar'
            ).name;
        }

        const approveBefore = await PropertyStatusLog.count({
            where: {
                property_id: propertyData.id,
                status_type_id: PropertyErrorCodes.APPROVED,
            },
        });
        updatedData['generalInfo'] = {
            propertyRegionId: propertyData.propertyRegionId
                ? propertyData.propertyRegionId
                : propertyData.property_region_id,
            listingTypeId: propertyData.listingTypeId,
            managedById: propertyData.managedById,
            mainTypeId: propertyData.mainTypeId,
            propertyTypeId: propertyData.propertyTypeId,
            optionTypeId: propertyData.optionTypeId,
            developerId: propertyData.developerId,
            projectId: propertyData.projectId,
            userId: propertyData.userId,
            statusTypeId: propertyData.statusTypeId,
            status: {},
            other: {
                external360Link: propertyData.external_360_link,
                externalVideoLink: propertyData.external_video_link,
                darReference: PropertyServiceHelper.createDarRefForResponse(
                    propertyData.darReference
                ),
                unitReference: propertyData.unitReference,
                enDeveloperName: developerEn,
                arDeveloperName: developerAr,
                enProjectName: projectEn,
                arProjectName: projectAr,
                isWhatsappLater: propertyData.isWhatsappLater,
                approveBefore:
                    approveBefore && approveBefore > 0 ? true : false,
            },
        };
        updatedData['attribute'] = {
            general: {
                noOfBedrooms: propertyData.PropertyAttribute.noOfBedrooms,
                noOfBathrooms: propertyData.PropertyAttribute.noOfBathrooms,
                noOfFloors: propertyData.PropertyAttribute.noOfFloors,
                floorNumber: propertyData.PropertyAttribute.floorNumber,
                noOfRetailOutlets:
                    propertyData.PropertyAttribute.noOfRetailOutlets,
                noOfApartments: propertyData.PropertyAttribute.noOfApartments,
                noOfWaterWells: propertyData.PropertyAttribute.noOfWaterWells,
                noOfPalmTrees: propertyData.PropertyAttribute.noOfPalmTrees,
                noOfParkings: propertyData.PropertyAttribute.noOfParkings,
                streetWidth: propertyData.PropertyAttribute.streetWidth,
            },
            type: {
                facingTypeId: propertyData.PropertyAttribute.facingTypeId,
                furnishingTypeId:
                    propertyData.PropertyAttribute.furnishingTypeId,
                possessionTypeId:
                    propertyData.PropertyAttribute.possessionTypeId,
                possessionDate: propertyData.PropertyAttribute.possessionDate,
            },
            area: {
                unitTypeId: propertyData.PropertyAttribute.unitTypeId,
                builtUpArea: propertyData.PropertyAttribute.builtUpArea,
                carpetArea: propertyData.PropertyAttribute.carpetArea,
                completionYear: propertyData.PropertyAttribute.completionYear,
                isAlreadyLeased: propertyData.isAlreadyLeased,
                leaseAmount: propertyData.PropertyAttribute.leaseAmount,
                leaseContractEndDate:
                    propertyData.PropertyAttribute.leaseContractEndDate,
                campCapacity: propertyData.PropertyAttribute.campCapacity,
            },
            price: {
                currencyTypeId: propertyData.PropertyAttribute.currencyTypeId,
                salePrice: propertyData.PropertyAttribute.salePrice,
                expectedRent: propertyData.PropertyAttribute.expectedRent,
                yearlyCharges: propertyData.PropertyAttribute.yearlyCharges,
                rentCycle: propertyData.PropertyAttribute.rentCycle,
                monthlyChargeRange:
                    propertyData.PropertyAttribute.monthlyChargeRange,
                securityDepositAmount:
                    propertyData.PropertyAttribute.securityDepositAmount,
            },
        };
        updatedData['location'] = {
            countryId: propertyData.PropertyLocation.countryId,
            stateId: propertyData.PropertyLocation.stateId,
            cityId: propertyData.PropertyLocation.cityId,
            zoneId: propertyData.PropertyLocation.zoneId,
            buildingNumber: propertyData.PropertyLocation.buildingNumber,
            additionalNumbers: propertyData.PropertyLocation.additionalNumbers,
            latitude: propertyData.PropertyLocation.latitude,
            longitude: propertyData.PropertyLocation.longitude,
        };
        updatedData['translation'] = {
            en: {
                title: en.title,
                address: en.address,
                landmark: en.landmark,
                streetName: en.streetName,
                description: en.description,
                projectName: en.projectName,
                developerName: en.developerName,
            },
            ar: {
                title: ar.title,
                address: ar.address,
                landmark: ar.landmark,
                streetName: ar.streetName,
                description: ar.description,
                projectName: ar.projectName,
                developerName: ar.developerName,
            },
        };
        const aminity: any = [];
        if (propertyData.Amenities) {
            propertyData.Amenities.map(function (item: any) {
                aminity.push({
                    aminityId: item.id,
                });
            });
        }
        updatedData['amenity'] = aminity;
        let file: any = {
            images: [],
            floorPlans: [],
            brochure: [],
            deed: [],
            attorney: [],
            nationality: [],
        };
        if (propertyData.PropertyFiles.length > 0) {
            propertyData.PropertyFiles.map((item: any) => {
                if (item.type == 'floor_plan') {
                    file.floorPlans.push(item.name);
                } else if (item.type == 'deed') {
                    file.deed.push(item.name);
                } else if (item.type == 'brochure') {
                    file.brochure.push(item.name);
                } else if (item.type == 'attorney') {
                    file.attorney.push(item.name);
                } else if (item.type == 'national_id') {
                    file.nationality.push(item.name);
                } else {
                    file.images.push(item.name);
                }
            });
        }

        updatedData['file'] = file;

        return updatedData;
    };

    setAddPropertyResponse = async (propertyId: number, lang: string) => {
        try {
            let propertyData: any = await PropertyView.findOne({
                subQuery: true,
                attributes: lang == 'en' ? this.enAttr : this.arAttr,
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
                where: { id: propertyId },
            });
            let updatedData: any = {};
            if (propertyData) {
                propertyData = propertyData.toJSON();
                updatedData = {
                    id: propertyData.id,
                    title: propertyData.title,
                    slug: propertyData.slug,
                    propertyMainType: propertyData.propertyMainType,
                    external360Link: propertyData.external360Link,
                    externalVideoUrl: propertyData.externalVideoUrl,
                    darReference: PropertyServiceHelper.createDarRefForResponse(
                        propertyData.darReference
                    ),
                    isWhatsappLater: propertyData.isWhatsappLater,
                    propertyRegionType: propertyData.propertyRegionType,
                    propertyRegionId: propertyData.propertyRegionId,
                    statusTypeId: propertyData.statusTypeId,
                    attribute: {
                        noOfBedrooms: propertyData.noOfBedrooms,
                        noOfBathrooms: propertyData.noOfBathrooms,
                        area: {
                            propertyUnitType: propertyData.unitType,
                            builtUpArea: propertyData.builtUpArea,
                            carpetArea: propertyData.carpetArea,
                        },
                        price: {
                            propertyCurrencyType: propertyData.currencyType,
                            salePrice: propertyData.salePrice,
                            expectedRent: propertyData.expectedRent,
                            yearlyCharges: propertyData.yearlyCharges,
                        },
                    },
                };
                const files: any = [];

                if (propertyData.PropertyFiles) {
                    propertyData.PropertyFiles.map((item: any) => {
                        files.push(item.name);
                    });
                }
                updatedData['propertyFiles'] = files;
                return updatedData;
            }
        } catch (err: any) {
            logger.error(
                `PropertyRepository::setAddPropertyResponse : ${err.message}`
            );
            throw err;
        }
    };

    setUserPropertyResponse = async (propertyData: any, locale: string) => {
        PropertyServiceHelper.setPropertyExpiryDate(propertyData);
        propertyData.serverTime = new Date();
        PropertyServiceHelper.setPropertyDisabledTime(propertyData);
        const propertyStatusLogs: any = await PropertyStatusLog.findOne({
            attributes: ['reason', 'createdAt'],
            where: {
                property_id: propertyData.id,
            },
            order: [['id', 'DESC']],
        });
        PropertyServiceHelper.setPropertyGeneralInfo(
            propertyData,
            locale,
            propertyStatusLogs,
            i18next
        );
        PropertyServiceHelper.setPropertyUserInfo(propertyData);
        PropertyServiceHelper.setPropertyFiles(propertyData);
        PropertyServiceHelper.setPropertyBuiltupCarpetArea(propertyData);
        PropertyServiceHelper.setPropertyAttributeResponse(
            propertyData,
            i18next,
            locale
        );
        return propertyData;
    };

    setPropertyResponse = (propertyData: any) => {
        let setPropertyData = {
            id: propertyData.id,
            generalInfo: this.setGeneralInfo(propertyData),
            Translation: this.setPropertyTranslation(propertyData),
            Attribute: this.setPropertyAttribute(propertyData),
        };
        return setPropertyData;
    };

    setGeneralInfo = (data: any) => {
        return {
            listingTypeId: data.listingTypeId,
            mainTypeId: data.mainTypeId,
            propertyTypeId: data.propertyTypeId,
            optionTypeId: data.optionTypeId,
            darReference: data.darReference,
            unitReference: data.unitReference,
            isActive: data.isActive,
            userId: data.userId,
        };
    };

    /**
     *
     */
    setPropertyAttribute = (data: any) => {
        return {
            noOfBedrooms: data.PropertyAttribute.noOfBedrooms,
            noOfBathrooms: data.PropertyAttribute.noOfBathrooms,
            noOfFloors: data.PropertyAttribute.noOfFloors,
            floorNumber: data.PropertyAttribute.floorNumber,
            capacityPerRoom: data.PropertyAttribute.capacityPerRoom,
            campCapacity: data.PropertyAttribute.campCapacity,
            Type: {
                facingTypeId: data.PropertyAttribute.facingTypeId,
                furnishingTypeId: data.PropertyAttribute.furnishingTypeId,
                ownershipTypeId: data.PropertyAttribute.ownershipTypeId,
                residenceTypeId: data.PropertyAttribute.residenceTypeId,
                transactionTypeId: data.PropertyAttribute.transactionTypeId,
                roomTypeId: data.PropertyAttribute.roomTypeId,
            },
            Area: {
                unitTypeId: data.PropertyAttribute.unitTypeId,
                builtUpArea: data.PropertyAttribute.builtUpArea,
                carpetArea: data.PropertyAttribute.carpetArea,
                superBuildUpArea: data.PropertyAttribute.superBuildUpArea,
                completionYear: data.PropertyAttribute.completionYear,
                maintenanceChargeCycleId:
                    data.PropertyAttribute.maintenanceChargeCycleId,
                maintenanceCharge: data.PropertyAttribute.maintenanceCharge,
            },
        };
    };
    /**
     *
     * @param data
     */
    setPropertyTranslation = (data: any) => {
        let en = data.PropertyTranslations.find((o: any) => o.locale === 'en');
        let ar = data.PropertyTranslations.find((o: any) => o.locale === 'ar');
        return {
            en: {
                title: en.title,
                address: en.address,
            },
            ar: {
                title: ar.title,
                address: ar.address,
            },
        };
    };

    /**
     * @description Method for assign property to user
     * @param propertyId
     */
    assignPropertyById = async (propertyId: number) => {
        try {
            const propertyData = await Property.findByPk(propertyId, {
                include: [
                    {
                        model: TypeMaster,
                        as: 'propertyFor',
                    },
                    {
                        model: TypeMaster,
                        as: 'propertyRegion',
                    },
                    {
                        model: PropertyTypes,
                        as: 'propertyType',
                    },
                ],
            });
            let propertyPermission = null;
            let usersId;
            let forAssignUserId;
            let assign = false;
            if (
                propertyData &&
                propertyData.propertyFor &&
                propertyData.propertyRegion &&
                propertyData.PropertyType
            ) {
                propertyPermission = this.getPropertyPermission(propertyData);
                usersId = await this.getUsersByPermission(propertyPermission);
                if (usersId.length) {
                    forAssignUserId = await this.getUserForAssignProperty(
                        propertyData.id,
                        usersId
                    );
                    assign = await this.saveAssignProperty(
                        propertyData.id,
                        forAssignUserId
                    );
                }
            }
            return assign;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::assignPropertyById : ${err.message}`
            );
            throw err;
        }
    };

    saveAssignProperty = async (propertyId: number, userId: number) => {
        try {
            const alreadyAssignedProperty = await StaffAssignedProperty.findOne(
                {
                    where: { propertyId: propertyId },
                }
            );
            if (alreadyAssignedProperty) {
                throw new Error('User is already assigned in this property!');
            }
            await StaffAssignedProperty.create({
                propertyId: propertyId,
                userId: userId,
            });
            return true;
        } catch (err: any) {
            logger.error(
                `StaffPermissionModel::savePropertyPermissionData : ${err.message}`
            );
            throw err;
        }
    };

    getUserForAssignProperty = async (
        propertyId: number,
        userIds: number[]
    ) => {
        try {
            const userData = await StaffAssignedProperty.findAll({
                group: ['user_id', 'property_id'],
                // order: ["total_properties", "ASC"],
                attributes: [
                    [<any>fn('count', 'property_id'), 'total_properties'],
                    'userId',
                ],
                where: { userId: userIds },
            });
            let userId;
            if (userData.length) {
                userIds.map((id: number) => {
                    if (
                        !userData.find(
                            (o: StaffAssignedProperty) => o.userId === id
                        )
                    ) {
                        userId = id;
                    }
                });
                if (!userId) {
                    userId = userData[0].userId;
                }
            } else {
                userId = userIds[0];
            }
            return userId;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUsersByPermission : ${err.message}`
            );
            throw err;
        }
    };

    getUsersByPermission = async (propertyPermission: any) => {
        try {
            const staffPermissions = await StaffPermission.findAll({
                raw: true,
                group: ['user_id'],
                attributes: ['user_id'],
                having: literal('count(user_id) = 3'),
                where: {
                    [Op.or]: [
                        {
                            [Op.and]: {
                                permission: 'business_area',
                                value: propertyPermission.business_area,
                            },
                        },
                        {
                            [Op.and]: {
                                permission: 'coverage',
                                value: propertyPermission.coverage,
                            },
                        },
                        {
                            [Op.and]: {
                                permission: 'location',
                                value: propertyPermission.location,
                            },
                        },
                    ],
                },
            }).then((staffPermissionsData) =>
                staffPermissionsData.map(
                    (staffPermissionData: any) => staffPermissionData.user_id
                )
            );
            return staffPermissions;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::getUsersByPermission : ${err.message}`
            );
            throw err;
        }
    };

    getPropertyPermission = (propertyData: Property) => {
        const propertyPermission = {
            business_area:
                propertyData.PropertyType.slug == 'residential'
                    ? ['1', '3']
                    : propertyData.PropertyType.slug == 'commercial'
                    ? ['2', '3']
                    : ['0'],
            coverage:
                propertyData.propertyFor.slug == 'sale'
                    ? ['1', '3']
                    : propertyData.propertyFor.slug == 'rent'
                    ? ['2', '3']
                    : ['0'],
            location:
                propertyData.propertyRegion.slug == 'property-region-ksa'
                    ? ['1', '3']
                    : propertyData.propertyRegion.slug ==
                      'property-region-international'
                    ? ['2', '3']
                    : ['0'],
        };
        return propertyPermission;
    };

    getUserCities = async (arg: any) => {
        try {
            let userIds: any = {};
            userIds = await User.findAll({
                where: { parent_id: arg.userId },
                attributes: ['id'],
            }).then((users) =>
                users.map((userData: any) => parseInt(userData.id))
            );
            userIds.push(arg.userId);
            const city = await CityTranslation.findAll({
                raw: true,
                subQuery: false,
                attributes: ['name', 'City.id'],
                group: ['City.id', 'CityTranslation.id'],
                order: [['count', 'DESC']],
                where: { locale: arg.locale },
                include: [
                    {
                        model: City,
                        attributes: [],
                        where: {
                            is_active: true,
                            deleted_at: null,
                        },
                        include: [
                            {
                                model: PropertyLocation,
                                as: 'propertyLocationCity',
                                required: true,
                                attributes: [],
                                include: [
                                    {
                                        model: Property,
                                        where: {
                                            user_id: userIds,
                                        },
                                        attributes: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
            return city;
        } catch (err: any) {
            logger.error(`PropertyRepository::getUserCities : ${err.message}`);
            throw err;
        }
    };

    savePropertyForXML = async (postData: any) => {
        // main function to create property
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
        let propertyData: any = [];
        try {
            if (typeof postData.generalInfo.developerId == 'undefined') {
                postData.generalInfo.developerId = null;
            }
            if (typeof postData.generalInfo.projectId == 'undefined') {
                postData.generalInfo.projectId = null;
            }
            if (
                postData.generalInfo.other &&
                postData.generalInfo.other.sourceTypeId
            ) {
                postData.generalInfo.sourceTypeId =
                    postData.generalInfo.other.sourceTypeId;
            } else {
                postData.generalInfo.sourceTypeId =
                    PropertyErrorCodes.SOURCE_MANUAL_TYPE_ID;
            }

            postData.generalInfo.statusTypeId = await this.setPropertyStatus(
                postData.generalInfo.userId,
                postData.generalInfo.propertyRegionId,
                postData.file,
                postData.generalInfo.sourceTypeId
            );
            if (
                !postData.generalInfo.developerId &&
                postData.translation.en.developerName &&
                postData.translation.en.developerName != ''
            ) {
                const savedDeveloper: any = await this.createDeveloper(
                    postData.translation,
                    transaction
                );
                postData.generalInfo.developerId = savedDeveloper.id;
            }

            let developerId = null;
            if (
                postData.generalInfo.developerId &&
                postData.generalInfo.developerId != 0
            ) {
                developerId = postData.generalInfo.developerId;
            }
            if (
                !postData.generalInfo.projectId &&
                postData.translation.en.projectName &&
                postData.translation.en.projectName !== ''
            ) {
                const savedProject: any = await this.createProject(
                    postData.translation,
                    developerId,
                    transaction
                );
                postData.generalInfo.projectId = savedProject.id;
            }
            if (postData.generalInfo.projectId == 0) {
                postData.generalInfo.projectId = null;
            }
            const titleObj: any = {
                userId: postData.generalInfo.userId,
                listingTypeId: postData.generalInfo?.listingTypeId,
                locale: postData.locale,
            };
            let title = await PostPropertyRepo.createTitlePostProperty(
                titleObj,
                null
            );
            postData.translation.en.title = title.enTitle.replace(/\s+/g, ' ');
            postData.translation.ar.title = title.arTitle.replace(/\s+/g, ' ');
            postData.generalInfo.darReference = title.darReference;
            postData.generalInfo.addedBy = postData.generalInfo.userId
                ? postData.generalInfo.userId
                : null;
            const parentData: any = await this.getParentUserId(
                postData.generalInfo.userId
            );
            postData.generalInfo.addedBy =
                parentData && parentData.parent_id
                    ? parentData.parent_id
                    : postData.generalInfo.userId;
            postData.generalInfo.external_360_link = postData.generalInfo.other
                ? postData.generalInfo.other.external360Link
                : null;
            postData.generalInfo.external_video_link = postData.generalInfo
                .other
                ? postData.generalInfo.other.externalVideoLink
                : null;
            postData.generalInfo.isWhatsappLater = postData.generalInfo.other
                ? postData.generalInfo.other.isWhatsappLater || false
                : false;
            postData.generalInfo.isAlreadyLeased = postData.attribute.area
                ? postData.attribute.area.isAlreadyLeased
                : false;
            postData.generalInfo.unitReference = postData.generalInfo.other
                ? postData.generalInfo.other.unitReference
                : null;
            if (postData.id) {
                let propertyData: any = await Property.findOne({
                    where: { id: postData.id },
                    include: [
                        { model: PropertyTranslation, order: ['id', 'ASC'] },
                        { model: PropertyAttribute },
                        { model: PropertyLocation },
                    ],
                });
                if (
                    postData.generalInfo.darReference ==
                    propertyData.darReference
                ) {
                    delete postData.generalInfo.darReference;
                }
                await propertyData.update(postData.generalInfo, {
                    transaction: transaction,
                });
            } else {
                const slug = await this.createSlug(
                    postData.translation.en.title
                );
                postData.generalInfo.slug = slug;
                // console.log('postData.generalInfo :',postData.generalInfo.source);
                console.log(
                    `************ Creating property for ${postData?.generalInfo?.unitReference}`
                );
                propertyData = await Property.create(postData.generalInfo, {
                    transaction: transaction,
                });
            }
            const propertyId = Number(propertyData.dataValues.id);
            propertyData.dataValues.propertyId = propertyId;
            postData.translation.en['propertyId'] = propertyId;
            postData.translation.ar['propertyId'] = propertyId;
            if (propertyData) {
                /** createPropertyTranslation */
                await this.savePropertyTranslation(
                    postData,
                    propertyData,
                    transaction
                );
                const postNewData = cloneDeep(postData);
                postNewData.attribute.propertyId = propertyId;
                postNewData.location.propertyId = propertyId;

                /** To save Following properties:
                 *
                 * noOfBedrooms,noOfBathrooms,noOfFloors,
                 * floorNumber,noOfRetailOutlets,noOfApartments,noOfWaterWells, noOfPalmTrees,noOfParkings,
                 * facingTypeId,furnishingTypeId,possessionTypeId,possessionDate,unitTypeId,builtUpArea,carpetArea,carpetArea,
                 * completionYear,streetWidth,leaseAmount,leaseContractEndDate,campCapacity, currencyTypeId,salePrice,expectedRent,
                 * yearlyCharges,rentCycle,monthlyChargeRange,securityDepositAmount,
                 * Table: PropertyAttribute
                 *
                 */
                await this.savePropertyAttributes(
                    postNewData,
                    propertyData,
                    transaction
                );

                await this.savePropertyLocation(
                    postNewData,
                    propertyData,
                    transaction
                );
                if (postData.amenity && postData.amenity.length > 0) {
                    // amenity
                    await this.savePropertyAmenity(
                        postData.amenity,
                        propertyData,
                        transaction
                    );
                }
                if (postNewData.file) {
                    await this.savePropertyFiles(
                        postNewData.file,
                        propertyData,
                        transaction
                    ); // images
                }
                await transaction.commit();
                if (propertyData) {
                    this.syncTitleForXMLProperty(postData, propertyData);
                    await this.savePropertyStatusLog(
                        propertyData,
                        postData.generalInfo.statusTypeId
                    );
                    let propertyResponse: any =
                        await this.setAddPropertyResponse(
                            propertyData.id,
                            postData.locale
                        );
                    responseData.status = true;
                    responseData.property = propertyResponse;
                }
            }
        } catch (err: any) {
            logger.error(
                `PropertyRepositoryFn::savePropertyForXML → ${err.message}`
            );
            await transaction.rollback();
            if (
                err.errors &&
                typeof err.errors[0].path != 'undefined' &&
                (err.errors[0].path == 'user_id' ||
                    err.errors[0].path == 'unit_reference') &&
                typeof err.errors[0].message
            ) {
                throw new Error(
                    PropertyErrorCodes.UNIT_REFERENCE_ALREADY_EXISTS
                );
            } else if (
                err.errors &&
                typeof err.errors[0].path != 'undefined' &&
                err.errors[0].path == 'slug' &&
                typeof err.errors[0].message
            ) {
                throw new Error(
                    `${PropertyErrorCodes.SLUG_ALREADY_EXISTS}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            } else {
                throw err;
            }
        }
        return responseData;
    };

    getPropertyRegionId = async (prop: any) => {
        // For internationa;
        return TypeMaster.findOne({
            where: {
                slug: 'property-region-international',
                type: 'property_region',
            },
            include: [
                {
                    model: TypeMasterTranslation,
                    attributes: ['name', 'locale'],
                },
            ],
        });
    };

    getSourceTypeId = async (prop: any) => {
        return TypeMaster.findOne({
            where: { slug: 'xml' },
            include: [
                {
                    model: TypeMasterTranslation,
                    attributes: ['name', 'locale'],
                },
            ],
        });
    };

    getlistingTypeId = async (prop: any) => {
        // where: { slug: prop?.price_freq || 'sale', type: 'property_listing_type' },
        return TypeMaster.findOne({
            where: { slug: 'property_listing_type', type: 'sale' },
            include: [
                {
                    model: TypeMasterTranslation,
                    attributes: ['name', 'locale'],
                },
            ],
        });
    };

    getPropertyTypeOptionId = async (prop: any) => {
        let { type = '' } = prop;
        if (typeof type === 'object') {
            const { en = '' } = type;
            type = getOptionTypeName(en);
        }
        prop.type = type;
        return PropertyTypes.findOne({
            where: { slug: { [Op.like]: `%${type}%` }, is_active: true },
        });
    };

    getPropertyTypeId = async (prop: any) => {
        let { type = '' } = prop;
        if (typeof type === 'object') {
            const { en = '' } = type;
            type = await getOptionTypeName(en);
            prop.type = type;
        }
        return PropertyTypes.findOne({
            where: { slug: { [Op.like]: `%${type}%` }, is_active: true },
        });
    };

    getLocationDetails = async (prop: any) => {
        let result: any = { countryId: '' };
        let { country = '', province = '', town = '' } = prop;
        country = countryAliases[country] || country || '';
        province = province?.toLowerCase();
        town = town?.toLowerCase();

        if (country) {
            let enCountryDetails: any = await CountryTranslation.findOne({
                where: { name: country, locale: 'en' },
            });

            if (enCountryDetails?.CountryId) {
                result.countryId = enCountryDetails?.CountryId;
                result.enCountryDetails = enCountryDetails;
                let arCountryDetails: any = await CountryTranslation.findOne({
                    where: {
                        CountryId: enCountryDetails?.CountryId,
                        locale: 'ar',
                    },
                });
                if (arCountryDetails) {
                    result.arCountryDetails = arCountryDetails;
                }
            }
        }

        if (result?.countryId && province) {
            if (province.indexOf(' ') > -1) {
                province = province.split(' ').join('-');
            }
            let cityDetails: any = await City.findOne({
                attributes: ['id', 'slug', 'lat', 'long'],
                where: {
                    country_id: result.countryId,
                    slug: province,
                },
                include: [
                    { model: CityTranslation, attributes: ['name', 'locale'] },
                ],
            });
            result.cityLat = get(cityDetails, 'dataValues.lat');
            result.cityLong = get(cityDetails, 'dataValues.long');
            result.cityId = cityDetails?.id;
            if (cityDetails?.CityTranslations) {
                let enCityDetails = cityDetails?.CityTranslations.find(
                    (o: any) => o.locale === 'en'
                );
                result.cityDetails = cityDetails;
            }
        }

        if (town && result?.cityId) {
            let zoneDetails: any = await Zone.findOne({
                attributes: ['id'],
                where: { slug: town, city_id: result?.cityId },
                include: [
                    { model: ZoneTranslation, attributes: ['name', 'locale'] },
                ],
            });
            result.zoneId = zoneDetails?.id; // 137
            result.zoneDetails = zoneDetails;
        }
        return result;
    };

    getAmenity = async (feature: any) => {
        // 32 - reseidential
        // 31 - commercials
        // return Amenity.findOne({ where: { slug: { [Op.like]: `%${feature}%` }, amenity_type_id: 32 } });
        return Amenity.findOne({
            where: { slug: { [Op.like]: `%${feature}%` } },
        });
    };

    getCurrencyId = async (currencySlug: any) => {
        return TypeMaster.findOne({
            where: { type: 'currencies', slug: currencySlug },
        });
        // return Currency.findOne({ where: { code: currencySlug } });
    };

    createAddress = (locationDetails: any) => {
        try {
            const {
                cityDetails,
                zoneDetails,
                enCountryDetails = {},
                arCountryDetails = {},
            } = locationDetails;

            let enCityName = cityDetails?.CityTranslations?.find(
                (o: any) => o.locale === 'en'
            );
            let arCityName = cityDetails?.CityTranslations?.find(
                (o: any) => o.locale === 'ar'
            );

            let enZoneName = zoneDetails?.ZoneTranslations?.find(
                (o: any) => o.locale === 'en'
            );
            let arZoneName = zoneDetails?.ZoneTranslations?.find(
                (o: any) => o.locale === 'ar'
            );

            let propertyAddress: any = {};
            propertyAddress.enTitle = `${
                enZoneName?.name ? enZoneName?.name + ', ' : ''
            }${enCityName?.name ? enCityName?.name + ', ' : ''}${
                enCountryDetails?.name
            }`;
            propertyAddress.arTitle = `${
                arZoneName?.name ? arZoneName.name + ', ' : ''
            },${arCityName?.name ? arCityName.name + ', ' : ''}${
                arCountryDetails?.name
            }`;
            return propertyAddress;
        } catch (err: any) {
            logger.error(
                `PropertyRepository::propertyAddressFn → ${err.message}`
            );
            throw err;
        }
    };

    insertErrorIntoDB = (records: any) => {
        return XmlUploadErrors.create(records);
    };

    insertXMLSummaryIntoDB = (records: any) => {
        return XmlBulkUploadFileSummary.create(records);
    };

    syncTitleForXMLProperty = async (postData: any, propertyData: any) => {
        const propertyId: any = propertyData.dataValues.id;
        const titleObj: any = {
            userId: postData.generalInfo.userId,
            listingTypeId: postData?.generalInfo?.listingTypeId,
            locale: postData.locale,
            propertyId: propertyId,
        };
        let title = await PostPropertyRepo.createTitlePostProperty(
            titleObj,
            null
        );
        let enTransaltion = PostPropertyRepo.setPropertyTranslationResponse(
            { locale: 'en', title: title.enTitle, propertyId: propertyId },
            propertyId
        );
        let arTransaltion = PostPropertyRepo.setPropertyTranslationResponse(
            { locale: 'ar', title: title.arTitle, propertyId: propertyId },
            propertyId
        );
        PostPropertyRepo.upInsertPropertyTranslationMap(
            propertyId,
            enTransaltion,
            arTransaltion
        );
    };

    getXMLSummary = (condition: any) => {
        return XmlBulkUploadFileSummary.findAll(condition);
    };
    setPropertyAttributeResponse = (data: any = {}, locale: string) => {
        let attributes: any = [];
        propertyAttributes.forEach((attribute) => {
            // check if studio apartment then bedroom should display in attributes even value 0 otherwise do not display.
            const isStudioApartmentBedRoom =
                data.propertyType === 'Apartment' &&
                attribute.key == 'noOfBedrooms' &&
                data[attribute.key] == 0;
            if (isStudioApartmentBedRoom || data[attribute.key]) {
                let newData = {
                    key: attribute.key,
                    name: i18next.t(attribute.key, { lng: locale }),
                    value: data[attribute.key],
                    image: attribute.image,
                    unit: data[attribute.unitKey] || '',
                    iconClass: attribute.iconClass,
                };
                if (attribute.key == 'completionYear' && data[attribute.key]) {
                    newData.value =
                        new Date().getFullYear() - data[attribute.key];
                    if (
                        !newData.value ||
                        newData.value == NaN ||
                        newData.value < 0
                    )
                        newData.value = 0;
                    newData.unit = i18next.t(attribute.unitKey, {
                        lng: locale,
                    });
                }
                attributes.push(newData);
            } else {
                let newData = {
                    key: attribute.key || '',
                    name: i18next.t(attribute.key, { lng: locale }) || '',
                    value: data[attribute.key] || '',
                    image: attribute.image || '',
                    unit: data[attribute.unitKey] || '',
                    iconClass: attribute.iconClass,
                };
                attributes.push(newData);
            }
        });
        return attributes;
        // return attributes.filter((item: any) => {
        //   let ifLandOrFarm =
        //     [41, 52, 43, 42, 47, 44, 48, 53, 61, 58, 59, 49].indexOf(
        //       data.propertyTypeId
        //     ) != -1
        //   let ifBuiltUpArea = item.key == 'builtUpArea'
        //   let ifCarpetArea = item.key == 'carpetArea'
        //   console.log('ifLandOrFarm',ifLandOrFarm,item.key);

        //   if (ifLandOrFarm) {
        //     if (ifBuiltUpArea) {
        //       return false
        //     }
        //   } else {
        //     if (ifCarpetArea) {
        //       return false
        //     }
        //   }
        //   return true
        // })
    };

    // get property details with it's location details by property id
    getPropertyWithLocationById = async (reqBody: Record<string, any>) => {
        const property: any = await Property.findOne({
            where: {
                [Op.or]: [
                    {
                        postPropertyId: reqBody.id,
                    },
                    {
                        id: reqBody.id,
                    },
                ],
            },
            include: [
                {
                    model: PropertyLocation,
                },
            ],
        });

        return property;
    };

    /**
     * @description Get details of a property  with given id and added_by field values.
     * @param reqBody
     */
    getPropertyDataByIdAndAddedById = async (reqBody: any) => {
        const property: any = await Property.findOne({
            attributes: ['id', 'addedBy', 'statusTypeId'],
            where: {
                id: reqBody.propertyId,
                statusTypeId: PropertyErrorCodes.BRE_VERIFICATION,
            },
            include: [
                {
                    model: PropertyLocation,
                },
                {
                    model: InternalTeamReview,
                    as: 'reviews',
                    where: {
                        reviewerId: reqBody.userId,
                    },
                    include: [
                        {
                            model: TypeMaster,
                            where: {
                                slug: InternalReviewStatusSlugEnum.IN_PROGRESS,
                            },
                        },
                    ],
                },
            ],
        });

        if (!property) {
            throw new Error('PROPERTY_WITH_USER_NOT_FOUND');
        }

        return property;
    };

    /**
     * @description Get complete details of a property  with given id
     * @param reqBody
     */
    getPropertyDetailsById = async (reqBody: any) => {
        const property: any = await SellerProperties.findOne({
            attributes:
                reqBody.locale === 'en'
                    ? this.enAttrDetails
                    : this.arAttrDetails,
            where: { id: reqBody.propertyId },
            include: [{ model: PropertyFile, attributes: ['type', 'name'] }],
        });
        const attributes = this.setPropertyDetailsAttributeResponse(
            property.dataValues,
            reqBody.locale
        );
        return { ...property, attributes };
    };

    /**
     * @description Get list of amenities of a property  with given id.
     * @param reqBody
     */
    getPropertyAmenitiesById = async (reqBody: any) => {
        return Amenity.findAll({
            where: {
                is_active: true,
            },
            attributes: [
                'id',
                'icon',
                'amenity_type_id',
                'slug',
                [
                    literal(
                        `(SELECT name from amenity_translations where amenity_translations.amenity_id="Amenity"."id" and amenity_translations.locale='${reqBody.locale}')`
                    ),
                    'name',
                ],
            ],
            include: [
                {
                    model: Property,
                    where: {
                        id: reqBody.propertyId,
                    },
                    required: true,
                },
            ],
        });
    };

    /**
     * @description Get list of streets with details of a property  with given id.
     * @param reqBody
     */
    getStreetInfoByPropertyId = async (reqBody: any) => {
        return StreetInfo.findAll({
            attributes: [
                'id',
                'streetWidth',
                'position',
                'facingTypeId',
                [
                    literal(
                        `(SELECT name from type_master_translations where type_master_translations.type_master_id=facing_type_id and type_master_translations.locale='${reqBody.locale}')`
                    ),
                    'facingType',
                ],
                [
                    literal(
                        `(SELECT icon_class from type_masters where type_masters.id=facing_type_id)`
                    ),
                    'facingTypeIcon',
                ],
            ],
            where: { propertyId: reqBody.propertyId },
        });
    };
}

const PropertyRepo = new PropertyRepository();
export default PropertyRepo;
