import * as Sequelize from 'sequelize';
import { propertyAttributes } from '../util/static';
import { sequelize } from './sequelize';
import { TypeMaster } from './typeMaster.model';

export class PropertyAttribute extends Sequelize.Model {
    public id!: number;
    public furnishing_type_id!: number;
    public facing_type_id!: number;
    public room_type_id!: number;
    public unit_type_id!: number;
    public currency_type_id!: number;
    public possession_type_id!: number;
    public ownership_type_id!: number;
    public unit_reference!: number;
    public maintenance_charge_cycle_id!: number;
    public transaction_type_id!: number;
    public built_up_area!: number;
    public carpet_area!: number;
    public super_built_up_area!: number;
    public residence_type_id!: number;
    public no_of_bedrooms!: number;
    public no_of_bathrooms!: number;
    public no_of_living_rooms!: number;
    public no_of_guestrooms!: number;
    public camp_capacity!: number;
    public no_of_floors!: number;
    public capacity_per_room!: number;
    public floor_number!: number;
    public expected_rent!: DoubleRange[];
    public sale_price!: DoubleRange[];
    public rent_cycle!: number;
    public security_deposit_amount!: DoubleRange[];
    public rent_per_sq_feet!: DoubleRange[];
    public maintenance_charge!: DoubleRange[];
    public is_rent_negotiable!: boolean;
    public electricity_meter!: boolean;
    public water_meter!: boolean;
    public possession_date!: Date;
    public completion_year!: string[];
    public yearlyCharges!: string[];
    public streetWidth!: number;
}

PropertyAttribute.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        propertyId: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        furnishingTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        facingTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        roomTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        unitTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        currencyTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        possessionTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        ownershipTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        maintenanceChargeCycleId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        transactionTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        builtUpArea: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        carpetArea: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        superBuiltUpArea: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        residenceTypeId: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        noOfBedrooms: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        noOfBathrooms: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        noOfLivingrooms: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        noOfGuestrooms: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        campCapacity: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        capacityPerRoom: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        noOfFloors: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        floorNumber: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        salePrice: {
            type: new Sequelize.DOUBLE(),
            allowNull: true,
        },
        expectedRent: {
            type: new Sequelize.DOUBLE(),
            allowNull: true,
        },
        rentCycle: {
            type: new Sequelize.INTEGER(),
            allowNull: true,
        },
        rent_per_sq_feet: {
            type: new Sequelize.DOUBLE(),
            allowNull: true,
        },
        securityDepositAmount: {
            type: new Sequelize.DOUBLE(),
            allowNull: true,
        },
        maintenanceCharge: {
            type: new Sequelize.DOUBLE(),
            allowNull: true,
        },
        monthlyChargeRange: {
            type: new Sequelize.DOUBLE(),
            allowNull: true,
        },
        isRentNegotiable: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },
        possessionDate: {
            type: new Sequelize.DATE(),
            allowNull: true,
        },
        completionYear: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        yearlyCharges: {
            type: new Sequelize.DOUBLE(),
            allowNull: true,
        },
        noOfParkings: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        noOfPalmTrees: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        noOfWaterWells: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        noOfApartments: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        noOfRetailOutlets: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },

        leaseContractEndDate: {
            type: new Sequelize.DATE(),
            allowNull: true,
        },
        leaseAmount: {
            type: new Sequelize.DOUBLE(),
            allowNull: true,
        },
        streetWidth: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        noOfStreet: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        street1Width: {
            type: Sequelize.SMALLINT,
            allowNull: true,
            defaultValue: null,
        },
        street2Width: {
            type: Sequelize.SMALLINT,
            allowNull: true,
            defaultValue: null,
        },
        street3Width: {
            type: Sequelize.SMALLINT,
            allowNull: true,
            defaultValue: null,
        },
        street4Width: {
            type: Sequelize.SMALLINT,
            allowNull: true,
            defaultValue: null,
        },
        waterMeter: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        electricityMeter: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        noOfOffice: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        landDepth: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        landLength: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        noOfOpening: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'property_attributes',
        underscored: true,
        paranoid: false,
    }
);

PropertyAttribute.belongsTo(TypeMaster, {
    foreignKey: 'furnishing_type_id',
    as: 'furnishingStatus',
});

PropertyAttribute.belongsTo(TypeMaster, {
    foreignKey: 'residence_type_id',
    as: 'residenceType',
});
