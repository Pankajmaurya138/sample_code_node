import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class PropertyFile extends Sequelize.Model {}

PropertyFile.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new Sequelize.STRING(255),
            allowNull: false,
        },
        property_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        type: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'property_files',
        underscored: true,
    }
);
