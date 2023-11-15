import { ASSET_BASE_URL } from './constant';
import { resolve } from 'path';
const env: any = process.env.NODE_ENV;
let path = '../../../config/credentials.json';
const credentials = require(resolve(__dirname, path));
export const NATIONALITY_CODE = '113';
const imageBaseURL = ASSET_BASE_URL;
export const propertyAttributes = [
    {
        key: 'noOfBedrooms',
        image: `${imageBaseURL}/others/icons/noofbedroomsbnw.png`,
        unitKey: '',
        iconClass: 'bedroom',
    },
    {
        key: 'noOfBathrooms',
        image: `${imageBaseURL}/others/icons/noofbathroomsbnw.png`,
        unitKey: '',
        iconClass: 'bathroom',
    },
    {
        key: 'builtUpArea',
        image: `${imageBaseURL}/others/icons/builtupareabnw.png`,
        unitKey: 'unitType',
        iconClass: 'builtup-area',
    },
    {
        key: 'carpetArea',
        image: `${imageBaseURL}/others/icons/carpetareabnw.png`,
        unitKey: 'unitType',
        iconClass: 'land-area',
    },
    {
        key: 'completionYear',
        image: `${imageBaseURL}/others/icons/completionyearbnw.png`,
        unitKey: 'yrs',
        iconClass: 'age-of-building',
    },
];

// for property detailed attributes
export const propertyDetailsAttributes = [
    {
        key: 'noOfBedrooms',
        image: `${imageBaseURL}/others/icons/noofbedroomsbnw.png`,
        unitKey: '',
        iconClass: 'bedroom',
    },
    {
        key: 'noOfBathrooms',
        image: `${imageBaseURL}/others/icons/noofbathroomsbnw.png`,
        unitKey: '',
        iconClass: 'bathroom',
    },
    {
        key: 'noOfLivingrooms',
        image: `${imageBaseURL}/others/icons/living-room.png`,
        unitKey: '',
        iconClass: 'living-room',
    },
    {
        key: 'noOfGuestrooms',
        image: `${imageBaseURL}/others/icons/guest-room.png`,
        unitKey: '',
        iconClass: 'age-of-building',
    },
    {
        key: 'builtUpArea',
        image: `${imageBaseURL}/others/icons/builtupareabnw.png`,
        unitKey: 'unitType',
        iconClass: 'builtup-area',
    },
    {
        key: 'carpetArea',
        image: `${imageBaseURL}/others/icons/carpetareabnw.png`,
        unitKey: 'unitType',
        iconClass: 'land-area',
    },
    {
        key: 'completionYear',
        image: `${imageBaseURL}/others/icons/completionyearbnw.png`,
        unitKey: 'yrs',
        iconClass: 'age-of-building',
    },
];

export const propertyStatusTypeIds = {
    APPROVED: 505,
};

const DOMAIN: any = process.env.DOMAIN;
export const userCredential = credentials[env];
export const POSTPROPERTY = {
    CHECK_USER_VALIDITY: `${DOMAIN}/Account/validatelogin`,
    GET_REALESTATE_DEED: `${DOMAIN}/Wathq/RealestateDeed`,
    CHECK_REGA_AD_NUMBER: `${DOMAIN}/rega/isValidAd`,
    CHECK_REGA_AUTH_NUMBER: `${DOMAIN}/rega/isValidAuthAd`,
    CHECK_COMPANY_NAME: `${DOMAIN}/Wathq/CommercialregistrationDetails`,
};

export const auth_header = {
    bearer_token: 'RGFhci05MUAxMjM0OlBhc3M3NkBAJiY=',
};

// Property verfication last step feature live date.
export const PROPERTY_VERFICATION_LAST_STEP_FEATURE_LIVE_DATE = new Date(
    '2022-7-28'
); // YYYY-M-D
export const PropertyIconClass = {
    waterMeter: 'water',
    electricityMeter: 'electricity',
    verificationDoc: 'document',
    title: 'home-outline',
    location: 'map-marker',
    furnishing: 'furniture',
    profile: 'profile',
    phoneNumber: 'call-outline',
    email: 'email',
    price: 'price',
    bedroom: 'bedroom',
    bathroom: 'bathroom',
    builtUpArea: 'built-up-area',
    carpetArea: 'land-area',
    noOfLivingrooms: 'guest-room',
    noOfGuestrooms: 'living-room',
    furniture: 'furniture',
    completionYear: 'age-of-building',
};
