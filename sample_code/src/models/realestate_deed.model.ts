import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';

export class Realestate_deed extends Sequelize.Model {}

Realestate_deed.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        Deedcode: {
            type: Sequelize.NUMBER,
            field: 'deed_code',
            allowNull: false,
        },
        OwnerId: {
            type: Sequelize.NUMBER,
            field: 'owner_id',
            allowNull: false,
        },
        Idtype: {
            type: Sequelize.STRING(100),
            field: 'id_type',
            allowNull: false,
        },
        serialNumber: {
            type: Sequelize.NUMBER,
            field: 'serial_number',
        },
        issueDate: {
            type: Sequelize.DATE,
            field: 'issue_date',
        },
        courtId: {
            type: Sequelize.BIGINT,
            field: 'court_id',
        },
        courtName: {
            type: Sequelize.STRING(100),
            field: 'court_name',
        },
        cityId: {
            type: Sequelize.BIGINT,
            field: 'city_id',
        },
        cityName: {
            type: Sequelize.STRING(100),
            field: 'city_name',
        },
        status: {
            type: Sequelize.STRING(100),
        },
        area: {
            type: Sequelize.STRING(100),
        },
        areaText: {
            type: Sequelize.STRING(100),
            field: 'area_text',
        },
        note: {
            type: Sequelize.STRING(100),
        },
        isCondtrained: {
            type: Sequelize.BOOLEAN,
            field: 'is_condtrained',
        },
        isHalt: {
            type: Sequelize.BOOLEAN,
            field: 'is_halt',
        },
        isPawned: {
            type: Sequelize.BOOLEAN,
            field: 'is_pawned',
        },
        isTestament: {
            type: Sequelize.BOOLEAN,
            field: 'is_testament',
        },
        share: {
            type: Sequelize.BOOLEAN,
        },
        responseData: {
            type: Sequelize.TEXT,
            field: 'response_data',
        },
        createdAt: {
            type: Sequelize.DATE,
            field: 'created_at',
            allowNull: false,
        },
        updatedAt: {
            type: Sequelize.DATE,
            field: 'updated_at',
            allowNull: true,
        },
        deletedAt: {
            type: Sequelize.DATE,
            field: 'deleted_at',
            allowNull: true,
        },
    },

    {
        sequelize,
        tableName: 'realestate_deed',
        underscored: true,
        paranoid: false,
    }
);
