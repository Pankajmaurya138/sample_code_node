import * as Sequelize from 'sequelize';
import { literal } from 'sequelize';
import { NATIONALITY_CODE } from '../util/static';
import { sequelize } from './sequelize';
import { User } from './user.model';
import { UserInfo } from './userInfo.model';
// import { UserVerifiedInfoTranslation } from "./userVerifiedInfoTranslation.model";
export class UserVerifiedInfo extends Sequelize.Model {}
UserVerifiedInfo.init(
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        absher_id: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        gender: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        id_version_no: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        nationality_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        exp: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        lang: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        iat: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        jti: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        card_issue_date_gregorian: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        card_issue_date_hijri: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        iqama_expiry_date_gregorian: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        iqama_expiry_date_hijri: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        id_expiry_date_gregorian: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        id_expiry_date_hijri: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        dob_hijri: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        dob_gregorian: {
            type: new Sequelize.STRING(50),
            allowNull: true,
        },
        nbf: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        assurance_level: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        /*is_ksa_citizen: {
            type: Sequelize.BOOLEAN,
            defaultValue:false,
            allowNull: false,
        },*/
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
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
    },
    {
        sequelize,
        tableName: 'user_verified_info',
        underscored: true,
        paranoid: true,
    }
);

UserVerifiedInfo.belongsTo(User);
User.hasOne(UserVerifiedInfo);

// UserVerifiedInfo.hasMany(UserVerifiedInfoTranslation);
// UserVerifiedInfoTranslation.belongsTo(UserVerifiedInfo, {
//   foreignKey: "user_verified_info_id",
//   as: "userVerifiedInfoTranslation",
// });

export const getVerifiedUserDetails = async (userId: any) => {
    let userData: any = await User.findOne({
        where: {
            id: userId,
        },
        include: [
            { model: UserInfo },
            {
                model: UserVerifiedInfo,
                attributes: [
                    'absher_id',
                    'nationality_id',
                    [
                        literal(
                            '(SELECT code FROM nationality WHERE id = nationality_id )'
                        ),
                        'nationality_code',
                    ],
                ],
            },
        ],
    });

    let response = {
        absher_id: userData?.UserVerifiedInfo?.absher_id,
        fullName: userData?.UserInfo?.full_name,
        phoneNumber: userData?.phone_number,
        nationality_code:
            userData?.UserVerifiedInfo?.getDataValue('nationality_code'),
        ksa_citizen:
            userData?.UserVerifiedInfo?.getDataValue('nationality_code') ==
            NATIONALITY_CODE
                ? true
                : false,
        phone_number_country_code: userData?.phone_number_country_code,
    };

    return response;
};
