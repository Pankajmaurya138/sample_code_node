import { Model, DataTypes, Transaction } from 'sequelize';
import { sequelize } from './sequelize';
import { Amenity } from './amenity.model';
import { AmenityProperty } from './amenityProperty.model';
import { PropertyFile } from './propertyFile.model';
import { AmenityTranslation } from './amenityTranslations.model';
import logger from '../util/logger';

export class PropertyView extends Model {
    public id!: number;
    public listingTypeId!: number;
    public mainTypeId!: number;
    public userId!: number;
    public addedBy!: number;
    public optionTypeId!: number;
    public propertyTypeId!: number;
    public darReference!: string[];
    public unitReference!: string[];
    public externalUrl!: string[];
    public externalVideoLink!: string[];
    public external360Link!: string[];
    public isSold!: boolean;
    public isHotDeal!: boolean;
    public isExclusive!: boolean;
    public isFeatured!: boolean;
    public isInspected!: boolean;
    public isActive!: boolean;
    public slug!: string[];
    public furnishingTypeId!: number;
    public facingTypeId!: number;
    public roomTypeId!: number;
    public unitTypeId!: number;
    public currencyTypeId!: number;
    public possessionTypeId!: number;
    public ownershipTypeId!: number;
    public maintenanceChargeCycleId!: number;
    public transactionTypeId!: number;
    public builtUpArea!: number;
    public carpetArea!: number;
    public superBuiltUpArea!: number;
    public residenceTypeId!: number;
    public noOfBedrooms!: number;
    public chapCapacity!: number;
    public noOfFloors!: number;
    public capacityPerRoom!: number;
    public floorNumber!: number;
    public expectedRent!: DoubleRange[];
    public salePrice!: DoubleRange[];
    public rentCycle!: number;
    public securityDepositAmount!: DoubleRange[];
    public rentPerSqFeet!: DoubleRange[];
    public maintenanceCharge!: DoubleRange[];
    public isRentNegotiable!: boolean;
    public isWhatsappLater!: boolean;
    public possessionDate!: Date;
    public completionYear!: string[];
    public countryId!: Number[];
    public cityId!: Number[];
    public zoneId!: Number[];
    // public landmark!: string[];
    public latitude!: string[];
    public longitude!: string[];
    public enTitle!: string[];
    public enKeywords!: string[];
    public enAddress!: string[];
    public enDescription!: string[];
    public arTitle!: string[];
    public arKeywords!: string[];
    public arAddress!: string[];
    public arDescription!: string[];
    public enPropertyType!: string[];
    public arPropertyType!: string[];
    public enPropertyTypeOption!: string[];
    public arPropertyTypeOption!: string[];
    public enPropertyMainType!: string[];
    public arPropertyMainType!: string[];
    public enFurnishingType!: string[];
    public arFurnishingType!: string[];
    public enFacingType!: string[];
    public arFacingType!: string[];
    public enRoomType!: string[];
    public arRoomType!: string[];
    public enUnitType!: string[];
    public arUnitType!: string[];
    public enCurrencyType!: string[];
    public arCurrencyType!: string[];
    public enPossessionType!: string[];
    public arPossessionType!: string[];
    public enOwnershipType!: string[];
    public arOwnershipType!: string[];
    public enMaintenanceChargeType!: string[];
    public arMaintenanceChargeType!: string[];
    public enTransactionType!: string[];
    public arTransactionType!: string[];
    public enResidenceType!: string[];
    public arResidenceType!: string[];
    public ownerFullName!: string[];
    public ownerEmail!: string[];
    public ownerPhoneNumber!: string[];
    // public ownerAddress!: string[];
    public enCountry!: string[];
    public arCountry!: string[];
    public enCity!: string[];
    public arCity!: string[];
    public enZone!: string[];
    public arZone!: string[];
    public propertyFile!: PropertyFile[];
    public amenity!: Amenity[];
    public sourceTypeId!: number;
    public enPropertySourceType!: string;
    public arPropertySourceType!: string;
    public developerId!: number;
    public enDeveloperName!: string;
    public arDeveloperName!: string;
    public isRecommended!: boolean;
    public managedById!: number;
    public enManagedBy!: string;
    public arManagedBy!: string;
    public statusTypeId!: number;
    public enPropertyStatusType!: string;
    public arPropertyStatusType!: string;
    public publishedAt!: string;
    public isHighInvestmentReturn!: boolean;
    public isGreatPrice!: boolean;
    public projectId!: number;
    public enProjectName!: string;
    public arProjectName!: string;
    public propertyRegionId!: number;
    public stateId!: number;
    public isShowOnTop!: boolean;
    public isAlreadyLeased!: boolean;
    public external_360_link!: string[];
    public noOfParkings!: number;
    public noOfPalmTrees!: number;
    public noOfWaterWells!: number;
    public noOfApartments!: number;
    public noOfRetailOutlets!: number;
    public yearlyCharges!: DoubleRange[];
    public leaseContractEndDate!: Date;
    public leaseAmount!: DoubleRange[];
    public buildingNumber!: string[];
    public additionalNumbers!: string[];
    public enStreetName!: string[];
    public arStreetName!: string[];
    public enLandmark!: string[];
    public arLandmark!: string[];
    public enPropertyRegionType!: string;
    public arPropertyRegionType!: string;
    public enState!: string;
    public arState!: string;
    // public propertyForSlug!: string;
    // public propertyMainTypeSlug!: string;
    // public propertySubTypeSlug!: string;
    // public propertyOptionSlug!: string;
    // public propertyRegionSlug!: string;
    public countrySlug!: string;
    public stateSlug!: string;
    public citySlug!: string;
    public zoneSlug!: string;
    // public statusTypeSlug!: string;
    public arUserRole!: string[];
    public enUserRole!: string[];
    public subuserId!: number;
    public subuserFullName!: string;
}

