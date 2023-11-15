import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';

export class CommercialRegistrationDetails extends Sequelize.Model {}
CommercialRegistrationDetails.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        cr_number: {
            type: Sequelize.BIGINT,
        },
        company_name: {
            type: new Sequelize.STRING(150),
        },
        is_verified: {
            type: Sequelize.BOOLEAN,
        },
        created_at: {
            type: Sequelize.DATE,
            field: 'created_at',
            allowNull: false,
        },
        updated_at: {
            type: Sequelize.DATE,
            field: 'updated_at',
            allowNull: true,
        },
        issue_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        expiry_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    },

    {
        sequelize,
        tableName: 'commercial_regis_details',
        underscored: true,
        paranoid: false,
        timestamps: true,
    }
);
