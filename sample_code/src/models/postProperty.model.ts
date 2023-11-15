import * as Sequelize from 'sequelize';
import { Property } from './property.model';
import { PropertyVerificationInfo } from './propertyVerificationInfo.model';
import { sequelize } from './sequelize';

export class PostProperty extends Sequelize.Model {
    id: number;
    listingTypeId: number;
    propertyVerificationInfoId: number;
    addedBy: number;
    userId: number;
    PropertyVerificationInfo: PropertyVerificationInfo;
    address: string;
    longitude: string;
    latitude: string;
    districtId: number;
    Property: Property;
    realestateDeedId: number;
    currentStep: string;
    status: string;
}

PostProperty.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        userTypeId: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        addedBy: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        licenseNumber: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        isDifferentOwner: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },
        managedById: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        cityId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        titleDeedNo: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        nationalIdNumber: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        idType: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        ownerName: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        ownerMobileNo: {
            type: new Sequelize.BIGINT(),
            allowNull: true,
        },
        ownerMobileCountryCode: {
            type: new Sequelize.STRING(10),
            allowNull: true,
        },
        regaAuthorizationId: {
            type: new Sequelize.BIGINT(),
            allowNull: true,
            defaultValue: null,
        },
        status: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        currentStep: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        isWathqVerified: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },
        realestateDeedId: {
            type: new Sequelize.BIGINT(),
            allowNull: true,
            defaultValue: null,
        },
        regaAdNumber: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        listingTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        subUserId: {
            type: Sequelize.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        propertyVerificationInfoId: {
            type: Sequelize.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        address: {
            type: new Sequelize.STRING(500),
            allowNull: true,
        },
        latitude: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        longitude: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        districtId: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        posted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        source: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'post_properties',
        underscored: true,
    }
);

PostProperty.belongsTo(PropertyVerificationInfo);
PropertyVerificationInfo.hasOne(PostProperty);
