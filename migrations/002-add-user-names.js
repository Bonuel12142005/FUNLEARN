export const up = async (queryInterface, Sequelize) => {
  // Add firstName and lastName columns to Users table
  await queryInterface.addColumn('Users', 'firstName', {
    type: Sequelize.STRING,
    allowNull: true // Allow null initially for existing users
  });

  await queryInterface.addColumn('Users', 'lastName', {
    type: Sequelize.STRING,
    allowNull: true // Allow null initially for existing users
  });

  // Update the role enum to include 'viewer'
  await queryInterface.changeColumn('Users', 'role', {
    type: Sequelize.ENUM('inspector', 'viewer', 'reviewer', 'approver', 'admin'),
    allowNull: false,
    defaultValue: 'inspector'
  });

  // Update existing users to have firstName and lastName based on fullName
  await queryInterface.sequelize.query(`
    UPDATE Users 
    SET firstName = SUBSTRING_INDEX(fullName, ' ', 1),
        lastName = CASE 
          WHEN LOCATE(' ', fullName) > 0 
          THEN SUBSTRING(fullName, LOCATE(' ', fullName) + 1)
          ELSE ''
        END
    WHERE firstName IS NULL OR lastName IS NULL
  `);

  // Now make firstName and lastName NOT NULL
  await queryInterface.changeColumn('Users', 'firstName', {
    type: Sequelize.STRING,
    allowNull: false
  });

  await queryInterface.changeColumn('Users', 'lastName', {
    type: Sequelize.STRING,
    allowNull: false
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Remove the added columns
  await queryInterface.removeColumn('Users', 'firstName');
  await queryInterface.removeColumn('Users', 'lastName');

  // Revert the role enum
  await queryInterface.changeColumn('Users', 'role', {
    type: Sequelize.ENUM('inspector', 'reviewer', 'approver', 'admin'),
    allowNull: false,
    defaultValue: 'inspector'
  });
};