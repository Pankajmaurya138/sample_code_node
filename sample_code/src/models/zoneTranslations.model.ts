import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { Zone } from './zone.model';
export class ZoneTranslation extends Sequelize.Model {
    name?: string;
    locale?: string;
}

ZoneTranslation.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        zone_id: {
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
        tableName: 'zone_translations',
        underscored: true,
    }
);
