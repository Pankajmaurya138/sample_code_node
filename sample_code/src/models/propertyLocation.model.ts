import * as Sequelize from 'sequelize';
import { City } from './city.model';
import { sequelize } from './sequelize';
import { Zone } from './zone.model';

export class PropertyLocation extends Sequelize.Model {}

PropertyLocation.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        propertyId: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        countryId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        stateId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        cityId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        zoneId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        landmark: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        address: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        latitude: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        longitude: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'property_locations',
        underscored: true,
        paranoid: false,
    }
);
PropertyLocation.belongsTo(City);
City.hasMany(PropertyLocation, {
    as: 'propertyLocationCity',
});

PropertyLocation.belongsTo(Zone);
Zone.hasMany(PropertyLocation);
