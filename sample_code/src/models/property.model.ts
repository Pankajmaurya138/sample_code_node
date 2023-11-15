import { Model, DataTypes, Transaction } from 'sequelize';

import { sequelize } from './sequelize';

import { PropertyTranslation } from './propertyTranslation.model';
import { PropertyAttribute } from './propertyAttribute.model';
import { PropertyLocation } from './propertyLocation.model';
import { Amenity } from './amenity.model';
import { AmenityProperty } from './amenityProperty.model';
import { PropertyFile } from './propertyFile.model';
import { User } from './user.model';
import { TypeMaster } from './typeMaster.model';
import { PropertyTypes } from './propertyTypes.model';
import { PropertyStatusLog } from './propertyStatusLog.model';
import { Project } from './project.model';
import { DeveloperTranslation } from './developerTranslation.model';
import { Developer } from './developer.model';
import { PostProperty } from './postProperty.model';
import { PropertyTypeOption } from './propertyTypeOptions.model';
import { PropertyVerificationInfo } from './propertyVerificationInfo.model';
import { Realestate_deed } from './realestate_deed.model';

export class Property extends Model {
    public id!: number;
    public listing_type_id!: number;
    public subuser_id!: number;
    public main_type_id!: number;
    public user_id!: number;
    public added_by!: number;
    public option_type_id!: number;
    public property_type_id!: number;
    public property_region_id!: number;
    public statusTypeId!: number;
    public dar_reference!: string[];
    public unit_reference!: string[];
    public source_type_id!: number[];
    public external_url!: string[];
    public external_360_link!: string[];
    public external_video_link!: string[];
    public is_sold!: boolean;
    public is_hot_deal!: boolean;
    public is_exclusive!: boolean;
    public is_featured!: boolean;
    public is_inspected!: boolean;
    public is_active!: boolean;
    public is_show_on_top!: boolean;
    public createdAt!: Date;
    public publishedAt!: Date;
    public slug!: string[];
    public source!: string[];
    public propertyFor!: TypeMaster;
    public propertyRegion!: TypeMaster;
    public PropertyType!: PropertyTypes;
    public propertyTranslation!: PropertyTranslation[];
    public propertyAttribute!: PropertyAttribute[];
    public propertyOwnerId!: number;
    public subuserId!: number;
    public propertyVerificationInfoId!: number;
    public authType!: number;
}

Property.init(
    {
        propertyRegionId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        statusTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        listingTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        subuser_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        managedById: {
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
        developerId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        projectId: {
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
        sourceTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        darReference: {
            type: new DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null,
        },

        unitReference: {
            type: new DataTypes.STRING(100),
            allowNull: true,
        },
        source: {
            type: new DataTypes.STRING(200),
            allowNull: true,
        },
        externalUrl: {
            type: new DataTypes.STRING(100),
            allowNull: true,
        },
        external_360_link: {
            type: new DataTypes.STRING(100),
            allowNull: true,
        },
        external_video_link: {
            type: new DataTypes.STRING(100),
            allowNull: true,
        },
        isSold: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isAlreadyLeased: {
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
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        isWhatsappLater: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        postPropertyId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        isRecommended: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isAuction: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        propertyOwnerId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        titleDeedNo: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        postedAs: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        isWathqVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        realestateDeedId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        rega_authorization_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        subuserId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        propertyVerificationInfoId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
        },
        sourcePlatformTypeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        successDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        authType: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'properties',
        underscored: true,
        paranoid: true,
    }
);
Property.hasMany(PropertyTranslation);
PropertyTranslation.belongsTo(Property);
Property.belongsTo(User);

Property.hasOne(PropertyAttribute);
PropertyAttribute.belongsTo(Property);
Property.hasOne(PropertyLocation);
PropertyLocation.belongsTo(Property);
Property.hasMany(PropertyFile);
PropertyFile.belongsTo(Property);
Property.belongsToMany(Amenity, {
    through: AmenityProperty,
    foreignKey: 'propertyId',
});
Amenity.belongsToMany(Property, {
    through: AmenityProperty,
    foreignKey: 'amenityId',
});
Property.hasOne(PropertyStatusLog);
Property.belongsTo(Developer);
Property.belongsTo(Project);
Property.belongsTo(TypeMaster, {
    foreignKey: 'listing_type_id',
    as: 'propertyFor',
});
Property.belongsTo(TypeMaster, {
    foreignKey: 'statusTypeId',
    as: 'statusType',
});
Property.belongsTo(TypeMaster, {
    foreignKey: 'sourceTypeId',
    as: 'sourceType',
});
Property.belongsTo(PropertyTypes, {
    foreignKey: 'propertyTypeId',
    as: 'propertyType',
});

PropertyAttribute.belongsTo(TypeMaster, {
    foreignKey: 'unitTypeId',
    as: 'unitType',
});
PropertyAttribute.belongsTo(TypeMaster, {
    foreignKey: 'currencyTypeId',
    as: 'currencyType',
});
Property.belongsTo(TypeMaster, {
    foreignKey: 'property_region_id',
    as: 'propertyRegion',
});

// Property.belongsTo(PropertyTypes, {
//   foreignKey: "main_type_id",
// });

Property.belongsTo(PostProperty);
PostProperty.hasOne(Property);
Property.belongsTo(PropertyTypeOption, {
    foreignKey: 'option_type_id',
});
PropertyTypeOption.hasMany(Property, {
    foreignKey: 'option_type_id',
});

Property.belongsTo(PropertyVerificationInfo);
PropertyVerificationInfo.hasOne(Property);

Property.belongsTo(Realestate_deed);
Realestate_deed.hasOne(Property);