PropertyView.init(
    {
        listingTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        mainTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        propertyTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        addedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        optionTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        darReference: {
            type: new DataTypes.STRING(100),
            allowNull: true,
        },
        unitReference: {
            type: new DataTypes.STRING(100),
            allowNull: true,
        },
        externalUrl: {
            type: new DataTypes.STRING(100),
            allowNull: true,
        },
        externalVideoLink: {
            type: new DataTypes.STRING(100),
            allowNull: true,
        },
        isSold: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isHotDeal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isExclusive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isInspected: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        slug: {
            type: new DataTypes.STRING(100),
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        furnishingTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        facingTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        roomTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        unitTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        currencyTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        possessionTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        ownershipTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        maintenanceChargeCycleId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        transactionTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        builtUpArea: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        carpetArea: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        superBuiltUpArea: {
            type: new DataTypes.INTEGER(),
            allowNull: true,
        },
        residenceTypeId: {
            type: new DataTypes.INTEGER(),
            allowNull: true,
        },
        noOfBedrooms: {
            type: new DataTypes.INTEGER(),
            allowNull: true,
        },
        noOfBathrooms: {
            type: new DataTypes.INTEGER(),
            allowNull: true,
        },
        campCapacity: {
            type: new DataTypes.INTEGER(),
            allowNull: true,
        },
        capacityPerRoom: {
            type: new DataTypes.INTEGER(),
            allowNull: true,
        },
        noOfFloors: {
            type: new DataTypes.INTEGER(),
            allowNull: true,
        },
        floorNumber: {
            type: new DataTypes.INTEGER(),
            allowNull: true,
        },
        salePrice: {
            type: new DataTypes.DOUBLE(),
            allowNull: true,
        },
        expectedRent: {
            type: new DataTypes.DOUBLE(),
            allowNull: true,
        },
        rentCycle: {
            type: new DataTypes.INTEGER(),
            allowNull: true,
        },
        rentPerSqFeet: {
            type: new DataTypes.DOUBLE(),
            allowNull: true,
        },
        securityDepositAmount: {
            type: new DataTypes.DOUBLE(),
            allowNull: true,
        },
        maintenanceCharge: {
            type: new DataTypes.DOUBLE(),
            allowNull: true,
        },
        monthlyChargeRange: {
            type: new DataTypes.DOUBLE(),
            allowNull: true,
        },
        isRentNegotiable: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        isWhatsappLater: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },

        possessionDate: {
            type: new DataTypes.DATE(),
            allowNull: true,
        },
        completionYear: {
            type: new DataTypes.STRING(100),
            allowNull: true,
        },
        countryId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        cityId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        zoneId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        // landmark: {
        //   type: DataTypes.STRING(100),
        //   allowNull: true,
        // },
        latitude: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enTitle: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arTitle: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enKeywords: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arKeywords: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enAddress: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enDescription: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arAddress: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arDescription: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enPropertyType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arPropertyType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enPropertyTypeOption: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arPropertyTypeOption: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enPropertyMainType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arPropertyMainType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enFurnishingType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arFurnishingType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enFacingType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arFacingType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enRoomType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arRoomType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enUnitType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arUnitType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enCurrencyType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arCurrencyType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enPossessionType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arPossessionType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enOwnershipType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arOwnershipType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enMaintenanceChargeType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arMaintenanceChargeType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enTransactionType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arTransactionType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enResidenceType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arResidenceType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enCountry: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arCountry: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enCity: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arCity: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enZone: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arZone: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ownerFullName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ownerEmail: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ownerPhoneNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        // ownerAddress: {
        //   type: DataTypes.STRING(100),
        //   allowNull: true,
        // },
        sourceTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        enPropertySourceType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arPropertySourceType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        developerId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        enDeveloperName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arDeveloperName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        isRecommended: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        managedById: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        enManagedBy: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arManagedBy: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        statusTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        enPropertyStatusType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arPropertyStatusType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        publishedAt: {
            type: new DataTypes.DATE(),
            allowNull: true,
        },
        isHighInvestmentReturn: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        isGreatPrice: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        projectId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        enProjectName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arProjectName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        propertyRegionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        isShowOnTop: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        isAlreadyLeased: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        external_360_link: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        noOfParkings: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        noOfPalmTrees: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        noOfWaterWells: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        noOfApartments: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        noOfRetailOutlets: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        yearlyCharges: {
            type: DataTypes.DOUBLE(),
            allowNull: true,
        },
        leaseContractEndDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        leaseAmount: {
            type: DataTypes.DOUBLE(),
            allowNull: true,
        },
        buildingNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        additionalNumbers: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enStreetName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arStreetName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enLandmark: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arLandmark: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enPropertyRegionType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arPropertyRegionType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enState: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arState: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        // propertyForSlug: {
        //   type: DataTypes.STRING(100),
        //   allowNull: true,
        // },
        // propertyRegionSlug: {
        //   type: DataTypes.STRING(100),
        //   allowNull: true,
        // },
        countrySlug: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        // propertyOptionSlug: {
        //   type: DataTypes.STRING(100),
        //   allowNull: true,
        // },
        // propertySubTypeSlug: {
        //   type: DataTypes.STRING(100),
        //   allowNull: true,
        // },
        // propertyMainTypeSlug: {
        //   type: DataTypes.STRING(100),
        //   allowNull: true,
        // },
        stateSlug: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        citySlug: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        zoneSlug: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        arUserRole: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enUserRole: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        postPropertyId: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        postedAs: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        en_slug: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        ar_slug: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        subuserId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        subuserFullName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        wathq_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        successDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'all_properties',
        underscored: true,
        paranoid: true,
    }
);

PropertyView.hasMany(PropertyFile, {
    foreignKey: 'property_id',
});
PropertyFile.belongsTo(PropertyView, {
    foreignKey: 'property_id',
});
