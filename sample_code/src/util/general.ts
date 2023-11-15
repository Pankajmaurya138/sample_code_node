import {
    isEmpty,
    pickBy,
    identity,
    isArray,
    take,
    uniqBy,
    cloneDeep,
} from 'lodash';
import * as fs from 'fs';
import PropertyRepo from '../v1/repositories/property.repository';
import {
    propertySubTypes,
    nonAmetiesPropertyTypes,
    mainPropertyMapping,
} from '../util/constant';
import { setImageFiles } from '../util/xmlUtils';
import { FilePath, ENUMS, PropertyErrorCodes } from '../util/enums';

export const getOptionTypeName = async (name: any) => {
    let lowerName = name?.toLowerCase();
    const _propSybTypes = cloneDeep(propertySubTypes);
    let result = null;
    while (_propSybTypes.length) {
        const optionName = _propSybTypes.shift();
        if (!optionName) {
            result = 'villa';
        }
        if (lowerName.indexOf(optionName) > -1) {
            result = optionName;
            _propSybTypes.length = 0;
        }
    }

    if (result === 'home') {
        result = 'house';
    } else if (result === 'wooden') {
        result = 'chalet';
    }

    return result;
};

const getPropertyMainTypeId = async (tiny: any, mainPropertyMapping: any) => {
    let mainTypeId = null;
    const residentialSubTypes = mainPropertyMapping.residential.subTypes;
    const commercialSubTypes = mainPropertyMapping.commercial.subTypes;

    if (tiny.indexOf('commercial') > -1) {
        mainTypeId = mainPropertyMapping.commercial.id;
    } else if (tiny.indexOf('residential') > -1) {
        mainTypeId = mainPropertyMapping.residential.id;
    } else if (residentialSubTypes.includes(tiny)) {
        mainTypeId = mainPropertyMapping.residential.id;
    } else if (commercialSubTypes.includes(tiny)) {
        mainTypeId = mainPropertyMapping.commercial.id;
    }
    return mainTypeId;
};

const getData = async (prop: any, type: any) => {
    switch (type) {
        case 'getlistingTypeId': {
            /* It is for Purpose on FE which is sale or rent */
            const getlistingTypeId: any = await PropertyRepo.getlistingTypeId(
                prop
            );
            return getlistingTypeId?.id || 3;
            break;
        }

        case 'optionTypeId': {
            const getOptionTypeId: any =
                await PropertyRepo.getPropertyTypeOptionId(prop);
            return getOptionTypeId?.id || 141;
            break;
            // optionTypeId is not being used on FE side.
        }

        case 'propertyTypeId': {
            /* It is for Residential - villa/appartment/house/Building etc  */
            /* It is for Commercial - Retail/Office Space/Warehouse/Labor Camp/Building/Showroom etc  */
            const getOptionTypeId: any = await PropertyRepo.getPropertyTypeId(
                prop
            );
            prop.propertySubTypeSlug =
                prop?.mainPropertyType?.en || prop?.mainPropertyType || '';
            return getOptionTypeId?.id;
            break;
        }
        case 'mainTypeId': {
            /* 1 for commercial */
            /* 2 for Residential */
            /* property_type_translations: where:{name:"residential"}  */
            let type: any = prop.mainPropertyType;
            let id: any = null;
            if (typeof type === 'object') {
                const { en = '' } = type;
                type = en?.toLowerCase();
            }

            if (type?.indexOf(' ') > -1) {
                const arr = type.split(' ');
                while (arr.length) {
                    let text = arr.shift();
                    id = await getPropertyMainTypeId(text, mainPropertyMapping);
                    if (id) {
                        arr.length = 0;
                    }
                }
            } else {
                id = await getPropertyMainTypeId(type, mainPropertyMapping);
            }
            prop.mainTypeId = id;
            prop.mainPropertyType = type;
            prop.mainPropertyTypeSlug =
                prop?.mainPropertyType?.en || prop?.mainPropertyType || '';
            if (prop.mainTypeId === mainPropertyMapping.residential.id) {
                prop.mainPropertyType = 'residential';
            } else if (prop.mainTypeId === mainPropertyMapping.commercial.id) {
                prop.mainPropertyType = 'commercial';
            }
            return prop.mainTypeId;
        }

        case 'managedById': {
            return 54; // type_masters: where:{type:"property_managed_by", slug:"dar-al-arkan-team"}
            break;
        }
        case 'getUnitTypeId': {
            return 23; // property_attributes.unit_type_id
            break;
        }

        case 'sourceTypeId': {
            const getSourceTypeId: any = await PropertyRepo.getSourceTypeId(
                prop
            );
            return getSourceTypeId?.id || 68;
            break;
        }

        case 'propertyRegionId': {
            const getPropertyRegionId: any =
                await PropertyRepo.getPropertyRegionId(prop);
            return getPropertyRegionId?.id || 57;
            break;
        }

        case 'location': {
            const locationDBData: any = await PropertyRepo.getLocationDetails(
                prop
            );
            const address = PropertyRepo.createAddress(locationDBData);
            const location: any = { en: {}, ar: {} };
            const {
                countryId = null,
                cityId = null,
                zoneId = null,
                cityLat = '',
                cityLong = '',
            } = locationDBData || {};
            location['countryId'] = countryId;
            location['cityId'] = cityId;
            location['zoneId'] = zoneId;
            location['latitude'] = prop?.location?.latitude || cityLat;
            location['longitude'] = prop?.location?.longitude || cityLong;
            location['landmark'] =
                prop?.location_detail || prop?.location?.location_detail;
            location['en']['address'] = address?.enTitle;
            location['ar']['address'] = address?.arTitle;
            location['address'] = address?.enTitle;
            location['citySlug'] = prop?.province;
            location['countrySlug'] = prop?.country;
            return pickBy(location, identity);
        }
    }
};

