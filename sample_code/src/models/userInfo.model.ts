import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class UserInfo extends Sequelize.Model {}

UserInfo.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.BIGINT,
        },
        full_name: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        licence_number: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        contract_ref: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        contract_file: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        avatar: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        ip_address: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        contract_expired_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'user_infos',
        underscored: true,
    }
);
