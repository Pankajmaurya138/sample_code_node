import pug from 'pug';
import fs from 'fs';
import { formatWathqRes } from '../services/property.service';
import i18next from 'i18next';
import {
    ENUMS,
    propertyTypeMasterEnums,
    Locale,
    noOfstreet,
    PropertyListingType,
} from '../util/enums';
import logger from '../util/logger';
import { utilityService } from '../services/utility.service';
import { PropertyTypesTranslation } from '../models/propertyTypeTranslations.model';
import { TitleRules } from '../models/titleRules.model';
import { TypeMasterTranslation } from '../models/typeMasterTranslation.model';
import { FURNISHED_TYPE_ID, SEMI_FURNISHED_TYPE_ID } from '../util/constant';

// English and Arabic prefix and Suffix for title generation
const TitleMapping = {
    residencyTypePrefix: 'for',
    arResidencyTypePrefix: 'لل',
    noOfBedRoomPrefix: 'with ',
    arNoOfBedRoomPrefix: 'ب',
    noOfBedRoomSuffix: 'bedroom',
    noOfBedRoomSuffix2: 'bedrooms',
    arNoOfBedRoomSuffix: ' غرفة ',
    arNoOfBedRoomSuffix_1: 'غرفة ',
    arNoOfBedRoomSuffix_2: 'غرفتين ',
    arNoOfBedRoomSuffix3_OR_4: 'غرف ',
    streetWidthPrefix: 'on ',
    streetWidthSuffix: ' width street ',
    arStreetWidthSuffix: 'م ',
    noOfStreetPrefix: 'located on ',
    noOfStreetSuffix: 'streets',
    arNoOfStreetSUffix_1: ' شارع ',
    arNoOfStreetSUffix_2: ' شارعين ',
    arNoOfStreetSUffix3_OR_4: ' شوارع ',
    arNoOfStreetPrefix: 'على',
    facingPrefix: 'facing ',
    arFacingPrefix: ' واجهة ',
    noOfFloorPrefix: 'with',
    arNoOfFloorPrefix: ' ب',
    noOfFloorSuffix: ' floors ',
    arNoOfFloorSuffix_1: 'دور',
    arNoOfFloorSuffix_2: 'دورين',
    arNoOfFloorSuffix_3_to_10: 'أدوار',
    arNoOfFloorSuffix_11_OR_more: 'دور',
    noOfApartmentPrefix: 'apartment ',
    noOfApartmentPrefix2: 'apartments ',
    arNoOfApartmentPrefix: ' مع',
    noOfApartmentSuffix: 'with',
    arNoOfApartmentSuffix_1: ' شقة ',
    arNoOfApartmentSuffix_2: ' شقتين ',
    arNoOfApartmentSuffix_3_OR_more: 'شقق ',
    noOfGuestRoomsPrefix: 'with',
    arNoOfGuestRoomsPrefix: 'ب',
    noOfGuestRoomsSuffix_1: ' guest room',
    noOfGuestRoomsSuffix_2: ' guest rooms',
    arNoOfGuestRoomsSuffix_1: 'مجلس واحد ',
    arNoOfGuestRoomsSuffix_2: 'مجلسين ',
    arNoOfGuestRoomsSuffix_3_OR_more: 'مجالس ',
    meter: 'm',
    arMeter: 'م ',
    enAnd: ' and ',
    enAreaUnit: 'SQM',
    arAreaUnit: 'متر مربع',
    streetWidthSeprator: 'and',
    commaSeparator: ',',
    arCommaSeparator: '،',
    Studio: 'Studio',
    arStudio: 'ستوديو',
    NoOfBedroomCount: '9+',
    arNoOfBedroomCount: '+9',
    enSingle: 'Single',
    arSingle: 'عزاب',
    arStreetWidthPrefix: 'على',
    arStreetWidthSufix: 'شارع',
};

/**
 * post data property mapping with title attribute
 */
const TITLE_ATTR_DATA_MAPPING: any = {
    property_type: 'propertyTypeId',
    landArea: 'landArea',
    builtUpArea: 'builtUpArea',
    furnished_type: 'furnishingTypeId',
    no_of_bedrooms: 'Bedroom',
    noOfStreet: 'noOfStreet',
    noOfApartments: 'noOfApartments',
    no_of_floors: 'ApartmentTotalFloor',
    residency_type: 'residenceTypeId',
    no_of_guestrooms: 'GuestRoom',
    'street _width': 'StreetInfo',
    'facing_type ': 'StreetInfo',
};

