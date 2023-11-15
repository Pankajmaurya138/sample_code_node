import i18next from 'i18next';
import moment from 'moment';
import Validator from 'validatorjs';
import {
    API_VERSION_4,
    CITY_ID,
    PROPERTY_DISABLED_MINUTES,
    PROPERTY_TYPES,
    RENTED_TEXT,
    SOLD_TEXT,
} from './constant';
import {
    API_VERSIONS,
    FilterRequestSingleCodeByGroup,
    GroupStatusCodes,
    PropertyErrorCodes,
    PropertyListingType,
    PropertySlugEnum,
    RoleIdEnums,
} from './enums';
import { propertyAttributes } from './static';

export default class PropertyServiceHelper {
    /**
     * Get propery status type ids array
     * @param subStatusTypeId status type id
     * @returns
     */
    private static GetCommonPropertyStatusTypeIds(subStatusTypeId: number) {
        let statusTypeIds: PropertyErrorCodes[] = [];
        if (subStatusTypeId != 0) {
            switch (subStatusTypeId) {
                case PropertyErrorCodes.APPROVED:
                    statusTypeIds = [PropertyErrorCodes.APPROVED];
                    break;
                case PropertyErrorCodes.PENDING:
                    statusTypeIds = GroupStatusCodes.GROUP_STATUS_PENDING;
                    break;
                case PropertyErrorCodes.REJECTED:
                    statusTypeIds = [PropertyErrorCodes.REJECTED];
                    break;
                case PropertyErrorCodes.ARCHIVED:
                    statusTypeIds = GroupStatusCodes.GROUP_STATUS_ARCHIVED;
                    break;
                case PropertyErrorCodes.INCOMPLETE:
                    statusTypeIds = [PropertyErrorCodes.INCOMPLETE];
                    break;
            }
        }
        return statusTypeIds;
    }

    /**
     * @description Get all status or selected status. all status will returns if
     * subStatusTypeId does not match
     * @param subStatusTypeId status type id
     * @param version
     * @returns status type ids array.
     */
    public static GetPropertyStatusTypeIds(
        subStatusTypeId: number,
        version?: number
    ): PropertyErrorCodes[] {
        let statusTypeIds: PropertyErrorCodes[] =
            this.GetCommonPropertyStatusTypeIds(subStatusTypeId);
        if (statusTypeIds.length == 0 && version >= API_VERSION_4) {
            const isSoldRented = [
                PropertyErrorCodes.SOLD,
                PropertyErrorCodes.RENTED,
            ].includes(subStatusTypeId);
            statusTypeIds = isSoldRented ? [PropertyErrorCodes.OCCUPIED] : [];
        }
        if (statusTypeIds.length == 0) {
            statusTypeIds = PropertyServiceHelper.GetGroupStatusAll(version);
        }
        return statusTypeIds;
    }

    /**
     * @description Get listing type id based on status type id.
     * return all listing type ids if status type ids except sold or rented.
     * @param subStatusTypeId status type id
     * @returns listing type ids.
     */
    public static GetPropertyListingTypeIds(
        subStatusTypeId: number
    ): PropertyListingType[] {
        let listingTypes: PropertyListingType[] = [];
        switch (subStatusTypeId) {
            case PropertyErrorCodes.SOLD:
                listingTypes = [PropertyListingType.Sale];
                break;
            case PropertyErrorCodes.RENTED:
                listingTypes = [PropertyListingType.Rent];
                break;
            default:
                listingTypes = [
                    PropertyListingType.Rent,
                    PropertyListingType.Sale,
                ];
                break;
        }
        return listingTypes;
    }

