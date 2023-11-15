export const PROPERTY_STATUS = 35; // PROPERTY STATUS COMPLETED
const NO_OF_BEDROOM = 'Bedroom';
const NO_OF_BATHROOM = 'Bathroom';
const NO_OF_LIVINGROOM = 'LivingRoom';
const NO_OF_GUESRROOM = 'GuestRoom';
const BUILt_UP_AREA = 'builtUpArea';
const CARPET_AREA = 'carpetArea';
const BORDER_OF_LAND_DEPTH = 'landDepth';
const BORDER_OF_LAND_LENGTH = 'landLength';
export const POSSION_TYPE_ID = 'possessionTypeId';
export const BUILD_YEAR = 'buildYear';
const RESIDENTIAL_VILLA_PROPERTY_TYPE = 41;
const RESIDENTIAL_APARTMENT_PROPERTY_TYPE = 39;
const RESIDENTIAL_DUPLEX_TYPE = 52;
const RESIDENTIAL_LAND_TYPE = 43;
const RESIDENTIAL_PALACE_TYPE = 42;
const RESIDENTIAL_BUILDING_TYPE = 47;
const RESIDENTIAL_FARM_TYPE = 44;
const RESIDENTIAL_RENT_HOUSE_TYPE = 48;
const RESIDENTIAL_CHALET_TYPE = 53;
const COMMERCIAL_SHOWRROW_TYPE = 63;
const COMMERCIAL_RETAIL_TYPE = 55;
const COMMERCIAL_OFFICE_SPACE = 56;
const COMMERCIAL_BUILDING_SPACE = 61;
const COMMERCIAL_WAREHOURSE_TYPE = 58;
export const COMMERCIAL_LABOUR_CAMP_TYPE = 59;
const COMMERCIAL_LAND_TYPE = 49;
export const BROKER_STATUS = 11;
export const USER_TYPE_ID = 47;