const descStaticText: any = {
    en: {
        studio: 'studio',
    },
    ar: {
        forSale: 'للبيع',
        forRent: 'للتأجير',
        forSingles: 'للعزاب',
        studio: 'ستوديو',
        zone: 'حي',
    },
};

const maxFloorCount = 2;

// generate title logic for english and arabic
export const generateTitle = async (postData: any) => {
    let propertyTitle: any = {};
    let data = await TitleRules.findAll({
        where: {
            listingTypeId: postData.listingTypeId,
            entityTypeId: postData.propertyTypeId,
        },
    });

    // sort title rules weightage in desc order
    let sortedOrder = data
        .slice()
        .sort((a: any, b: any) => a.weightage - b.weightage);

    let titleAttributes: any = {};
    sortedOrder.forEach((item: any) => {
        let attr: any = {};
        if (item.weightage) {
            attr[item.attributeName] = item.weightage;
            titleAttributes = {
                ...attr,
                ...titleAttributes,
            };
        }
    });

    let propertyAttr = await setWeightedLogic(postData, titleAttributes);
    propertyAttr.listingTypeId = postData.listingTypeId;
    propertyTitle.enTitle = setEnglishTitle(propertyAttr);
    propertyTitle.arTitle = setArabicTitle(propertyAttr);
    return propertyTitle;
};

function getAttributes(postData: any, attributes: any) {
    const excludeAttributes: string[] = [];

    // remove attribute where data does not exists.
    Object.keys(TITLE_ATTR_DATA_MAPPING).forEach((key: string) => {
        const postDataProperty = TITLE_ATTR_DATA_MAPPING[key];
        if (!postData[postDataProperty]) {
            excludeAttributes.push(key);
        } else {
            // exception case
            if (postDataProperty == 'StreetInfo') {
                if (!postData[postDataProperty].streetfacing1) {
                    excludeAttributes.push('facing_type ');
                }
                if (!postData[postDataProperty].streetwidth1) {
                    excludeAttributes.push('street _width');
                }
            }
        }
    });

    // BR06: street width will show only if No. of street is 1
    if (postData.noOfStreet > 1) {
        excludeAttributes.push('street _width');
    }

    //  BR07: No. of streets will show only if No. of street is more than 2 streets
    if (postData.noOfStreet <= 2) {
        excludeAttributes.push('noOfStreet');
    }

    // BR08: Facing will show only if No. of street is maximum 2 streets
    if (postData.noOfStreet > 2) {
        excludeAttributes.push('facing_type ');
    }

    // BR09: No. of floors will show only if No. of floors is is more than 1 floor (floors should not be shown if less than 2)
    if (postData.ApartmentTotalFloor < 2) {
        excludeAttributes.push('no_of_floors');
    }

    Object.keys(attributes).forEach((key: string) => {
        if (excludeAttributes.includes(key)) {
            delete attributes[key];
        }
    });
    return attributes;
}