const getArrayOfFileUrls: any = (fileArr: any) => {
    const arrList = fileArr.map((obj: any) => obj.url);
    return arrList;
};

const getAllPropImages: any = async (prop: any) => {
    return new Promise((resolve: any) => {
        var files: any = prop?.images?.image || [];
        if (files.length > ENUMS.MAX_FILE_DOWNLOAD) {
            files = take(files, ENUMS.MAX_FILE_DOWNLOAD);
        }
        if (!isArray(files) || !files.length) {
            return resolve([]);
        }
        const fileUrls = getArrayOfFileUrls(files);
        const setImageFilesPromise: any = [];
        fileUrls.forEach((url: any) => {
            setImageFilesPromise.push(setImageFiles([url], prop?.userId));
        });
        const imageDataArr: any = [];
        Promise.all(setImageFilesPromise)
            .then((results) => {
                results.forEach((data: any) => {
                    if (data.length) {
                        imageDataArr.push(data[0]);
                    }
                });
                console.log(
                    `************ ${imageDataArr.length} Image processed for property id:${prop.id}.`
                );
                return resolve(imageDataArr || []);
            })
            .catch((err) => {
                console.log('err in getAllPropImagesFn:', err);
                return resolve(imageDataArr || []);
            });
    });
};

const getAllAmenities: any = (prop: any) => {
    return new Promise((resolve) => {
        let amenities: any = [];
        if (!nonAmetiesPropertyTypes.includes(prop.type)) {
            let allXmlFeatures = prop.features?.feature || [];
            if (!allXmlFeatures.length) {
                allXmlFeatures = [];
            }
            const getAmenityPromise: any = [];
            allXmlFeatures.forEach((feature: any) => {
                if (feature.indexOf(' ') > -1) {
                    const arr = feature.split(' ');
                    arr.forEach((tiny: any) => {
                        tiny = tiny?.toLowerCase();
                        getAmenityPromise.push(PropertyRepo.getAmenity(tiny));
                    });
                } else {
                    feature = feature?.toLowerCase();
                    getAmenityPromise.push(PropertyRepo.getAmenity(feature));
                }
            });
            Promise.all(getAmenityPromise)
                .then((data) => {
                    data.forEach((result: any) => {
                        if (result) {
                            amenities.push({ amenityId: result?.id });
                        }
                    });

                    if (allXmlFeatures.includes('garage')) {
                        // garage because this ID mapped on FE
                        amenities.push({ amenityId: '5' });
                    }

                    if (allXmlFeatures.includes('kitchen')) {
                        // kitchen because this ID mapped on FE
                        amenities.push({ amenityId: '44' });
                    }

                    console.log(
                        '************ Amenities Mapped ************',
                        amenities?.length
                    );
                    const uniqueAmenties = uniqBy(amenities, 'amenityId');
                    return resolve(uniqueAmenties);
                })
                .catch(() => {
                    console.log(
                        '************ Amenities Mapped ************',
                        amenities?.length
                    );
                    return resolve(amenities);
                });
        } else {
            console.log(
                `************ Amenites Processing Skipped for NonAmeties property - ${prop?.type} ************`
            );
            return resolve(amenities);
        }
    });
};

