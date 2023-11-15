export enum PropertyErrorCodes {
    PROPERTY_DEFINE_INTERNAL_ERROR = 'PROPERTY_DEFINE_INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
    PROPERTY_NOT_RENEWED = 'PROPERTY_NOT_RENEWED',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    UNIT_REFERENCE_ALREADY_EXISTS = 'UNIT_REFERENCE_ALREADY_EXISTS',
    SLUG_ALREADY_EXISTS = 'SLUG_ALREADY_EXISTS',
    DOCUMENT_SAVED = 'DOCUMENT_SAVED',
    DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
    QC_AGENT_NOT_FOUND = 'QC_AGENT_NOT_FOUND',
    STATUS_TYPE_ID = 70,
    PROPERTY_STATUS_TYPE_ID = 59,
    SOURCE_MANUAL_TYPE_ID = 66,
    REGION_ID = 56,
    APPROVED = 505,
    PUBLISHED = 505,
    UNPUBLISHED = 507,
    REJECTED = 506,
    BRE_VERIFICATION = 501,
    VERIFIED = 502,
    BRE_APPROVAL = 503,
    LOCALIZATION = 504,
    PENDING = 59,
    MISSING = 509,
    ARCHIVED = 510,
    INCOMPLETE = 511,
    SOLD = 513,
    RENTED = 514,
    RENEWD = 79,
    CURRENCY_TYPE_ID = 44,
    APPROVED_TYPE = 'Approved',
    PENDING_TYPE = 'Pending',
    MISSING_TYPE = 'Missing Info',
    ARCHIVED_TYPE = 'Archived',
    RENEWD_TYPE = 'Renew',
    UNDER_REVIEW_TYPE = 'Under Review',
    INACTIVE_TYPE = 'Inactive',
    REJECTED_TYPE = 'Rejected',
    REMOVE_FROM_SLUG = 'REMOVE_VALUE_FROM_PROPERTY_SLUG',
    RENT = 4,
    SALE = 3,
    XML_SOURCE_ID = 67,
    RENT_CYCLE = 43,
    ALL_STATUS = 'ALL_STATUS',
    OCCUPIED = 512,
}

export enum PropertyFindFor {
    ALL = 'all',
    SUB_ACCOUNT = 'sub_account',
    ME = 'me',
}
export enum PropertyType {
    mainTypeId = 2,
    RESIDENTIAL_TYPE_ID = 2,
}
export enum UserStatus {
    PENDING = 82,
    ACTIVE = 83,
    BLOCKED = 84,
}

export enum InternalReviewEntityTypes {
    PROPERTY = 'property',
}

export enum MessageEntityTypes {
    INTERNAL_TEAM_REVIEWS = 'internal_team_reviews',
}

export enum InternalReviewStatusSlugEnum {
    IN_PROGRESS = 'review-in-progress',
    RESOLVED = 'review-resolved',
    REJECTED = 'review-rejected',
    RE_ASSIGNED = 'review-re-assigned',
    APPROVED = 'review-approved',
}

export enum FilePath {
    PATH = './assets/users/userId/imports/',
    TEMP_PATH = './assets/temp/properties/',
}

export enum ENUMS {
    MAX_FILE_DOWNLOAD = 10,
    MAX_FILE_SIZE = 10,
    PROPERTY_REGION_KSA = 56,
    PROPERTY_REGION_INTERNATIONAL = 57,
    SOURCE_TPYE_EXCEL = 67,
    WASALT_MANAGED = 54,
}
export const GROUP_STATUS_PENDING = [
    PropertyErrorCodes.BRE_VERIFICATION,
    PropertyErrorCodes.VERIFIED,
    PropertyErrorCodes.BRE_APPROVAL,
    PropertyErrorCodes.LOCALIZATION,
    PropertyErrorCodes.MISSING,
];
const GROUP_STATUS_APPROVED = [PropertyErrorCodes.APPROVED];
const GROUP_STATUS_REJECTED = [PropertyErrorCodes.REJECTED];
const GROUP_STATUS_ARCHIVED = [
    PropertyErrorCodes.ARCHIVED,
    PropertyErrorCodes.UNPUBLISHED,
];
const GROUP_STATUS_INCOMPLETE = [PropertyErrorCodes.INCOMPLETE];
const GROUP_STATUS_ALL = [
    ...GROUP_STATUS_PENDING,
    ...GROUP_STATUS_APPROVED,
    ...GROUP_STATUS_REJECTED,
    ...GROUP_STATUS_ARCHIVED,
    ...GROUP_STATUS_INCOMPLETE,
];