// set weighted logic for title generation.
async function setWeightedLogic(postData: any, sortedOrder: any) {
    const titleAttributes = getAttributes(postData, sortedOrder);
    let attrNames: string[] = [];
    let propertyData: any = {};
    attrNames = Object.keys(titleAttributes);

    let TOP_WEIGHTAGE = 4;
    let counter = 0;
    for (const attr of attrNames) {
        if (counter >= TOP_WEIGHTAGE) {
            break;
        }
        switch (String(attr)) {
            case 'property_type': {
                if (postData.propertyTypeId) {
                    ++counter;
                    let propertyTypeSlug: any =
                        await PropertyTypesTranslation.findAll({
                            attributes: ['name', 'locale'],
                            where: {
                                property_type_id: postData.propertyTypeId,
                            },
                        });
                    propertyData.enPropertyTypeName =
                        await propertyTypeSlug?.find(
                            (o: any) => o.locale == Locale.ENGLISH
                        ).name;
                    propertyData.arPropertyTypeName =
                        await propertyTypeSlug?.find(
                            (o: any) => o.locale == Locale.ARABIC
                        ).name;
                    propertyData.propertyTypeId = postData.propertyTypeId;
                }
                break;
            }
            case 'landArea': {
                if (postData.landArea) {
                    ++counter;
                    propertyData.landArea = postData.landArea;
                }
                break;
            }
            case 'builtUpArea': {
                if (postData.builtUpArea) {
                    ++counter;
                    propertyData.builtUpArea = postData.builtUpArea;
                }
                break;
            }
            case 'noOfStreet': {
                if (postData.noOfStreet > noOfstreet.TWO) {
                    ++counter;
                    propertyData.noOfStreet = postData.noOfStreet;
                }
                break;
            }
            case 'noOfApartments': {
                if (parseInt(postData.noOfApartments)) {
                    ++counter;
                    propertyData.noOfApartments = postData.noOfApartments;
                }
                break;
            }
            case 'facing_type ': {
                if (
                    (postData.noOfStreet == noOfstreet.ONE ||
                        postData.noOfStreet == noOfstreet.TWO) &&
                    postData.StreetInfo
                ) {
                    ++counter;
                    propertyData.enFacing = await getFacing(
                        postData,
                        Locale.ENGLISH
                    );
                    propertyData.arFacing = await getFacing(
                        postData,
                        Locale.ARABIC
                    );
                }
                break;
            }
            case 'street _width': {
                if (
                    postData.StreetInfo &&
                    postData.noOfStreet == noOfstreet.ONE
                ) {
                    ++counter;
                    propertyData.enStreet = await getStreetInfo(
                        postData,
                        propertyData,
                        Locale.ENGLISH
                    );
                    propertyData.arStreet = await getStreetInfo(
                        postData,
                        propertyData,
                        Locale.ARABIC
                    );
                }
                break;
            }
            case 'no_of_bedrooms': {
                if (postData.Bedroom) {
                    ++counter;
                    propertyData.noOfBedrooms = postData.Bedroom;
                }
                break;
            }
            case 'furnished_type': {
                if (
                    postData.furnishingTypeId == FURNISHED_TYPE_ID ||
                    postData.furnishingTypeId == SEMI_FURNISHED_TYPE_ID
                ) {
                    let propertyFurnishingSlug: any =
                        await TypeMasterTranslation.findAll({
                            where: { typeMasterId: postData.furnishingTypeId },
                        });
                    propertyData.enFurnishingName =
                        await propertyFurnishingSlug?.find(
                            (o: any) => o.locale === Locale.ENGLISH
                        ).name;
                    propertyData.arFurnishingName =
                        await propertyFurnishingSlug?.find(
                            (o: any) => o.locale === Locale.ARABIC
                        ).name;
                    ++counter;
                }
                break;
            }
            case 'no_of_guestrooms': {
                if (parseInt(postData.GuestRoom)) {
                    ++counter;
                    propertyData.noOfGuestRooms = postData.GuestRoom;
                }
                break;
            }
            case 'no_of_floors': {
                if (
                    parseInt(postData.ApartmentTotalFloor) &&
                    postData.ApartmentTotalFloor >= maxFloorCount
                ) {
                    ++counter;
                    propertyData.PropertyFloor = postData.ApartmentTotalFloor;
                }
                break;
            }
            case 'residency_type': {
                if (postData.residenceTypeId) {
                    ++counter;
                    propertyData.enResidencyName = TitleMapping.enSingle;
                    propertyData.arResidencyName = TitleMapping.arSingle;
                }
                break;
            }
            default: {
                propertyData = {};
            }
        }
    }
    return propertyData;
}

// logic for english and arabic facing.
async function getFacing(postData: any, locale: string) {
    let propertyData: any = {};
    propertyData.enFacing = '';
    propertyData.arFacing = '';
    for (let index = 1; index <= postData.noOfStreet; index++) {
        if (!postData.StreetInfo[`streetfacing${index}`]) {
            return;
        }
        let propertyFacingSlug: any = await TypeMasterTranslation.findAll({
            where: {
                typeMasterId: postData.StreetInfo[`streetfacing${index}`],
            },
        });
        propertyData[`enStreetFacing${index}`] =
            (await propertyFacingSlug?.find(
                (o: any) => o.locale === Locale.ENGLISH
            ).name) || '';
        propertyData[`arStreetFacing${index}`] =
            (await propertyFacingSlug?.find(
                (o: any) => o.locale === Locale.ARABIC
            ).name) || '';
        propertyData.enFacing += propertyData[`enStreetFacing${index}`] + ' ';
        propertyData.arFacing += propertyData[`arStreetFacing${index}`] + ' ';
    }

    let facing = propertyData.enFacing.split(' ');
    facing.pop();
    let arFacing = propertyData.arFacing.split(' ');
    arFacing.pop();
    switch (postData.noOfStreet) {
        case 1: {
            return locale == Locale.ENGLISH ? facing[0] : arFacing[0];
        }
        case 2: {
            return locale == Locale.ENGLISH
                ? facing.join(', ')
                : arFacing[0] + TitleMapping.arCommaSeparator + arFacing[1];
        }
        case 3: {
            return locale == Locale.ENGLISH
                ? `${facing[0]}, ${facing[1]} ${TitleMapping.enAnd} ${facing[2]}`
                : arFacing.join(TitleMapping.arCommaSeparator);
        }
        case 4: {
            return locale == Locale.ENGLISH
                ? `${facing[0]}, ${facing[1]}, ${facing[2]} ${TitleMapping.enAnd} ${facing[3]}`
                : arFacing.join(TitleMapping.arCommaSeparator);
        }
        default: {
            return '';
        }
    }
}