    /**
     * User properties count by status.
     * @param i18next
     * @param propertyViewCount
     * @param data
     * @returns headers array. each header contain property stataus and respective count
     */
    public static GetUserPropertiesCountResponse(
        i18next: any,
        propertyViewCount: any,
        data: any
    ) {
        propertyViewCount.forEach((item: any) => {
            if (
                data.version >= API_VERSION_4 &&
                item.status_type_id == PropertyErrorCodes.OCCUPIED
            ) {
                item.status_type_id =
                    item.listing_type_id == PropertyListingType.Rent
                        ? PropertyErrorCodes.RENTED
                        : PropertyErrorCodes.SOLD;
            }
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
                    obj[status_id] = parseInt(obj[status_id]) + currentCount;
                }
                obj[PropertyErrorCodes.ALL_STATUS] =
                    parseInt(obj[PropertyErrorCodes.ALL_STATUS] || 0) +
                    currentCount;

                return obj;
            },
            {}
        );

        const headers: any = [];
        headers.push({
            statusTypeId: '',
            statusType: i18next.t(`${PropertyErrorCodes.ALL_STATUS}`, {
                lng: data.locale,
            }),
            count: propertyCountByStatus[PropertyErrorCodes.ALL_STATUS],
            active: false,
        });
        headers.push({
            statusTypeId: PropertyErrorCodes.APPROVED,
            statusType: i18next.t(`${PropertyErrorCodes.APPROVED}`, {
                lng: data.locale,
            }),
            count: propertyCountByStatus[PropertyErrorCodes.APPROVED],
            active: data.subStatusTypeId == PropertyErrorCodes.APPROVED,
        });
        headers.push({
            statusTypeId: PropertyErrorCodes.PENDING,
            statusType: i18next.t(`${PropertyErrorCodes.PENDING}`, {
                lng: data.locale,
            }),
            count: propertyCountByStatus[PropertyErrorCodes.PENDING],
            active: data.subStatusTypeId == PropertyErrorCodes.PENDING,
        });
        headers.push({
            statusTypeId: PropertyErrorCodes.REJECTED,
            statusType: i18next.t(`${PropertyErrorCodes.REJECTED}`, {
                lng: data.locale,
            }),
            count: propertyCountByStatus[PropertyErrorCodes.REJECTED],
            active: data.subStatusTypeId == PropertyErrorCodes.REJECTED,
        });
        headers.push({
            statusTypeId: PropertyErrorCodes.ARCHIVED,
            statusType: i18next.t(`${PropertyErrorCodes.ARCHIVED}`, {
                lng: data.locale,
            }),
            count: propertyCountByStatus[PropertyErrorCodes.ARCHIVED],
            active: data.subStatusTypeId == PropertyErrorCodes.ARCHIVED,
        });

        headers.push({
            statusTypeId: PropertyErrorCodes.INCOMPLETE,
            statusType: i18next.t(`${'In_complete'}`, {
                lng: data.locale,
            }),
            count: propertyCountByStatus[PropertyErrorCodes.INCOMPLETE],
            active: data.subStatusTypeId == PropertyErrorCodes.INCOMPLETE,
        });

