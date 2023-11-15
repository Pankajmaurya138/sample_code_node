import * as Sequelize from 'sequelize';
import { AgentPermission } from './agentPermission.model';
import { AgentUserPermission } from './agentUserPermission.model';
import { sequelize } from './sequelize';
import { UserInfo } from './userInfo.model';

export class User extends Sequelize.Model {
    parent_id: number;
}
User.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        parent_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
            defaultValue: null,
        },

        email: {
            type: new Sequelize.STRING(128),
            allowNull: true,
        },
        phone_number: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        whats_app_number: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        phone_number_country_code: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        whats_app_number_country_code: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        password: {
            type: new Sequelize.STRING(128),
            allowNull: true,
        },
        preferred_language: {
            type: Sequelize.ENUM('en', 'ar'),
        },
        preferred_timezone: {
            type: Sequelize.STRING(100),
        },
        verification_token: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        verification_token_expire_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        last_seen_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        email_verified_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        phone_verified_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        whats_app_verified_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        isPropertyFieldsRequired: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        status: {
            type: Sequelize.BIGINT,
        },
    },

    {
        sequelize,
        tableName: 'users',
        underscored: true,
        paranoid: true,
    }
);

User.hasOne(UserInfo);
User.belongsTo(User, { foreignKey: 'parent_id', as: 'parentUser' });

User.belongsToMany(AgentPermission, { through: AgentUserPermission });