// get street info of properties
async function getStreetInfo(postData: any, propertyData: any, locale: string) {
    let streetwidth1 = postData.StreetInfo.streetwidth1 || '';
    let streetwidth1_str = streetwidth1
        ? `${TitleMapping.streetWidthPrefix} ${streetwidth1}${TitleMapping.meter}${TitleMapping.streetWidthSuffix}`
        : '';
    let enfacing1 =
        propertyData.enStreetFacing1 ||
        (await getFacingSlug(
            postData.StreetInfo.streetfacing1,
            Locale.ENGLISH
        ));
    let arfacing1 = await getFacingSlug(
        postData.StreetInfo.streetfacing1,
        Locale.ARABIC
    );
    if (postData.noOfStreet == noOfstreet.ONE) {
        if (locale == Locale.ENGLISH) {
            return `${TitleMapping.facingPrefix}${enfacing1} ${
                streetwidth1 ? streetwidth1_str : ''
            }`;
        }
        if (locale == Locale.ARABIC) {
            let street = `${TitleMapping.arStreetWidthPrefix} ${TitleMapping.arStreetWidthSufix} ${streetwidth1}${TitleMapping.arStreetWidthSuffix}`;
            return `${arfacing1} ${streetwidth1 ? street : ''}`;
        }
    }
}

// get area as per property type
function getAreaAffix(postData: any, locale: string) {
    const carpetArea = postData.landArea || postData.builtUpArea;
    const unit =
        locale == Locale.ENGLISH
            ? TitleMapping.enAreaUnit
            : TitleMapping.arAreaUnit;
    return `${carpetArea} ${unit}`;
}

// get english and arabic facing slug from database.
async function getFacingSlug(id: number, locale: string) {
    let propertyData: any = {};
    propertyData.enFacing = '';
    if (!id) {
        return '';
    }
    let propertyFacingSlug: any = await TypeMasterTranslation.findAll({
        where: { typeMasterId: id },
    });

    if (locale == Locale.ENGLISH) {
        return propertyFacingSlug?.find((o: any) => o.locale == Locale.ENGLISH)
            .name;
    }
    if (locale == Locale.ARABIC) {
        return propertyFacingSlug?.find((o: any) => o.locale == Locale.ARABIC)
            .name;
    }
}

// set property english title
function setEnglishTitle(postData: any) {
    let area = getAreaAffix(postData, Locale.ENGLISH);
    let streets = `${TitleMapping.noOfStreetPrefix} ${postData.noOfStreet} ${TitleMapping.noOfStreetSuffix}`;
    let apartment = `${TitleMapping.noOfApartmentSuffix} ${getApartmentsAffix(
        postData,
        Locale.ENGLISH
    )}`;
    let facing = `${TitleMapping.facingPrefix} ${postData.enFacing}`;
    let street = `${postData.enStreet}`;
    let bedrooms = getBedroomsAffix(postData, Locale.ENGLISH);
    let furnished = `${postData.enFurnishingName}`;
    let GuestRoom = `${TitleMapping.noOfGuestRoomsPrefix} ${getGuestroomsAffix(
        postData,
        Locale.ENGLISH
    )}`;
    let noOfFloors = `${TitleMapping.noOfFloorPrefix} ${getFloorsAffix(
        postData,
        Locale.ENGLISH
    )}`;
    let residencyType = `${TitleMapping.residencyTypePrefix} ${postData.enResidencyName}`;
    let propertyTitleEn = `${postData.enFurnishingName ? furnished : ''} ${
        postData.enPropertyTypeName ? postData.enPropertyTypeName : ''
    } 
         ${postData.landArea || postData.builtUpArea ? area : ''}
         ${postData.enResidencyName ? residencyType : ''} ${
        postData.noOfGuestRooms ? GuestRoom : ''
    } 
        ${
            postData.PropertyFloor &&
            postData.listingTypeId == PropertyListingType.Sale
                ? noOfFloors
                : ''
        }
         ${postData.noOfStreet ? streets : ''} ${
        postData.noOfApartments ? apartment : ''
    }
         ${postData.enFacing && !postData.enStreet ? facing : ''} ${
        postData.enStreet ? street : ''
    } 
         ${postData.noOfBedrooms ? bedrooms : ''}
         ${
             postData.PropertyFloor &&
             postData.listingTypeId == PropertyListingType.Rent
                 ? noOfFloors
                 : ''
         }`;

    return propertyTitleEn.replace(/\s+/g, ' ').trim();
}

