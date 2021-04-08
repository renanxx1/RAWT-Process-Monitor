const Sequelize = require("sequelize");
const connection = require("../database/database");
const moment = require("moment");

const Group = connection.define("group", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    group_name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    createdAt: {
        type: Sequelize.DATE,
        get() {
            return moment(this.getDataValue('createdAt')).format('DD/MM/YYYY HH:mm:ss');
        }
    },
    updatedAt: {
        type: Sequelize.DATE,
        get() {
            return moment(this.getDataValue('updatedAt')).format('DD/MM/YYYY HH:mm:ss');
        }
    }
});



Group.sync({
    force: false
});
module.exports = Group;

//ALTER TABLE `atividades` CHANGE grupo grupo VARCHAR(200) CHARACTER SET latin1 COLLATE latin1_general_cs;
//Para alterar grupo para collate latin 1, sequelize nao suporta alteração de collate por colunas.