const GROUP_STATUS_ALL_V4 = [...GROUP_STATUS_ALL, PropertyErrorCodes.OCCUPIED];

export const GroupStatusCodes = {
    GROUP_STATUS_PENDING,
    GROUP_STATUS_APPROVED,
    GROUP_STATUS_REJECTED,
    GROUP_STATUS_ARCHIVED,
    GROUP_STATUS_INCOMPLETE,
    GROUP_STATUS_ALL,
    GROUP_STATUS_ALL_V4,
};

let filterRequestSingleCodeByGroup: any = {};
filterRequestSingleCodeByGroup[PropertyErrorCodes.BRE_VERIFICATION] =
    PropertyErrorCodes.PENDING;
filterRequestSingleCodeByGroup[PropertyErrorCodes.VERIFIED] =
    PropertyErrorCodes.PENDING;
filterRequestSingleCodeByGroup[PropertyErrorCodes.BRE_APPROVAL] =
    PropertyErrorCodes.PENDING;
filterRequestSingleCodeByGroup[PropertyErrorCodes.LOCALIZATION] =
    PropertyErrorCodes.PENDING;
filterRequestSingleCodeByGroup[PropertyErrorCodes.MISSING] =
    PropertyErrorCodes.PENDING;
filterRequestSingleCodeByGroup[PropertyErrorCodes.APPROVED] =
    PropertyErrorCodes.APPROVED;
filterRequestSingleCodeByGroup[PropertyErrorCodes.REJECTED] =
    PropertyErrorCodes.REJECTED;
filterRequestSingleCodeByGroup[PropertyErrorCodes.ARCHIVED] =
    PropertyErrorCodes.ARCHIVED;
filterRequestSingleCodeByGroup[PropertyErrorCodes.UNPUBLISHED] =
    PropertyErrorCodes.ARCHIVED;
filterRequestSingleCodeByGroup[PropertyErrorCodes.INCOMPLETE] =
    PropertyErrorCodes.INCOMPLETE;
filterRequestSingleCodeByGroup[PropertyErrorCodes.OCCUPIED] =
    PropertyErrorCodes.OCCUPIED;

export const FilterRequestSingleCodeByGroup = filterRequestSingleCodeByGroup;

export enum PropertySlugEnum {
    ResidentialLand = 43,
    Building = 47,
    Retail = 55,
    OfficeSpace = 56,
    WareHouse = 58,
    LaborCamp = 59,
    ShowRoom = 63,
    Land = 49,
}

const GROUP_Ver = [
    ...GROUP_STATUS_PENDING,
    ...GROUP_STATUS_APPROVED,
    ...GROUP_STATUS_REJECTED,
    ...GROUP_STATUS_ARCHIVED,
];

export enum PropertyListingType {
    Rent = 4,
    Sale = 3,
}

export enum AgentRoleIdEnums {
    WASALT_LISTING_TEAM = 84,
    WASALT_QUALITY_CHECK_TEAM = 83,
    WASALT_PHOTOGRAPHER_TEAM = 82,
}

export enum RoleIdEnums {
    ADMIN = 1,
    BROKER = 11,
    DEVELOPER = 45,
    AGENT = 46,
    OWNER = 47,
    CUSTOMER = 44,
    AMBASSADOR = 78,
}

export const idTypeMap: any = {
    crno: '3',
    nid: '1',
    iqma: '2',
    iqama: '3',
};

export enum idTypeEnums {
    IQMA = 'iqma',
    NID = 'nid',
    CR_NO = 'crno',
    IQAMA = 'iqama',
}

export enum propertyTypeMasterEnums {
    AMENITIES_ID = 31,
    FIXTURES_ID = 32,
}
export enum ResidencyTypeSlug {
    'SINGLE' = 'single',
}

export enum InternalTeamReviewUserType {
    REVIEWER = 'reviewer',
    RESOLVER = 'resolver',
}
export enum Locale {
    ENGLISH = 'en',
    ARABIC = 'ar',
}

export enum noOfstreet {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
}

export enum Environment {
    TEST = 'test',
    PRODUCTION = 'production',
}

export enum ErrorCodes {
    DB_ERROR = 'DB_ERROR',
}

export enum API_VERSIONS {
    V3 = 3,
    V4 = 4,
}

export enum PostPropertyStatus {
    DRAFT = 'draft',
    COMPLETED = 'completed',
    DUPLICATE = 'duplicate',
}