// set property arabic title
function setArabicTitle(postData: any) {
    let area = getAreaAffix(postData, Locale.ARABIC);
    let streets = `${TitleMapping.arNoOfStreetPrefix} ${
        postData.noOfStreet > 2
            ? postData.noOfStreet + ' ' + TitleMapping.arNoOfStreetSUffix3_OR_4
            : TitleMapping.arNoOfApartmentSuffix_2
    } `;
    let apartment = `${TitleMapping.arNoOfApartmentPrefix} ${getApartmentsAffix(
        postData,
        Locale.ARABIC
    )}`;
    let facing = `${TitleMapping.arFacingPrefix}${postData.arFacing}`;
    let street = `${postData.arStreet}`;
    let bedrooms = getBedroomsAffix(postData, Locale.ARABIC);
    let furnished = `${postData.arFurnishingName}`;
    let GuestRoom = `${TitleMapping.arNoOfGuestRoomsPrefix}${getGuestroomsAffix(
        postData,
        Locale.ARABIC
    )}`;
    let noOfFloors = getFloorsAffix(postData, Locale.ARABIC);
    let residencyType = `${TitleMapping.arResidencyTypePrefix}${postData.arResidencyName}`;
    let propertyTitleAr = `${
        postData.arPropertyTypeName ? postData.arPropertyTypeName : ''
    } ${postData.arFurnishingName ? furnished : ''} 
         ${postData.landArea || postData.builtUpArea ? area : ''}
         ${postData.arResidencyName ? residencyType : ''} ${
        postData.noOfGuestRooms ? GuestRoom : ''
    } 
    ${
        postData.PropertyFloor &&
        postData.listingTypeId == PropertyListingType.Sale
            ? noOfFloors
            : ''
    }
         ${postData.noOfStreet ? streets : ''} ${
        postData.noOfApartments ? apartment : ''
    } 
         ${postData.arFacing && !postData.arStreet ? facing : ''} ${
        postData.arStreet ? street : ''
    } 
         ${postData.noOfBedrooms ? bedrooms : ''}
         ${
             postData.PropertyFloor &&
             postData.listingTypeId == PropertyListingType.Rent
                 ? noOfFloors
                 : ''
         }`;

    let arTitle = propertyTitleAr.replace(/\s+/g, ' ').trim();
    return arTitle.replace(/,*$/, '');
}

/**
 * @param data
 * @param locale
 * @returns Bedroom string for title based on locale
 */
function getBedroomsAffix(data: any, locale: string) {
    let bedrooms = data.noOfBedrooms;
    if (locale == Locale.ENGLISH) {
        let bedroom = ` ${bedrooms} ${
            bedrooms > 1
                ? TitleMapping.noOfBedRoomSuffix2
                : TitleMapping.noOfBedRoomSuffix
        }`;
        let bedroomCount = `${TitleMapping.noOfBedRoomPrefix} ${
            bedrooms > 9
                ? TitleMapping.NoOfBedroomCount +
                  ' ' +
                  TitleMapping.noOfBedRoomSuffix2
                : bedroom
        }`;
        let isStudio = `${
            bedrooms == '0'
                ? TitleMapping.noOfBedRoomPrefix + ' ' + TitleMapping.Studio
                : bedroomCount
        }`;
        return `${bedrooms ? isStudio : ''}`;
    }
    if (locale == Locale.ARABIC) {
        let bedroomCount = '';
        if (bedrooms == 1) {
            bedroomCount =
                TitleMapping.arNoOfBedRoomPrefix +
                TitleMapping.arNoOfBedRoomSuffix_1;
        } else if (bedrooms == 2) {
            bedroomCount =
                TitleMapping.arNoOfBedRoomPrefix +
                TitleMapping.arNoOfBedRoomSuffix_2;
        } else {
            if (bedrooms > 9) {
                bedrooms = TitleMapping.NoOfBedroomCount;
            }
            bedroomCount = `${TitleMapping.arNoOfBedRoomPrefix} ${bedrooms} ${TitleMapping.arNoOfBedRoomSuffix3_OR_4}`;
        }
        let isStudio = `${
            bedrooms == '0' ? TitleMapping.arStudio : bedroomCount
        }`;
        return `${bedrooms ? isStudio : ''}`;
    }
}

/**
 * @param data
 * @param locale
 * @returns Apartment string for title based on locale
 */
