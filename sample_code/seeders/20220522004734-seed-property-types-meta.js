'use strict'

const { Op } = require('sequelize')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'Bedroom',
            'Bathroom',
            'LivingRoom',
            'GuestRoom',
            'ApartmentTotalFloor',
            'furnishingTypeId',
            'facingTypeId',
            'noOfApartments',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'builtUpArea',
            'landSize',
            'buildYear',
            'noOfWells',
            'amenities',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 41,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'Bedroom',
            'Bathroom',
            'LivingRoom',
            'GuestRoom',
            'ApartmentTotalFloor',
            'PropertyFloor',
            'furnishingTypeId',
            'facingTypeId',
            'residenceTypeId',
            'TotalCarParking',
            'noOfStreets',
            'streetWidth',
            'builtUpArea',
            'buildYear',
            'amenities',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 39,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'Bedroom',
            'Bathroom',
            'LivingRoom',
            'GuestRoom',
            'ApartmentTotalFloor',
            'furnishingTypeId',
            'facingTypeId',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'builtUpArea',
            'landSize',
            'buildYear',
            'amenities',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 52,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'facingTypeId',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'landSize',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 43,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'Bedroom',
            'Bathroom',
            'LivingRoom',
            'GuestRoom',
            'ApartmentTotalFloor',
            'furnishingTypeId',
            'facingTypeId',
            'TotalCarParking',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'builtUpArea',
            'landSize',
            'buildYear',
            'amenities',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 42,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'ApartmentTotalFloor',
            'residenceTypeId',
            'TotalCarParking',
            'noOfOpenings',
            'noOfApartments',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'builtUpArea',
            'landSize',
            'buildYear',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 47,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'Bedroom',
            'Bathroom',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'landSize',
            'noOfPalmTrees',
            'noOfWells',
            'amenities',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 44,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'Bedroom',
            'Bathroom',
            'LivingRoom',
            'GuestRoom',
            'furnishingTypeId',
            'residenceTypeId',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'builtUpArea',
            'landSize',
            'buildYear',
            'amenities',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 48,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'Bedroom',
            'Bathroom',
            'LivingRoom',
            'GuestRoom',
            'furnishingTypeId',
            'residenceTypeId',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'builtUpArea',
            'landSize',
            'buildYear',
            'amenities',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 53,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'ApartmentTotalFloor',
            'facingTypeId',
            'TotalCarParking',
            'noOfOpenings',
            'noOfStreets',
            'streetWidth',
            'builtUpArea',
            'buildYear',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 63,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'facingTypeId',
            'TotalCarParking',
            'noOfOpenings',
            'noOfStreets',
            'streetWidth',
            'builtUpArea',
            'buildYear',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 55,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'PropertyFloor',
            'furnishingTypeId',
            'facingTypeId',
            'TotalCarParking',
            'noOfStreets',
            'builtUpArea',
            'buildYear',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 56,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'ApartmentTotalFloor',
            'facingTypeId',
            'TotalCarParking',
            'noOfOpenings',
            'noOfOffices',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'builtUpArea',
            'landSize',
            'buildYear',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 61,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'builtUpArea',
            'landSize',
            'buildYear',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 58,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'Bedroom',
            'Bathroom',
            'ApartmentTotalFloor',
            'landLength',
            'landDepth',
            'builtUpArea',
            'landSize',
            'buildYear',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 59,
      }
    )

    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: {
          features: [
            'facingTypeId',
            'noOfStreets',
            'streetWidth',
            'landLength',
            'landDepth',
            'landSize',
            'electricity',
            'water',
            'title',
            'description',
          ],
        },
      },
      {
        id: 49,
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate(
      'property_types',
      {
        meta: null,
      },
      {
        id: {
          [Op.in]: [
            41, 39, 52, 43, 42, 47, 44, 48, 53, 63, 55, 56, 61, 58, 59, 49,
          ],
        },
      }
    )
  },
}