export const validateRequiredData = (data: any) => {
    const errors: any = [];
    const {
        location: {
            countryId,
            cityId,
            zoneId,
            citySlug,
            countrySlug,
            latitude,
            longitude,
        },
        generalInfo = {},
        attribute: {
            price: { currencyTypeId, salePrice },
        },
    } = data;

    let {
        other: { unitReference },
        propertyTypeId,
        propertySubTypeSlug,
        mainPropertyTypeSlug,
        mainTypeId,
    } = generalInfo;

    unitReference = unitReference.toString();

    if (!countryId) {
        errors.push({
            error: `countryId is not found in our system for unitReference id ${unitReference}. Missing country name: ${countrySlug}`,
            propertyNo: unitReference,
        });
    }

    if (!currencyTypeId) {
        errors.push({
            error: `currency is not found in our system for unitReference id ${unitReference}.`,
            propertyNo: unitReference,
        });
    }

    if (!cityId) {
        errors.push({
            error: `cityId is not found in our system for unitReference id ${unitReference}. Missing city Name: ${citySlug} ${
                countryId
                    ? ', under countryName: ' +
                      countrySlug +
                      ', countryId - ' +
                      countryId
                    : ''
            }.`,
            propertyNo: unitReference,
        });
    }

    if (!salePrice) {
        errors.push({
            error: `Sale price is not found in our system for unitReference id ${unitReference}. Missing price`,
            propertyNo: unitReference,
        });
    }

    if (!propertyTypeId) {
        errors.push({
            error: `property sub type is not found in our system for unitReference id ${unitReference}. Missing type ${propertySubTypeSlug}`,
            propertyNo: unitReference,
        });
    }

    if (!mainTypeId) {
        errors.push({
            error: `property main type is not found in our system for unitReference id ${unitReference}. Missing type ${mainPropertyTypeSlug}`,
            propertyNo: unitReference,
        });
    }

    if (!latitude || !longitude) {
        errors.push({
            error: `latitude/longitude is neither available in XML file nor in our system or for property id ${unitReference}.`,
            propertyNo: unitReference,
        });
    }

    return errors;
};

