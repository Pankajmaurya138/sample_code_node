import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { ZoneTranslation } from './zoneTranslations.model';
import { City } from './city.model';
import { CityTranslation } from './cityTranslations.model';
import { User } from './user.model';
export class Zone extends Sequelize.Model {}

Zone.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        city_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        slug: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        post_code: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
    },

    {
        sequelize,
        tableName: 'zones',
        underscored: true,
        paranoid: true,
    }
);

Zone.hasMany(ZoneTranslation);
ZoneTranslation.belongsTo(Zone);
Zone.belongsTo(City);