export const postProprtyValidationDataV3 = [
    // villa residential
    {
        sub_property_type_id: RESIDENTIAL_VILLA_PROPERTY_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Apartment
        sub_property_type_id: RESIDENTIAL_APARTMENT_PROPERTY_TYPE,
        sub_property_type: [
            { type: BUILt_UP_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
        ],
    },
    {
        //Duplex
        sub_property_type_id: RESIDENTIAL_DUPLEX_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        // land residential
        sub_property_type_id: RESIDENTIAL_LAND_TYPE,
        sub_property_type: [
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Palace
        sub_property_type_id: RESIDENTIAL_PALACE_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Building
        sub_property_type_id: RESIDENTIAL_BUILDING_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Farm
        sub_property_type_id: RESIDENTIAL_FARM_TYPE,
        sub_property_type: [
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Rest House
        sub_property_type_id: RESIDENTIAL_RENT_HOUSE_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Chalet
        sub_property_type_id: RESIDENTIAL_CHALET_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Showroom
        sub_property_type_id: COMMERCIAL_SHOWRROW_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: BUILt_UP_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Retail
        sub_property_type_id: COMMERCIAL_RETAIL_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: BUILt_UP_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Office Space
        sub_property_type_id: COMMERCIAL_OFFICE_SPACE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: BUILt_UP_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Commercial Building
        sub_property_type_id: COMMERCIAL_BUILDING_SPACE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Commercial Warehouse
        sub_property_type_id: COMMERCIAL_WAREHOURSE_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Commercial Labor Camp
        sub_property_type_id: COMMERCIAL_LABOUR_CAMP_TYPE,
        sub_property_type: [
            { type: POSSION_TYPE_ID, error: 'POSSION_TYPE_ID_REQUIRED' },
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
    {
        //Commercial land
        sub_property_type_id: COMMERCIAL_LAND_TYPE,
        sub_property_type: [
            { type: CARPET_AREA, error: 'BUILD_UP_AREA_REQUIRED' },
        ],
    },
];

export const attributeDataV3 = [
    // villa residential
    {
        sub_property_type_id: RESIDENTIAL_VILLA_PROPERTY_TYPE,
        sub_property_type: [
            { type: NO_OF_BEDROOM, error: 'BEDROOM_REQUIRED' },
            { type: NO_OF_BATHROOM, error: 'BATHROOM_REQUIRED' },
            { type: NO_OF_LIVINGROOM, error: 'LIVINGROOM_REQUIRED' },
            { type: NO_OF_GUESRROOM, error: 'GUESTROOM_REQUIRED' },
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Apartment
        sub_property_type_id: RESIDENTIAL_APARTMENT_PROPERTY_TYPE,
        sub_property_type: [
            { type: NO_OF_BEDROOM, error: 'BEDROOM_REQUIRED' },
            { type: NO_OF_BATHROOM, error: 'BATHROOM_REQUIRED' },
            { type: NO_OF_LIVINGROOM, error: 'LIVINGROOM_REQUIRED' },
            { type: NO_OF_GUESRROOM, error: 'GUESTROOM_REQUIRED' },
        ],
    },
    {
        //Duplex
        sub_property_type_id: RESIDENTIAL_DUPLEX_TYPE,
        sub_property_type: [
            { type: NO_OF_BEDROOM, error: 'BEDROOM_REQUIRED' },
            { type: NO_OF_BATHROOM, error: 'BATHROOM_REQUIRED' },
            { type: NO_OF_LIVINGROOM, error: 'LIVINGROOM_REQUIRED' },
            { type: NO_OF_GUESRROOM, error: 'GUESTROOM_REQUIRED' },
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        // land residential
        sub_property_type_id: RESIDENTIAL_LAND_TYPE,
        sub_property_type: [
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Palace
        sub_property_type_id: RESIDENTIAL_PALACE_TYPE,
        sub_property_type: [
            { type: NO_OF_BEDROOM, error: 'BEDROOM_REQUIRED' },
            { type: NO_OF_BATHROOM, error: 'BATHROOM_REQUIRED' },
            { type: NO_OF_LIVINGROOM, error: 'LIVINGROOM_REQUIRED' },
            { type: NO_OF_GUESRROOM, error: 'GUESTROOM_REQUIRED' },
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Building
        sub_property_type_id: RESIDENTIAL_BUILDING_TYPE,
        sub_property_type: [
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Farm
        sub_property_type_id: RESIDENTIAL_FARM_TYPE,
        sub_property_type: [
            { type: NO_OF_BEDROOM, error: 'BEDROOM_REQUIRED' },
            { type: NO_OF_BATHROOM, error: 'BATHROOM_REQUIRED' },
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Rest House
        sub_property_type_id: RESIDENTIAL_RENT_HOUSE_TYPE,
        sub_property_type: [
            { type: NO_OF_BEDROOM, error: 'BEDROOM_REQUIRED' },
            { type: NO_OF_BATHROOM, error: 'BATHROOM_REQUIRED' },
            { type: NO_OF_LIVINGROOM, error: 'LIVINGROOM_REQUIRED' },
            { type: NO_OF_GUESRROOM, error: 'GUESTROOM_REQUIRED' },
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Chalet
        sub_property_type_id: RESIDENTIAL_CHALET_TYPE,
        sub_property_type: [
            { type: NO_OF_BEDROOM, error: 'BEDROOM_REQUIRED' },
            { type: NO_OF_BATHROOM, error: 'BATHROOM_REQUIRED' },
            { type: NO_OF_LIVINGROOM, error: 'LIVINGROOM_REQUIRED' },
            { type: NO_OF_GUESRROOM, error: 'GUESTROOM_REQUIRED' },
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Showroom
        sub_property_type_id: COMMERCIAL_SHOWRROW_TYPE,
        sub_property_type: [],
    },
    {
        //Retail
        sub_property_type_id: COMMERCIAL_RETAIL_TYPE,
        sub_property_type: [],
    },
    {
        //Office Space
        sub_property_type_id: COMMERCIAL_OFFICE_SPACE,
        sub_property_type: [],
    },
    {
        //Commercial Building
        sub_property_type_id: COMMERCIAL_BUILDING_SPACE,
        sub_property_type: [
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Commercial Warehouse
        sub_property_type_id: COMMERCIAL_WAREHOURSE_TYPE,
        sub_property_type: [
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Commercial Labor Camp
        sub_property_type_id: COMMERCIAL_LABOUR_CAMP_TYPE,
        sub_property_type: [
            { type: NO_OF_BEDROOM, error: 'BEDROOM_REQUIRED' },
            { type: NO_OF_BATHROOM, error: 'BATHROOM_REQUIRED' },
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
    {
        //Commercial land
        sub_property_type_id: COMMERCIAL_LAND_TYPE,
        sub_property_type: [
            {
                type: BORDER_OF_LAND_DEPTH,
                error: 'BORDER_OF_LAND_DEPTH_REQUIREMENTS',
            },
            {
                type: BORDER_OF_LAND_LENGTH,
                error: 'BORDER_OF_LAND_LENGTH_REQUIREMENTS',
            },
        ],
    },
];
