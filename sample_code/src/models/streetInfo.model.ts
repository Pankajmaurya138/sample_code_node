import * as Sequelize from 'sequelize';
import { Property } from './property.model';
import { sequelize } from './sequelize';
import { TypeMaster } from './typeMaster.model';

export class StreetInfo extends Sequelize.Model {}

StreetInfo.init(
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
        streetWidth: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        facingTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        position: {
            type: Sequelize.BIGINT,
        },
    },

    {
        sequelize,
        tableName: 'street_info',
        underscored: true,
        paranoid: true,
        timestamps: false,
    }
);

StreetInfo.belongsTo(Property);
Property.hasMany(StreetInfo);

StreetInfo.belongsTo(TypeMaster, {
    foreignKey: 'facing_type_id',
    as: 'facing',
});
