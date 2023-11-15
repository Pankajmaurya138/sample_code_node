import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { City } from './city.model';
export class CityTranslation extends Sequelize.Model {}

CityTranslation.init(
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
        name: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        locale: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'city_translations',
        underscored: true,
    }
);
