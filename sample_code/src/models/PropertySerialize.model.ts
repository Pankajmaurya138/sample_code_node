export class PropertySerialize {
    constructor(data: any) {
        this.id = data.id;
        this.amenity = data.amenity;
        this.locale = data.locale;
        this.location = Object.assign(new Location(), data.location);
        this.generalInfo = new GeneralInfo(data.generalInfo);
        this.attribute = new Attribute(data.attribute);
        this.translation = new Translation(data.translation);
        this.file = Object.assign(new File(), data.file);
    }
    id?: number = null;
    amenity: Amenity[];
    locale: string;
    generalInfo: GeneralInfo;
    attribute: Attribute;
    location: Location;
    translation: Translation;
    file: File;
}

export class Amenity {
    aminityId: number;
}

export class Status {
    isSold?: boolean = false;
    isEclusive?: boolean = false;
    isHotDeal?: boolean = false;
    isInspected?: boolean = false;
    isFeatured?: boolean = false;
    isRecommended?: boolean = false;
    isAlreadyLeased?: boolean = false;
    isHighInvestmentReturn?: boolean = false;
    isGreatPrice?: boolean = false;
    isActive?: boolean = false;
    isWhatsappLater?: boolean = false;
}

export class Other {
    external360Link?: string = null;
    externalVideoLink?: string = null;
    darReference?: string = null;
    unitReference?: string = null;
    enDeveloperName?: string = null;
    arDeveloperName?: string = null;
    enProjectName?: string = null;
    arProjectName?: string = null;
    isWhatsappLater?: string = null;
    sourceTypeId?: number = null;
}

export class GeneralInfo {
    constructor(data: any) {
        this.propertyRegionId = data.propertyRegionId;
        this.listingTypeId = data.listingTypeId;
        this.managedById = data.managedById;
        this.mainTypeId = data.mainTypeId;
        this.propertyTypeId = data.propertyTypeId;
        this.optionTypeId = data.optionTypeId;
        this.developerId = data.developerId;
        this.projectId = data.projectId;
        this.userId = data.userId;
        this.status = Object.assign(new Status(), data.status);
        this.other = Object.assign(new Other(), data.other);
    }
    propertyRegionId: number;
    listingTypeId: number;
    managedById: number;
    mainTypeId: number;
    propertyTypeId: number;
    optionTypeId: number;
    developerId?: number = null;
    projectId?: number = null;
    userId: number;
    status: Status;
    other: Other;
}

export class General {
    noOfBedrooms?: number = null;
    noOfBathrooms?: number = null;
    noOfFloors?: number = null;
    floorNumber?: number = null;
    noOfRetailOutlets?: number = null;
    noOfApartments?: number = null;
    noOfWaterWells?: number = null;
    noOfPalmTrees?: number = null;
    noOfParkings?: number = null;
    streetWidth?: number = null;
}

export class Type {
    facingTypeId?: number = null;
    furnishingTypeId?: number = null;
    possessionTypeId?: number = null;
    possessionDate?: Date = null;
}

export class Area {
    unitTypeId?: number = null;
    builtUpArea?: number = null;
    carpetArea?: number = null;
    isAlreadyLeased?: boolean = false;
    completionYear?: Date = null;
    leaseAmount?: DoubleRange = null;
    leaseContractEndDate?: Date = null;
    campCapacity?: number = null;
}

export class Price {
    currencyTypeId?: number = null;
    salePrice?: DoubleRange = null;
    expectedRent?: DoubleRange = null;
    yearlyCharges?: DoubleRange = null;
    rentCycle?: number = null;
    monthlyChargeRange?: DoubleRange = null;
    securityDepositAmount?: DoubleRange = null;
}

export class Attribute {
    constructor(data: any) {
        this.general = Object.assign(new General(), data.general);
        this.type = Object.assign(new Type(), data.type);
        this.area = Object.assign(new Area(), data.area);
        this.price = Object.assign(new Price(), data.price);
    }
    general: General;
    type: Type;
    area: Area;
    price: Price;
}

export class Location {
    countryId?: number = null;
    stateId?: number = null;
    cityId?: number = null;
    zoneId?: number = null;
    buildingNumber?: string = null;
    additionalNumbers?: string = null;
    latitude?: string = null;
    longitude?: string = null;
}

export class En {
    title?: string = null;
    address?: string = null;
    landmark?: string = null;
    strretName?: string = null;
    description?: string = null;
    projectName?: string = null;
    developerName?: string = null;
}

export class Ar {
    title?: string = null;
    address?: string = null;
    landmark?: string = null;
    strretName?: string = null;
    description?: string = null;
    projectName?: string = null;
    developerName?: string = null;
}

export class Translation {
    constructor(data: any) {
        this.en = Object.assign(new En(), data.en);
        this.ar = Object.assign(new Ar(), data.ar);
    }
    en: En;
    ar: Ar;
}

export class File {
    images: string[];
    deed: string[];
    floorPlans: string;
    brochure: string;
}