function getApartmentsAffix(data: any, locale: string) {
    let apartment = '';
    if (data.noOfApartments == 1) {
        apartment =
            locale == Locale.ENGLISH
                ? `${data.noOfApartments} ${TitleMapping.noOfApartmentPrefix}`
                : `${TitleMapping.arNoOfApartmentSuffix_1}`;
    } else if (data.noOfApartments == 2) {
        apartment =
            locale == Locale.ENGLISH
                ? `${data.noOfApartments} ${TitleMapping.noOfApartmentPrefix2}`
                : `${TitleMapping.arNoOfApartmentSuffix_2}`;
    } else {
        apartment =
            locale == Locale.ENGLISH
                ? `${data.noOfApartments} ${TitleMapping.noOfApartmentPrefix2}`
                : `${data.noOfApartments} ${TitleMapping.arNoOfApartmentSuffix_3_OR_more}`;
    }
    return apartment;
}
/**
 *
 * @param data
 * @param locale
 * @returns Guestrooms string for title based on locale
 */
function getGuestroomsAffix(data: any, locale: string) {
    let guestRooms = '';
    if (data.noOfGuestRooms == 1) {
        guestRooms =
            locale == Locale.ENGLISH
                ? `${data.noOfGuestRooms} ${TitleMapping.noOfGuestRoomsSuffix_1}`
                : TitleMapping.arNoOfGuestRoomsSuffix_1;
    } else if (data.noOfGuestRooms == 2) {
        guestRooms =
            locale == Locale.ENGLISH
                ? `${data.noOfGuestRooms} ${TitleMapping.noOfGuestRoomsSuffix_2}`
                : TitleMapping.arNoOfGuestRoomsSuffix_2;
    } else {
        guestRooms =
            locale == Locale.ENGLISH
                ? `${data.noOfGuestRooms} ${TitleMapping.noOfGuestRoomsSuffix_2}`
                : ` ${data.noOfGuestRooms} ${TitleMapping.arNoOfGuestRoomsSuffix_3_OR_more}`;
    }
    return guestRooms;
}

/**
 * @param data
 * @param locale
 * @returns property floors string for title based on locale
 */
function getFloorsAffix(data: any, locale: string) {
    let floors = '';
    if (data.PropertyFloor == 1) {
        floors =
            locale == Locale.ENGLISH
                ? `${data.PropertyFloor} ${TitleMapping.noOfFloorSuffix}`
                : `${TitleMapping.arNoOfFloorPrefix}${TitleMapping.arNoOfFloorSuffix_1}`;
    } else if (data.PropertyFloor == 2) {
        floors =
            locale == Locale.ENGLISH
                ? `${data.PropertyFloor} ${TitleMapping.noOfFloorSuffix}`
                : `${TitleMapping.arNoOfFloorPrefix}${TitleMapping.arNoOfFloorSuffix_2}`;
    } else if (data.PropertyFloor > 2 && data.PropertyFloor <= 10) {
        floors =
            locale == Locale.ENGLISH
                ? `${data.PropertyFloor} ${TitleMapping.noOfFloorSuffix}`
                : `${TitleMapping.arNoOfFloorPrefix} ${data.PropertyFloor} ${TitleMapping.arNoOfFloorSuffix_3_to_10}`;
    } else {
        floors =
            locale == Locale.ENGLISH
                ? `${data.PropertyFloor} ${TitleMapping.noOfFloorSuffix}`
                : `${TitleMapping.arNoOfFloorPrefix} ${data.PropertyFloor} ${TitleMapping.arNoOfFloorSuffix_11_OR_more}`;
    }
    return floors;
}

