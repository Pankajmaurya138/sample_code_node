import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { TypeMaster } from './typeMaster.model';

export class TypeMasterTranslation extends Sequelize.Model {
    name?: string;
    locale?: string;
}

TypeMasterTranslation.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        typeMasterId: {
            type: new Sequelize.BIGINT(),
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
        tableName: 'type_master_translations',
        underscored: true,
    }
);
