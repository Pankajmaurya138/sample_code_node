import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class PropertyOwner extends Sequelize.Model {
    id!: Number;
    email!: String;
    fullName!: String;
    fullNameAr!: String;
    phoneNumberCode!: String;
    phoneNumber!: Number;
    idType!: String;
    idNumber!: Number;
    isDifferentOwner!: Number;
}

PropertyOwner.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: new Sequelize.STRING(128),
            allowNull: true,
        },
        fullName: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        fullNameAr: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        phoneNumberCode: {
            type: new Sequelize.STRING(10),
            allowNull: true,
        },
        phoneNumber: {
            type: new Sequelize.BIGINT(),
            allowNull: true,
        },
        idType: {
            type: new Sequelize.STRING(20),
            allowNull: true,
        },
        idNumber: {
            type: new Sequelize.BIGINT(),
            allowNull: true,
        },
        isDifferentOwner: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'property_owners',
        underscored: true,
        paranoid: true,
    }
);

export const searchPropertyOwner = async (arg: any) => {
    try {
        var order: any = ['id', 'DESC'];
        var searchData = { [Sequelize.Op.iLike]: '%' + arg.query + '%' };
        var id_number = parseInt(arg.query);
        var where: any = {
            [Sequelize.Op.or]: [
                { full_name: searchData },
                { id_number: isNaN(id_number) ? '' : id_number },
            ],
        };

        var order: any = ['full_name', 'ASC'];
        return PropertyOwner.findAll({
            raw: true,
            attributes: [
                'full_name',
                ['id', 'user_id'],
                'email',
                'phone_number',
                //  [
                //     literal(
                //       `CASE WHEN "User"."email" != 'null' THEN "User"."email" ELSE cast(col("User"."phone_number"), "varchar") END`
                //     ),
                //     "User.email",
                //   ],
            ],
            where: where,
            order: [order],
        });
    } catch (error) {
        console.log('searchPropertyOwner==>error', error);
    }
};

/**
 * @description find the details about owner from the owner id
 * @param arg
 * @returns return single owner details
 */
export const searchPropertyOwnerById = async (arg: any) => {
    try {
        var order: any = ['id', 'DESC'];
        var where: any = {
            id: arg.id,
        };

        // var order: any = ["full_name", "ASC"];
        return PropertyOwner.findOne({
            where: where,
            order: [order],
        });
    } catch (error) {
        console.log('searchPropertyOwnerById==>error', error);
    }
};

/**
 * @description create owner if the nid doesn't exist
 * @param postedProperty
 * @returns return owner Id
 */
export const createOrFindOwner = async (postedProperty: any) => {
    let ownerExist = await PropertyOwner.findOne({
        where: {
            idType: postedProperty?.idType,
            idNumber: postedProperty?.nationalIdNumber,
        },
    });
    if (ownerExist) {
        return ownerExist?.id;
    } else {
        let owner = await PropertyOwner.create({
            idNumber: postedProperty?.nationalIdNumber,
            idType: postedProperty?.idType,
            fullName: postedProperty?.ownerName,
            phoneNumber: postedProperty?.ownerMobileNo,
            phoneNumberCode: postedProperty?.ownerMobileCountryCode,
            isDifferentOwner: postedProperty?.isDifferentOwner,
        });
        return owner?.id;
    }
};