// making variables for template
export const generateDescriptionVariables = async (
    _propertyId: string,
    locale: string,
    pData: any
): Promise<DescriptionVariables> => {
    let descObject: DescriptionVariables;
    await i18next.changeLanguage(locale);
    let pAttr = pData.PropertyAttribute;
    let pAmenities = pData.Amenities;
    let streetData = getStreetData(pData, locale);
    let wathqData = pData?.Realestate_deed
        ? formatWathqRes({ dataValues: pData?.Realestate_deed })
        : null;
    let landNumber = wathqData?.realEstate[0]?.landNumber || '';
    let areaNumber = wathqData?.realEstate[0]?.planNumber || '';
    let noOfBedrooms =
        pAttr.noOfBedrooms > 9
            ? '9+'
            : pAttr.noOfBedrooms == 0
            ? descStaticText[locale].studio
            : pAttr.noOfBedrooms;
    descObject = {
        propertyTypeId: pData.propertyTypeId,
        propertyType: getPropertyType(pData, locale),
        listingFor: getListingFor(pData, locale),
        location: getLocation(pData, locale),
        wathiqStatustags: getWathiqStatustags(wathqData),
        amenities: getAmenitiesName(pAmenities, locale),
        fixtures: getFixturesName(pAmenities, locale),
        noOfApartments: pAttr.noOfApartments,
        noOfBathrooms: pAttr.noOfBathrooms > 9 ? '9+' : pAttr.noOfBathrooms,
        noOfBedrooms: noOfBedrooms,
        noOfFloors: pAttr.noOfFloors,
        noOfGuestRooms: pAttr.noOfGuestrooms > 4 ? '5+' : pAttr.noOfGuestrooms,
        noOfLivingrooms:
            pAttr.noOfLivingrooms > 4 ? '5+' : pAttr.noOfLivingrooms,
        noOfOpenings: pAttr.noOfOpening,
        noOfPalmsTrees: pAttr.noOfPalmTrees,
        noOfParkings: pAttr.noOfParkings,
        noOfWaterWells: pAttr.noOfWaterWells,
        electricity: pAttr.electricityMeter || false,
        water: pAttr.waterMeter || false,
        floorNumber: pAttr.floorNumber,
        landNumber: /\d/.test(landNumber) ? landNumber : undefined, // checking if it contains number
        areaNumber: /\d/.test(areaNumber) ? areaNumber : undefined, // checking if it contains number
        buildingYear: pAttr.completionYear,
        builtupArea: pAttr.builtUpArea,
        landArea: pAttr.carpetArea,
        depth: pAttr.landDepth,
        length: pAttr.landLength,
        price: pAttr.salePrice || pAttr.expectedRent,
        wasaltManaged: pData.managedById == ENUMS.WASALT_MANAGED,
        furnishStatus: getfurnishingStatus(pAttr, locale),
        ...streetData,
        residencyType: getresidenceType(pAttr, locale),
        areaUnit: getAreaUnit(pAttr, locale),
        currency: getCurrency(pAttr, locale),
        lengthUnit: i18next.t('lengthUnitDescription'),
        // function for adding s in the end of the word if n is greater than 1
        pluralWords: (n: number, word: string) => {
            if (
                n == descStaticText.en.studio ||
                n == descStaticText.en.studio
            ) {
                // for studio
                return n;
            } else if (isNaN(n)) {
                // iff it is not a Number. eg : 5+, 9+
                return `${n} ${word}s`;
            } else {
                return n > 1 ? `${n} ${word}s` : `${n} ${word}`;
            }
        },
    };
    return descObject;
};

// getting description tmaemplate and putting values
export const descriptionTemplate = async (
    variables: DescriptionVariables,
    locale: string
) => {
    let propertyDescKey = `${variables.propertyTypeId}-sale-${locale}`;
    let template: any = await utilityService.getFeatureEntityData({
        entity_group: 'property-description-rule',
        entity_name: propertyDescKey,
    });
    return pug.compile(template.featureEntity?.entity_value)(variables);
};

export interface DescriptionVariables {
    propertyTypeId: any;
    builtupArea?: number;
    landArea?: number;
    areaNumber?: string;
    propertyType?: string;
    listingFor?: string;
    location?: string;
    street1Facing?: string;
    street1Width?: string;
    street2Facing?: string;
    street2Width?: string;
    totalStreets?: string;
    noOfBedrooms?: number;
    noOfBathrooms?: number;
    noOfFloors?: number;
    noOfGuestRooms?: number;
    noOfLivingrooms?: number;
    noOfApartments?: number;
    noOfOpenings?: number;
    noOfParkings?: number;
    noOfPalmsTrees?: number;
    noOfWaterWells?: number;
    electricity?: boolean;
    length?: number;
    depth?: number;
    water?: boolean;
    amenities: string[];
    fixtures: string[];
    wathiqStatustags: string[];
    landNumber?: string;
    wasaltManaged?: boolean;
    price?: string;
    residencyType?: string;
    floorNumber?: string;
    furnishStatus?: string;
    buildingYear?: number;
    currency?: string;
    areaUnit?: string;
    lengthUnit?: string;
    pluralWords: any;
}

// get all amenities by name
export function getAmenitiesName(pAmenities: any, locale: string): string[] {
    let Amenities = pAmenities?.filter(
        (el: any) => el.amenity_type_id == propertyTypeMasterEnums.AMENITIES_ID
    );
    return Amenities?.map(gettingAmenitiesTranslation(locale));
}

// get all fixtures name by locale
export function getFixturesName(pAmenities: any, locale: string): string[] {
    let fixtures = pAmenities?.filter(
        (el: any) => el.amenity_type_id == propertyTypeMasterEnums.FIXTURES_ID
    );
    return fixtures?.map(gettingAmenitiesTranslation(locale));
}

