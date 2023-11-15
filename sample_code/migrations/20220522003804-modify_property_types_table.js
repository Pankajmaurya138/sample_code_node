'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('property_types', 'meta', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('property_types', 'meta')
  },
}
