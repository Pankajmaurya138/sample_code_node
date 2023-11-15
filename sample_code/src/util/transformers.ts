import {
    PREMIUM_PROPERTY_MINIMUM_SALE_PRICE,
    PROPERTY_TYPES,
} from './constant';
import { PropertyIconClass } from './static';

class PropertyTransformer {
    /**
     * @description Convert the seller_properties view data to list of properties with brief info for wasalt pro listing screens.
     * @param properties list of seller_properties view records
     *  @returns list of properties with brief info for property listing screens
     */
    transformPropertyBrief = (properties: Record<string, any>[]) => {
        return properties.map((property: Record<string, any>) => ({
            postPropertyId: property.dataValues?.postPropertyId,
            premiumProperty:
                property.dataValues?.salePrice >
                PREMIUM_PROPERTY_MINIMUM_SALE_PRICE,
            reviewsCount: property.dataValues?.reviewsCount,
            seller: {
                id: property.dataValues?.userId,
                phoneNumber: property.dataValues?.phoneNumber,
                phoneNumberCountryCode:
                    property.dataValues?.phoneNumberCountryCode,
                fullName: property.dataValues?.fullName,
                roleName: property.dataValues?.role,
            },
            attribute: {
                noOfBedrooms: property.dataValues?.noOfBedrooms || '',
                noOfBathrooms: property.dataValues?.noOfBathrooms || '',
                area: {
                    propertyUnitType: property.unitType || '',

                    ...([
                        PROPERTY_TYPES.Showroom,
                        PROPERTY_TYPES.Retail,
                        PROPERTY_TYPES.Office_Space,
                        PROPERTY_TYPES.Apartment,
                    ].includes(property.propertyTypeId)
                        ? { builtUpArea: property.dataValues?.builtUpArea }
                        : { carpetArea: property.dataValues?.carpetArea }),
                },
                price: {
                    propertyCurrencyType:
                        property.dataValues?.currencyType || '',
                    salePrice: property.dataValues?.salePrice || '',
                    expectedRent: property.dataValues?.expectedRent || '',
                    yearlyCharges: property.dataValues?.yearlyCharges || '',
                },
                buildYear: property.dataValues?.completionYear || '', // added new field
            },
            attributes: property.attributes,
            propertyId: property.dataValues?.id,
            builtUpArea: property.dataValues?.builtUpArea,
            translation: {
                title: property.dataValues?.title,
                description: property.dataValues?.description,
                address: property.dataValues?.address,
            },
            files: property.PropertyFiles,
            districtName: property.dataValues?.district,
        }));
    };

    /**
     * @description Convert the seller_properties view data to property details for wasalt pro listing details screen.
     * @param properties seller_properties view single record
     *  @returns  property details in classified objects.
     */
    transformPropertyDetails = (property: Record<string, any>) => {
        return {
            id: property.dataValues.id,
            generalInfo: {
                slug: property.dataValues.slug,
                darReference: property.dataValues.darReference,
                description: property.dataValues.description,
                createdAt: property.dataValues.createdAt,
                propertyType: property.dataValues?.propertyType,
                title: property.dataValues?.title,
                furnishingType: property.dataValues?.furnishingType,
                managedBy: property.dataValues?.managedBy,
                authorizationNumber: property.dataValues?.authorizationNumber,
                wasaltRegaAdvertiserId:
                    property.dataValues?.wasaltRegaAdvertiserId,
                sourceType: property.dataValues?.sourceType,
                postPropertyId: property.dataValues?.postPropertyId,
                possessionType: property.dataValues?.possessionType,
                expectedRent: property.dataValues?.expectedRent,
                salePrice: property.dataValues?.salePrice,
                external360Link: property.dataValues?.external360Link,
            },
            sellerInfo: {
                fullName: property.dataValues?.fullName,
                id: property.dataValues?.userId,
                role: property.dataValues?.role,
                phoneNumber: property.dataValues?.phoneNumber,
                phoneNumberCountryCode:
                    property.dataValues?.phoneNumberCountryCode,
            },
            locationInfo: {
                address: property.dataValues?.address,
                latitude: property.dataValues?.latitude,
                longitude: property.dataValues?.longitude,
                district: property.dataValues?.district,
            },
            additionalInfo: {
                propertyMainType: property.dataValues?.propertyMainType,
                landLength: property.dataValues?.landLength,
                landDepth: property.dataValues?.landDepth,
                floorNumber: property.dataValues?.floorNumber,
                noOfFloors: property.dataValues?.noOfFloors,
                noOfParkings: property.dataValues?.noOfParkings,
                noOfOpening: property.dataValues?.noOfOpening,
                noOfWaterWells: property.dataValues?.noOfWaterWells,
                noOfPalmTrees: property.dataValues?.noOfPalmTrees,
                residenceType: property.dataValues?.residenceType,
                electricityMeter: property.dataValues?.electricityMeter,
                waterMeter: property.dataValues?.waterMeter,
                isHalt: property.dataValues?.isHalt,
                isCondtrained: property.dataValues?.isCondtrained,
            },
            attributes: property.attributes,
            attributesInfo: {
                noOfBedrooms: property.dataValues?.noOfBedrooms,
                noOfBathrooms: property.dataValues?.noOfBathrooms,
                unitType: property.dataValues?.unitType,
                noOfLivingrooms: property.dataValues?.noOfLivingrooms,
                noOfGuestRooms: property.dataValues?.noOfGuestRooms,
                carpetArea: property.dataValues?.carpetArea,
                builtUpArea: property.dataValues?.builtUpArea,
                currencyType: property.dataValues?.currencyType,
                icons: PropertyIconClass,
            },
            files: property.PropertyFiles,
        };
    };
}

export const propertyTransformer = new PropertyTransformer();