export const makePropertyObject = (prop: any) => {
    return new Promise(async (resolve) => {
        let currencyCode = prop?.currency || null;
        currencyCode = currencyCode?.toLowerCase();
        const promiseArr: any = [
            {
                listingTypeId: await getData(prop, 'getlistingTypeId'),
                // optionTypeId: await getData(prop, 'optionTypeId'),
                propertyTypeId: await getData(prop, 'propertyTypeId'),
                mainTypeId: await getData(prop, 'mainTypeId'),
                managedById: await getData(prop, 'managedById'),
                sourceTypeId: await getData(prop, 'sourceTypeId'),
                propertyRegionId: await getData(prop, 'propertyRegionId'),
                location: await getData(prop, 'location'),
                amenity: await getAllAmenities(prop),
                images: await getAllPropImages(prop),
                currencyDetails:
                    (await PropertyRepo.getCurrencyId(currencyCode)) || {},
                unitTypeId: await getData(prop, 'getUnitTypeId'),
            },
        ];

        Promise.all(promiseArr)
            .then(async (res: any) => {
                const {
                    listingTypeId,
                    // optionTypeId,
                    propertyTypeId,
                    mainTypeId,
                    managedById,
                    sourceTypeId,
                    propertyRegionId,
                    location,
                    amenity,
                    images,
                    currencyDetails: { id: currencyTypeId = null },
                    unitTypeId,
                } = res[0] || {};
                const completionYear =
                    new Date().getFullYear() - prop.new_build || 2022;

                let newBuildArea =
                    prop?.surface_area?.built || prop?.built || null;
                newBuildArea = Math.round(newBuildArea);
                let newLandArea =
                    prop?.surface_area?.plot || prop?.plot || null;
                newLandArea = Math.round(newLandArea);
                let type = prop?.type || '';
                type = type?.toLowerCase();
                let isNotAnAppartmnt = !type.includes('apartment');
                if (isNotAnAppartmnt && !newLandArea) {
                    newLandArea = newBuildArea;
                }

                const postData: any = {
                    // id:'', // If id will be in this object then it will be update otherwise it will create
                    generalInfo: {
                        source: prop.xmlUrl,
                        listingTypeId,
                        area: prop.surface_area?.built,
                        // optionTypeId,
                        propertyTypeId,
                        propertySubTypeSlug: prop?.propertySubTypeSlug,
                        mainTypeId,
                        mainPropertyTypeSlug: prop?.mainPropertyTypeSlug,
                        managedById,
                        other: {
                            sourceTypeId,
                            external360Link: null,
                            externalVideoLink: null,
                            isWhatsappLater: false,
                            unitReference: prop?.id,
                            propertyMainType: mainTypeId,
                        },
                        propertyRegionId,
                        userId: prop?.userId,
                        external_360_link: null,
                    },
                    file: {
                        images,
                    },
                    translation: {
                        en: {
                            developerName: null,
                            projectName: null,
                            title: 'Hello',
                            address: location?.en?.address,
                            description: prop?.desc?.en || '',
                        },
                        ar: {
                            title: 'Hello',
                            address: location?.ar?.address,
                            description: prop?.desc?.ar || '',
                        },
                    },
                    attribute: {
                        area: {
                            isAlreadyLeased: true,
                            builtUpArea: newBuildArea,
                            carpetArea: newLandArea || null,
                            unitTypeId: unitTypeId,
                            completionYear: completionYear,
                            // leaseAmount:2227
                            // leaseContractEndDate:new Date()
                        },
                        general: {
                            noOfBedrooms: prop?.beds || null,
                            noOfBathrooms: prop?.baths || null,
                            // noOfRetailOutlets:10 || null,
                            // floorNumber:12 || null,
                            // noOfWaterWells:2,
                            // noOfApartments:3,
                            // noOfFloors:5,
                            // noOfParkings:4,
                            // noOfPalmTrees:5,
                            // streetWidth:100,
                        },
                        type: {
                            // furnishingTypeId:''
                        },
                        price: {
                            currencyTypeId,
                            salePrice: prop?.price || null,
                            // expectedRent:22323,
                            // yearlyCharges:1212,
                            // monthlyChargeRange:12122,
                        },
                    },
                    amenity,
                    locale: 'en',
                    location,
                };
                return resolve(postData);
            })
            .catch((err: any) => {
                console.log('Error in makePropertyObjectFn promise block', err);
            });
    });
};

export const arrIterator = (arr: any = [], start = 0, end = Infinity) => {
    let nextIndex = start;
    let index = 0;

    const rangeIterator = {
        next: function () {
            let result;
            if (nextIndex <= end) {
                result = { value: arr[nextIndex], index, done: false };
                nextIndex += 1;
                index++;
                return result;
            }
            return { value: index, done: true };
        },
    };
    return rangeIterator;
};