// getting amenities array (used in Array.map callback)
const gettingAmenitiesTranslation = (locale: string) => {
    return (el: any): any => {
        return el?.AmenityTranslations.find((elTranslation: any) => {
            if (elTranslation.locale == locale) return elTranslation;
        })?.name;
    };
};

// get property type translation
export function getPropertyType(pData: any, locale: string): string {
    return pData?.propertyType?.PropertyTypesTranslations.find(
        (el: any) => el.locale == locale
    )?.name;
}

// get listing for sale/rent
export function getListingFor(pData: any, locale: string): string {
    let listingFor = pData?.propertyFor?.TypeMasterTranslations.find(
        (el: any) => el.locale == locale
    )?.name;
    let isSale = pData?.listingTypeId == PropertyListingType.Sale;
    let isArabic = locale == Locale.ARABIC;
    if (isArabic) {
        listingFor = isSale
            ? descStaticText.ar.forSale
            : descStaticText.ar.forRent;
    }
    return listingFor;
}

// furnishing status translation
function getfurnishingStatus(pAttr: any, locale: string): string {
    return pAttr.furnishingStatus?.TypeMasterTranslations.find(
        (el: any) => el.locale == locale
    )?.name;
}

// function to get location tranlation (district, city)
export function getLocation(pData: any, locale: string): string {
    let isArabic = locale == Locale.ARABIC;
    let city = pData?.PropertyLocation?.City?.CityTranslations?.find(
        (el: any) => el.locale == locale
    )?.name;
    // district
    let zone = pData?.PropertyLocation?.Zone?.ZoneTranslations?.find(
        (el: any) => el.locale == locale
    )?.name;
    let zoneText = '';
    if (isArabic) {
        zoneText = zone ? `${descStaticText.ar.zone} ${zone}٬ ` : '';
    } else {
        zoneText = zone ? `${zone}, ` : '';
    }
    return city ? `${zoneText}${city}` : undefined;
}

// function to get  wathq status tags
function getWathiqStatustags(wathqData: any): string[] {
    let wathiqStatustags: string[] = [];
    wathqData?.isCondtrained &&
        wathiqStatustags.push(i18next.t('WATHQ_CONDTRAINED'));
    wathqData?.isHalt && wathiqStatustags.push(i18next.t('WATHQ_HALTED'));
    wathqData?.isPawned && wathiqStatustags.push(i18next.t('WATHQ_PAWNED'));
    wathqData?.isTestament &&
        wathiqStatustags.push(i18next.t('WATHQ_TESTAMENT'));
    return wathiqStatustags.length ? wathiqStatustags : null;
}

// function to get street data and facing translation
function getStreetData(pData: any, locale: string) {
    let res: any = {};
    let sInfo = pData.StreetInfos;
    res.totalStreets = sInfo.length;
    for (let i = 0; i < sInfo.length; i++) {
        const element = sInfo[i];
        res[`street${i + 1}Width`] = element.streetWidth;
        res[`street${i + 1}Facing`] =
            element.facing?.TypeMasterTranslations.find(
                (el: any) => el.locale == locale
            ).name;
    }
    return res;
}

// funciton to get residence type translation
function getresidenceType(pAttr: any, locale: string): string {
    let isArabic = locale == Locale.ARABIC;
    let residenceType = pAttr.residenceType?.TypeMasterTranslations.find(
        (el: any) => el.locale == locale
    )?.name;
    if (residenceType && isArabic) {
        return descStaticText.ar.forSingles;
    } else {
        return residenceType;
    }
}

// funtion to get area unit translation
export function getAreaUnit(pAttr: any, locale: string): string {
    return pAttr?.unitType?.TypeMasterTranslations.find(
        (el: any) => el.locale == locale
    )?.name;
}

// function to get currency translation
export function getCurrency(pAttr: any, locale: string): string {
    return pAttr?.currencyType?.TypeMasterTranslations.find(
        (el: any) => el.locale == locale
    )?.name;
}

// function to genrate a allTmplt file containing all the pug template from db, for testing purpose
export const genTemplateUnion = async () => {
    let { featureEntity } = await utilityService.getAllFeatureEntityData({
        entity_group: 'property-description-rule',
    });
    let allTmplt = '';
    featureEntity.forEach((el: any) => {
        allTmplt += `\n// ${el.entity_name}\n`;
        allTmplt += `\n${el.entity_value}\n`;
    });

    fs.writeFile('allTmplt.pug', allTmplt, (e) => logger.error(e));
};