        if (data.version >= API_VERSION_4) {
            headers.push({
                statusTypeId: PropertyErrorCodes.SOLD,
                statusType: i18next.t(`${'SOLD'}`, {
                    lng: data.locale,
                }),
                count: propertyCountByStatus[PropertyErrorCodes.SOLD],
                active: data.subStatusTypeId == PropertyErrorCodes.SOLD,
            });
            headers.push({
                statusTypeId: PropertyErrorCodes.RENTED,
                statusType: i18next.t(`${'RENTED'}`, {
                    lng: data.locale,
                }),
                count: propertyCountByStatus[PropertyErrorCodes.RENTED],
                active: data.subStatusTypeId == PropertyErrorCodes.RENTED,
            });
        }
        return headers;
    }

    /**
     * Set property expiry date.
     * @param propertyData
     */
    public static setPropertyExpiryDate(propertyData: any) {
        if (propertyData.expiryDate) {
            const date1: any = new Date();
            const date2: any = new Date(propertyData.expiryDate);
            const Difference_In_Time = date2.getTime() - date1.getTime();

            // To calculate the no. of days between two dates
            const Difference_In_Days = Math.round(
                Difference_In_Time / (1000 * 3600 * 24)
            );
            propertyData.expiryDate = Difference_In_Days;
        }
    }

    /**
     * Set property diabled time.
     * @param propertyData
     */
    public static setPropertyDisabledTime(propertyData: any) {
        if (propertyData.successDate != null) {
            if (
                parseInt(propertyData.statusTypeId) ==
                PropertyErrorCodes.BRE_VERIFICATION
            ) {
                let addDisabletime = new Date(propertyData.successDate);
                addDisabletime.setMinutes(
                    addDisabletime.getMinutes() + PROPERTY_DISABLED_MINUTES
                );
                addDisabletime = new Date(addDisabletime);
                propertyData.disableTime = addDisabletime;
            }
        }
    }

    /**
     * Set property general info.
     * @param propertyData
     */
    public static setPropertyGeneralInfo(
        propertyData: any,
        locale: string,
        propertyStatusLogs: any,
        i18next: any
    ) {
        propertyData['general'] = {
            source: propertyData.sourceType || '',
            propertyMainType: propertyData.propertyMainType || '',
            propertyType: propertyData.propertyType || '',
            external360Link: propertyData.external360Link || '',
            externalVideoUrl: propertyData.externalVideoUrl || '',
            sourceTypeId: propertyData.sourceTypeId,
            propertyRegionType: propertyData.propertyRegionType || '',
            propertyRegionTypeId: propertyData.propertyRegionId || '',
            propertyTypeId: propertyData.mainTypeId || '',
            listingTypeId: propertyData.listingTypeId,
            managedById: propertyData.managedById || '',
            postedAs: propertyData.postedAs,
            enSlug: propertyData.enSlug || '',
            arSlug: propertyData.arSlug || '',
            darReference: PropertyServiceHelper.createDarRefForResponse(
                propertyData.darReference
            ),
            isPopularCity: [
                CITY_ID.Riyadh,
                CITY_ID.Jeddah,
                CITY_ID.Makkah,
                CITY_ID.Madinah,
            ].includes(parseInt(propertyData.cityId))
                ? true
                : false,
            status: {
                isSold: propertyData.isSold || false,
                isHotDeal: propertyData.isHotDeal || false,
                isExclusive: propertyData.isExclusive || false,
                isInspected: propertyData.isInspected || false,
                isFeatured: propertyData.isFeatured || false,
                isRecommended: propertyData.isRecommended || false,
                reason: propertyStatusLogs?.reason
                    ? propertyStatusLogs.reason
                    : '',
                isGreatPrice: propertyData.isGreatPrice || false, //new added
                reasonDate: propertyStatusLogs?.createdAt,
                isVerified: propertyData.wathqVerified
                    ? propertyData.wathqVerified
                    : false,
            },
            subStatusTypeId:
                FilterRequestSingleCodeByGroup[propertyData.statusTypeId] || '',
        };
        this.setPropertyStatus(propertyData, locale, i18next);
        this.setPropertySoldOrRentoutText(
            propertyData,
            i18next,
            propertyStatusLogs
        );
    }

    /**
     * Set property user info.
     * @param propertyData
     */
    public static setPropertyUserInfo(propertyData: any) {
        propertyData['userInfo'] = {
            userId: propertyData.userId,
            role: propertyData.role,
            fullName: propertyData.fullName,
            permissions: [],
            subuser: {
                id: propertyData.subuserId,
                fullName: propertyData.subuserFullName,
            },
        };
    }

    /**
     * Set property files.
     * @param propertyData
     */
    public static setPropertyFiles(propertyData: any) {
        const files: any = [];
        if (propertyData.PropertyFiles) {
            propertyData.PropertyFiles.map((item: any) => {
                files.push({
                    name: item.name,
                });
            });
        }
        propertyData['userPropertyFiles'] = files;
    }

    /**
     * Set property builtup and carpet area.
     * @param propertyData
     */
    public static setPropertyBuiltupCarpetArea(propertyData: any) {
        // mapping to display either carpetArea or buildtupArea based on property type
        const CARPET_AREA = 'carpetArea';
        const BUILTUP_AREA = 'builtUpArea';
        let key = null;
        if (propertyData?.mainTypeId && propertyData?.propertyTypeId) {
            const areaMapping: any = {
                // error
                [PROPERTY_TYPES.Residential]: {
                    [PROPERTY_TYPES.Villa]: CARPET_AREA,
                    [PROPERTY_TYPES.Duplex]: CARPET_AREA,
                    [PROPERTY_TYPES.Residential_Land]: CARPET_AREA,
                    [PROPERTY_TYPES.Palace]: CARPET_AREA,
                    [PROPERTY_TYPES.Residential_Building]: CARPET_AREA,
                    [PROPERTY_TYPES.Rest_House]: CARPET_AREA,
                    [PROPERTY_TYPES.Farm]: CARPET_AREA,
                    [PROPERTY_TYPES.Chalet]: CARPET_AREA,
                    [PROPERTY_TYPES.Apartment]: BUILTUP_AREA,
                },
                [PROPERTY_TYPES.Commercial]: {
                    [PROPERTY_TYPES.Building]: CARPET_AREA,
                    [PROPERTY_TYPES.Warehouse]: CARPET_AREA,
                    [PROPERTY_TYPES.Labor_Camp]: CARPET_AREA,
                    [PROPERTY_TYPES.Land]: CARPET_AREA,
                    [PROPERTY_TYPES.Showroom]: BUILTUP_AREA,
                    [PROPERTY_TYPES.Retail]: BUILTUP_AREA,
                    [PROPERTY_TYPES.Office_Space]: BUILTUP_AREA,
                },
            };
            key =
                areaMapping[propertyData.mainTypeId][
                    propertyData.propertyTypeId
                ];
            // remove either carpetArea or builtpArea from response based on property type
            if (key == CARPET_AREA) {
                delete propertyData[BUILTUP_AREA];
            } else {
                delete propertyData[CARPET_AREA];
            }
        }

        propertyData['attribute'] = {
            noOfBedrooms: propertyData.noOfBedrooms || '',
            noOfBathrooms: propertyData.noOfBathrooms || '',
            area: {
                propertyUnitType: propertyData.unitType || '',
                ...(key === CARPET_AREA
                    ? { carpetArea: propertyData[key] }
                    : { builtUpArea: propertyData[key] }),
            },
            price: {
                propertyCurrencyType: propertyData.currencyType || '',
                salePrice: propertyData.salePrice || '',
                expectedRent: propertyData.expectedRent || '',
                yearlyCharges: propertyData.yearlyCharges || '',
            },
            buildYear: propertyData.completionYear || '', // added new field
        };
    }

    /**
     * Set user property response.
     * @param propertyData
     */
    public static setUserPropertiesResponse(
        i18next: any,
        propertyData: any,
        locale: string,
        propertyStatusLogs: any
    ) {
        this.setPropertyExpiryDate(propertyData);
        propertyData.serverTime = new Date();
        this.setPropertyDisabledTime(propertyData);
        this.setPropertyGeneralInfo(
            propertyData,
            locale,
            propertyStatusLogs,
            i18next
        );
        this.setPropertyUserInfo(propertyData);
        this.setPropertyFiles(propertyData);
        this.setPropertyBuiltupCarpetArea(propertyData);
        this.setPropertyAttributeResponse(propertyData, i18next, locale);
        return propertyData;
    }

    /**
     * Set property dar reference response.
     * @param propertyData
     */
    public static createDarRefForResponse(darRef: string) {
        if (darRef) {
            const darArr = darRef.split(/[\s-]+/);
            return darArr[darArr.length - 1];
        }
        return '';
    }

    /**
     * Set property attribute response.
     * @param propertyData
     */
    public static setPropertyAttributeResponse(
        propertyData: any,
        i18next: any,
        locale: string
    ) {
        let attributes: any = [];
        propertyAttributes.forEach((attribute: any) => {
            // check if studio apartment then bedroom should display in attributes even value 0 otherwise do not display.
            const isStudioApartmentBedRoom =
                propertyData.propertyType === 'Apartment' &&
                attribute.key == 'noOfBedrooms' &&
                propertyData[attribute.key] == 0;
            if (isStudioApartmentBedRoom || propertyData[attribute.key]) {
                let newData = {
                    key: attribute.key,
                    name: i18next.t(attribute.key, { lng: locale }),
                    value: propertyData[attribute.key],
                    image: attribute.image,
                    unit: propertyData[attribute.unitKey] || '',
                    iconClass: attribute.iconClass,
                };
                if (
                    attribute.key == 'completionYear' &&
                    propertyData[attribute.key]
                ) {
                    newData.value =
                        new Date().getFullYear() - propertyData[attribute.key];
                    if (
                        !newData.value ||
                        isNaN(newData.value) ||
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
                    value: propertyData[attribute.key] || '',
                    image: attribute.image || '',
                    unit: propertyData[attribute.unitKey] || '',
                    iconClass: '',
                };
                attributes.push(newData);
            }
        });
        propertyData['attributes'] = attributes;
    }

    /**
     * Get all status along with occupied.
     * @param version version number
     * @returns
     */
    public static GetGroupStatusAll(version?: number) {
        let allStatus = GroupStatusCodes.GROUP_STATUS_ALL;
        if (version && version >= API_VERSION_4) {
            // Get sold or rented.
            allStatus = GroupStatusCodes.GROUP_STATUS_ALL_V4;
        }
        return allStatus;
    }

    /**
     * sold rented properties displays after other properties.
     * @param properties  user properties array
     * @param version version number
     */
    public static moveSoldRentedPropertiesAtLast(
        properties: any,
        version?: number
    ) {
        if (version >= API_VERSION_4) {
            const soldRentedProperties = properties.filter(
                (property: any) =>
                    property.statusTypeId == PropertyErrorCodes.OCCUPIED
            );
            properties = properties.filter(
                (property: any) =>
                    property.statusTypeId != PropertyErrorCodes.OCCUPIED
            );
            properties.push(...soldRentedProperties);
        }
        return properties;
    }

    /**
     * Set property sold out or rent out text.
     * @param propertyData property data
     */
    private static setPropertySoldOrRentoutText(
        propertyData: any,
        i18next: any,
        propertyStatusLogs: any
    ) {
        const { propertyStatusTypeId } = propertyData.general;
        if (
            propertyStatusTypeId == PropertyErrorCodes.SOLD ||
            propertyStatusTypeId == PropertyErrorCodes.RENTED
        ) {
            const statusText =
                propertyStatusTypeId == PropertyErrorCodes.SOLD
                    ? SOLD_TEXT
                    : RENTED_TEXT;

            const days = moment(propertyStatusLogs.createdAt).diff(
                moment(propertyData.createdAt),
                'days'
            );
            let template = '';
            switch (days) {
                case 0:
                    template = i18next.t(`${statusText}_OUT_LESS_DAY`);
                    break;
                case 1:
                    template = i18next.t(`${statusText}_OUT_DAY`);
                    break;
                default:
                    template = i18next.t(`${statusText}_OUT_DAYS`);
                    break;
            }

            template = template
                .replace('<x>', days.toString())
                .replace(
                    '<date>',
                    moment(propertyStatusLogs.createdAt).format('Do MMMM YYYY')
                );
            propertyData['general'].occupiedDays = template;
        }
    }

    /**
     * Set property status text and status type id in property data.
     * @param propertyData property data
     * @param locale  locale
     * @param i18next
     */
    private static setPropertyStatus(
        propertyData: any,
        locale: string,
        i18next: any
    ) {
        i18next.changeLanguage(locale);
        let statusTypeId = propertyData.statusTypeId || '';
        if (propertyData.statusTypeId == PropertyErrorCodes.OCCUPIED) {
            statusTypeId =
                propertyData.listingTypeId == PropertyListingType.Rent
                    ? PropertyErrorCodes.RENTED
                    : PropertyErrorCodes.SOLD;
        }
        let statusType = propertyData.propertyStatusType || '';
        if (statusTypeId == PropertyErrorCodes.RENTED) {
            statusType = i18next.t('RENTED');
        }
        if (statusTypeId == PropertyErrorCodes.SOLD) {
            statusType = i18next.t('SOLD');
        }
        propertyData['general']['propertyStatusType'] = statusType;
        propertyData['general']['propertyStatusTypeId'] = statusTypeId;
    }

    // Get step data
    public static async GetStepData(
        postData: any,
        locale: string,
        ammentiesCallBack: any
    ) {
        const {
            listingTypeId,
            cityId,
            titleDeedNo,
            latitude,
            longitude,
            address,
            PropertyVerificationInfo,
            Property,
        } = postData;
        const propertyAttribute =
            Property?.dataValues.PropertyAttribute?.dataValues;
        const propertyFiles = Property?.dataValues.PropertyFiles?.length;
        const propertyTypeId = Property?.dataValues?.propertyTypeId;
        const skiPropertyTypes = [
            PropertySlugEnum.ResidentialLand,
            PropertySlugEnum.Building,
            PropertySlugEnum.Retail,
            PropertySlugEnum.OfficeSpace,
            PropertySlugEnum.WareHouse,
            PropertySlugEnum.LaborCamp,
            PropertySlugEnum.ShowRoom,
            PropertySlugEnum.Land,
        ];
        let amanitiesCount = 0;
        const skip =
            skiPropertyTypes.filter((item) => item == propertyTypeId).length >
            0;
        const skipPropertyFilesCheck =
            [PropertySlugEnum.ResidentialLand, PropertySlugEnum.Land].filter(
                (item) => item == propertyTypeId
            ).length > 0;
        const description = Property?.PropertyTranslations.find(
            (item: any) => item.locale == locale
        )?.description;
        const title = Property?.PropertyTranslations.find(
            (item: any) => item.locale == locale
        )?.title;
        if (propertyTypeId && !skip) {
            amanitiesCount = await ammentiesCallBack();
        }
        // if rented property then set true otherwise value of wathqVerified.
        const isVerified =
            PropertyVerificationInfo?.dataValues?.wathqVerified || false;
        return {
            propertyTypeId,
            listingTypeId,
            cityId,
            titleDeedNo,
            lattitude: latitude,
            longitude,
            address,
            identity: PropertyVerificationInfo?.dataValues?.identity,
            identityNumber:
                PropertyVerificationInfo?.dataValues?.identityNumber,
            isVerified,
            facingId: propertyAttribute?.facingId,
            builtUpArea: propertyAttribute?.builtUpArea,
            noOfBedrooms: propertyAttribute?.noOfBedrooms,
            noOfBathrooms: propertyAttribute?.noOfBathrooms,
            noOfLivingrooms: propertyAttribute?.noOfLivingrooms,
            noOfGuestrooms: propertyAttribute?.noOfGuestrooms,
            noOfParkings: propertyAttribute?.noOfParkings,
            noOfFloors: propertyAttribute?.noOfFloors,
            floorNumber: propertyAttribute?.floorNumber,
            filesCount: skipPropertyFilesCheck ? 0 : propertyFiles || 0,
            amenitiesCount: amanitiesCount,
            skipAmentiesCheck: skip,
            description: description,
            title: title,
            skipPropertyFilesCheck: skipPropertyFilesCheck,
            authType: Property?.dataValues?.authType,
            authDraft: PropertyVerificationInfo?.dataValues.authDraft || false,
        };
    }

    /**
     * Get Step Response
     * @param postData property data
     * @param locale locale en || ar
     * @param ammentiesCallBack amenties count call back function
     * @returns
     */
    public static async GetStepDataResponse(
        postData: any,
        locale: string,
        ammentiesCallBack: any,
        version?: number,
        roleId?: number
    ) {
        const stepData: any = await this.GetStepData(
            postData,
            locale,
            ammentiesCallBack
        );
        i18next.changeLanguage(locale);

        // step response rules.
        const basicDetailsRule = {
            listingTypeId: 'required',
            cityId: 'required',
        };
        const propertyVerificationRule = {
            identity: 'required',
        };
        const LocationRule = {
            lattitude: 'required',
            longitude: 'required',
        };
        const propertyDetailRule = {
            propertyTypeId: 'required',
        };
        const propertyFeatureRule = {
            noOfBedrooms: 'required',
            noOfBathrooms: 'required',
            noOfLivingrooms: 'required',
            noOfGuestrooms: 'required',
        };
        const propertyFileRule = {
            filesCount: 'required|min:1',
        };
        const amenityStepRule = stepData.skipAmentiesCheck
            ? {}
            : {
                  title: 'required',
                  description: 'required',
              };
        let stepResponse: any = [];
        stepResponse.push(
            this.validateStep(
                i18next.t('BASIC_DETAILS'),
                basicDetailsRule,
                stepData,
                locale
            )
        );
        stepResponse.push(
            this.validateStep(
                i18next.t('PROPERTY_LOCATION'),
                LocationRule,
                stepData,
                locale
            )
        );
        stepResponse.push(
            this.validateStep(
                i18next.t('PROPERTY_DETAILS'),
                propertyDetailRule,
                stepData,
                locale
            )
        );
        stepResponse.push(
            this.validateStep(
                i18next.t('PROPERTY_FEATURES'),
                propertyFeatureRule,
                stepData,
                locale
            )
        );
        if (!stepData.skipPropertyFilesCheck) {
            stepResponse.push(
                this.validateStep(
                    i18next.t('PHOTOS_VIDEOS'),
                    propertyFileRule,
                    stepData,
                    locale
                )
            );
        }
        stepResponse.push(
            this.validateStep(
                i18next.t('AMENITIES'),
                amenityStepRule,
                stepData,
                locale
            )
        );

        // property authorization step.
        if (roleId == RoleIdEnums.BROKER) {
            const authTypeRule = {
                authType: 'required',
                authDraft: 'required',
            };
            stepResponse.push(
                this.validateStep(
                    i18next.t('PROPERTY_AUTHORIZATION'),
                    authTypeRule,
                    stepData.authDraft ? false : stepData,
                    locale
                )
            );
        }
        // property verification step.
        const propertyVerification = {
            ...this.validateStep(
                i18next.t('PROPERTY_VERIFICATION'),
                propertyVerificationRule,
                stepData.isVerified ? stepData : false,
                locale
            ),
            isVerified: stepData.isVerified || false,
        };
        if (version >= API_VERSIONS.V3) {
            stepResponse.push(propertyVerification);
        } else {
            const verificationStepPos = 1;
            stepResponse.splice(verificationStepPos, 0, propertyVerification);
        }
        return stepResponse;
    }

    /**
     * validate data for given step
     * @param step step name
     * @param stepDataRule validator js rule
     * @param data step data
     * @param locale locale en or ar
     * @returns step object with step name and isValid. isValid true only if stepDataRule are passed.
     */
    private static validateStep = (
        step: string,
        stepDataRule: any,
        data: any,
        locale = 'en'
    ) => {
        const validation = new Validator(data, stepDataRule);
        Validator.useLang(locale);
        let stepResult: any = {};
        stepResult['step'] = i18next.t(step);
        stepResult['isValid'] = validation.passes();
        return stepResult;
    };
}
