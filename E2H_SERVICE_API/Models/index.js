User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });
Building.associate({ Room });
Room.associate({ Building });