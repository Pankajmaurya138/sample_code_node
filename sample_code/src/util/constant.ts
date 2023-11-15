// Help to get the propertyTypeId like villa-41/appartment-39 mapped from property_type_id in table property_type_translations or parent_id of property_types.
export const propertySubTypes = [
    'apartment',
    'warehouse',
    'studio',
    'flat',
    'penthouse',
    'villa',
    'townhouse',
    'house',
    'home',
    'minthis',
    'duplex',
    'island',
    'plot',
    'land',
    'farm',
    'business',
    'office',
    'building',
    'resort',
    'hotel',
    'corporate',
    'tower',
    'detached-villa',
    'semi-detached-villa',
    'link-detached-villa',
    'detached-house',
    'private-islands',
    'houses-villas',
    'hotels',
    'landplot',
    'ground-floor-apartment',
    'town-house',
    'semi-detached-house',
    'duplex-penthouse',
    'detached-bungalow',
    'detached-houses',
    'rest-house',
    'maisonette',
    'rest-home',
    'rest',
    'villas',
    'semi-detached',
    'apartments',
    'plots',
    'compound',
    'palace',
    'chalet',
    'land',
    'retail',
    'office-space',
    'office',
    'space',
    'camp',
    'labor',
    'labor-camp',
    'showroom',
    'site',
    'wooden',
];

export const nonAmetiesPropertyTypes = ['building', 'land'];

export const mainPropertyMapping: any = {
    // property_type_translations
    commercial: {
        id: 1,
        subTypes: [
            'commercial',
            'land',
            'retail',
            'office-space',
            'office',
            'space',
            'warehouse',
            'camp',
            'labor',
            'labor-camp',
            'building',
            'showroom',
            'development',
            'site',
        ],
    },
    residential: {
        id: 2,
        subTypes: [
            'apartment',
            'villa',
            'palace',
            'chalet',
            'land',
            'building',
            'farm',
            'rest-home',
            'home',
            'rest',
            'duplex',
            'penthouse',
            'residential',
            'villas',
            'house',
            'wooden',
            'wood',
        ],
    },
};

export const countryAliases: any = {
    'united-arab-emirates': 'United Arab Emirates',
};

export const propertyFileTypes = {
    MAIN: 'main',
    REGA: 'rega_docs',
};
export const SELF_MANAGED: any = 55;

export const MAINTENANCE_CYCLE_TYPE_YEARLY: any = 43; //
export const CURRENCY_TYPE_ID: any = 44;
export const PROPERTY_AREA_UNIT: any = 23;

export const NODE_ENV: any = `${process.env.NODE_ENV}`;

export const ASSET_BASE_URL = process.env.ASSET_BASE_URL;

export const userStatusTypes = {
    PENDING: 82,
    ACTIVE: 83,
    BLOCKED: 84,
};

export const RESIDENTIAL_BUILDING = '47';
export const userRoles = {
    customer: 44,
};

export const PROPERTY_DISABLED_MINUTES = 10;
export const COMPANY_NAME_ERROR_STATUS = 401;
export const CR_NO_NOT_FOUND = 'CR_NO_NOT_FOUND';
export const UNAUTHORIZED_STATUS_CODE = 401;
export const ERROR_MSG = 'error';
export const SUCCESS_MSG = 'success';
export const COMPANY_IDENTITY_NUMBER = 3;

export const PROPERTY_TYPES = {
    Residential: 2,
    Villa: 41,
    Apartment: 39,
    Palace: 42,
    Duplex: 52,
    Residential_Building: 47,
    Farm: 44,
    Rest_House: 48,
    Chalet: 53,
    Residential_Land: 43,

    Commercial: 1,
    Showroom: 63,
    Office_Space: 56,
    Retail: 55,
    Building: 61,
    Warehouse: 58,
    Labor_Camp: 59,
    Land: 49,
};

export const CITY_ID = {
    Riyadh: 273,
    Jeddah: 274,
    Makkah: 275,
    Madinah: 276,
};

export const propertyStepsId = {
    BASIC_DETAILS: 1,
    PROPERTY_VERIFICATION: 2,
    PROPERTY_LOCATION: 3,
    PROPERTY_DETAILS: 4,
    PROPERTY_FEATURES: 5,
    PHOTOS_VIDEOS: 6,
    AMENITIES: 7,
    PROPERTY_AUTHORIZATION: 8,
    COMPLETED: 0,
};

export const propertySteps = {
    BASIC_DETAILS: 'Basic Details',
    PROPERTY_VERIFICATION: 'Property Verification',
    PROPERTY_LOCATION: 'Location',
    PROPERTY_DETAILS: 'Property Details',
    PROPERTY_FEATURES: 'Property Features',
    AMENITIES: 'Amenities',
    PHOTOS_VIDEOS: 'Photos & Videos',
    PROPERTY_AUTHORIZATION: 'Property Authorization',
};

export const RESIDENECY_TYPE = 'residence_type';

export const RESIDENECY_TYPE_ID = 46;
export const FURNISHED_TYPE_ID = 5;
export const SEMI_FURNISHED_TYPE_ID = 6;

export const API_VERSION_4 = 4;

export const SOLD_TEXT = 'SOLD';
export const RENTED_TEXT = 'RENTED';
export const PREMIUM_PROPERTY_MINIMUM_SALE_PRICE = 3500000;
