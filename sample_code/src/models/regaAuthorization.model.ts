import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class RegaAuthorization extends Sequelize.Model {
    id: any;
}

RegaAuthorization.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        idType: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        advertiserNumber: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        advertiserIdNumber: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        authorizationNumber: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        authorizationIdNumber: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        authorizationAdvertiserNumber: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        isRegaVerified: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        isAdvertiserVerified: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'rega_authorization',
        underscored: true,
        paranoid: true,
    }
);

/**
 * @description it saves the rega details which come from the updating/adding new property
 * @param arg
 * @returns returns the id of the saved data
 */
export const saveRegaDetails = async (arg: any) => {
    let responseData: any = {};
    // console.log(arg);

    const regaDetails = {
        idType: arg?.idType,
        advertiserNumber: arg?.regaAdNumber,
        advertiserIdNumber: arg?.nationalIdNumber,
        authorizationNumber: arg?.regaAuthorizationId,
        authorizationIdNumber: arg?.nationalIdNumber,
        authorizationAdvertiserNumber: arg?.regaAdNumber,
    };
    const regaAuthData: any = await RegaAuthorization.findOne({
        where: {
            advertiserIdNumber: regaDetails.advertiserIdNumber,
        },
    });
    if (regaAuthData) {
        if (!regaAuthData.isAdvertiserVerified)
            responseData = await regaAuthData.update(regaDetails);
    } else {
        responseData = await RegaAuthorization.create(regaDetails);
    }

    // console.log(regaAuthData);
    return responseData?.id;
};
