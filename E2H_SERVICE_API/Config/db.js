const { Sequelize } = require('sequelize');

const connection = new Sequelize('e2h_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    timezone : '+07:00',
    dialectOptions: {
        timezone: '+07:00',
        dateStrings: true,
        typeCast: true
    },
    logging: false // ปิดการแสดง log ของ SQL ถ้าต้องการ
});

const testConnection = async () => {
    try {
        await connection.authenticate();
        console.log('DB Connected!!');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
};


testConnection();

module.exports = connection;