export const checkSingleProp = (prop: any, index: number) => {
    index = index + 1;
    return new Promise((resolve) => {
        const errors: any = [];
        let propertyObj: any = {};
        let nonPropertyObj: any = {};
        const propRef = prop?.id?.toString();

        let {
            surface_area = {},
            province = '',
            price_freq = '',
            price = '',
            id = '',
            location = {},
        } = prop || {};

        const { built, plot } = surface_area || {};
        let lower_price_freq = price_freq?.toLowerCase();

        if (!id || id == '') {
            errors.push({
                error: `<id> is not available or havin empty value in XML file for property id ${propRef}`,
                propertyNo: propRef,
            });
        }

        if (!price) {
            errors.push({
                error: `<price> is not available in XML file for property id ${propRef}.`,
                propertyNo: propRef,
            });
        } else {
            let newString = price?.toString() || null;
            if (isNaN(Number(newString)) || Number(newString) === 0) {
                errors.push({
                    error: `<price> should be number convertible or greater than 0, in XML file for property id ${propRef}.`,
                    propertyNo: propRef,
                });
            }
        }

        if (!price_freq || isEmpty(price_freq)) {
            errors.push({
                error: `<price_freq> is not available in XML file for property id ${propRef}.`,
                propertyNo: propRef,
            });
        }

        if (!['sale'].includes(lower_price_freq)) {
            errors.push({
                error: `<price_freq> should be 'sale' in XML file for property id ${propRef}, found: ${price_freq}`,
                propertyNo: propRef,
            });
        }

        if (!prop?.type) {
            errors.push({
                error: `<type> is not available in XML file for property id ${propRef}.`,
                propertyNo: propRef,
            });
        }

        if (!prop?.country) {
            errors.push({
                error: `<country> is not available in XML file for property id ${propRef}.`,
                propertyNo: propRef,
            });
        }

        if (!province) {
            errors.push({
                error: `<province> is not available in XML file for property id ${propRef}.`,
                propertyNo: propRef,
            });
        }

        if (!prop?.currency) {
            errors.push({
                error: `<currency> is not available in XML file for property id ${propRef}.`,
                propertyNo: propRef,
            });
        }

        if (!surface_area || isEmpty(surface_area)) {
            errors.push({
                error: `<surface_area> is not available in XML file for property id ${propRef}.`,
                propertyNo: propRef,
            });
        }

        if (!built && !plot) {
            errors.push({
                error: `<built> or <plot> is not available in XML file for property id ${propRef}.`,
                propertyNo: propRef,
            });
        }

        if (errors.length) {
            nonPropertyObj = prop;
        } else {
            propertyObj = prop;
        }
        resolve({ nonPropertyObj, propertyObj, errors });
    });
};

export const validateJSONForProperty = (jsonData: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { property = [] } = jsonData || {};
            let mainPropArray: any = [];
            const nonPropertyArr: any = [],
                propertyArr: any = [];
            let validationErrors: any = [];
            const it = arrIterator(property, 0, property?.length - 1);
            let result: any = it.next();

            while (!result.done) {
                const prop = result?.value || {};
                prop.country = prop.country ? prop.country : jsonData?.country;
                prop.currency = prop.currency
                    ? prop.currency
                    : jsonData?.currency;
                prop.mainPropertyType = cloneDeep(prop.type || '');
                const index = result.index;
                const {
                    nonPropertyObj,
                    propertyObj,
                    errors: rowErrors,
                }: any = await checkSingleProp(prop, index);

                if (!isEmpty(propertyObj)) {
                    propertyArr.push(propertyObj);
                } else {
                    nonPropertyArr.push(nonPropertyObj);
                }

                if (rowErrors?.length) {
                    validationErrors = validationErrors.concat(rowErrors);
                } else {
                    const {
                        id,
                        ref,
                        currency,
                        price,
                        price_freq,
                        country,
                        province,
                    } = prop;
                    let obj = {
                        id,
                        ref,
                        currency,
                        price,
                        price_freq,
                        country,
                        province,
                    };
                    mainPropArray.push(obj);
                }
                result = it.next();
            }

            if (!isEmpty(validationErrors)) {
                // Log Error in DB for validationErrors
                resolve({
                    validationErrors,
                    propertyArr,
                });
            } else {
                let newProperties: any = [];
                newProperties = [property[0]];
                resolve({
                    propertyArr,
                    validationErrors,
                });
            }
        } catch (err: any) {
            console.log(
                '\n\n ***********  Error in validateJSONForPropertyFn():',
                err
            );
            resolve(err);
        }
    });
};

export const startDeleteingFiles = (files: any) => {
    while (files.length) {
        const img = files.shift();
        const fullPath = `${FilePath.TEMP_PATH}${img}`;
        deleteFile(fullPath);
    }
};

export const deleteFile = async (fileCompletePath: any) => {
    return fs.unlinkSync(fileCompletePath);
};

export const selectProps = (...props: any) => {
    return function (obj: any) {
        const newObj: any = {};
        props.forEach((name: any) => {
            newObj[name] = obj[name];
        });
        newObj['totalProperties'] =
            newObj['successCount'] + newObj['failureCount'];
        newObj.createdAt = newObj?.createdAt.toString();
        return newObj;
    };
};

export const setErrorMessageForGrpc = (e: any) => {
    let responseData: any = {};
    let exception = e.message.split('||');
    responseData.error = {
        code: exception[0],
        message: exception[0],
    };
    responseData.error.code = exception[0];
    if (exception.length == 1) {
        responseData.error.code = PropertyErrorCodes.DATABASE_ERROR;
        responseData.error.message = exception[0];
    }
    return responseData;
};
