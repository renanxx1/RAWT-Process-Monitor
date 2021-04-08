const Activity = require('../models/Activity');
const sequelize = require('../database/database');
const Collaborator = require('../models/Collaborator');
const Activity_Chronometer = require('../models/Activity_Chronometer');
const Process = require('../models/Process');
const Process_Counter = require('../models/Process_Counter');
const {
    Op
} = require("sequelize");
const moment = require('moment');

class DashboardRepository {

    async findAllChronometers(collaborator_id) {
        return await
            Activity_Chronometer.findAll({
                where: {
                    [Op.and]: [{
                        collaborator_id: collaborator_id,
                        createdAt: moment().format('YYYY-MM-DD')
                    }]
                },
            })
    }

    async findAllActivitiesAndChronometers(collaborator_id, process_id, startDate, endDate) {
        return await
            sequelize.query('SELECT activities.activity_name, activities.group_id, activities.status, activities.process_id, activities_chronometers.id, activities_chronometers.time,  activities_chronometers.work_time, activities_chronometers.counter, activities_chronometers.activity_id, activities_chronometers.createdAt, activities_chronometers.updatedAt, activities_chronometers.collaborator_id, min(activities_chronometers.createdAt) as min_date, max(activities_chronometers.createdAt) as max_date, sum(activities_chronometers.time) as total_time, sum(activities_chronometers.work_time)as sum_work_time FROM activities INNER JOIN activities_chronometers ON activities.id = activities_chronometers.activity_id WHERE activities_chronometers.collaborator_id = ? AND activities_chronometers.createdAt BETWEEN ? AND ? GROUP BY activities.id', {
                replacements: [collaborator_id, startDate, endDate], type: sequelize.QueryTypes.SELECT,
                raw: true,
                nest: true,
            });
    }

    /*SELECT activities.activity_name, activities.group_id, activities.status, activities.process_id, activities_chronometers.id, activities_chronometers.time,  activities_chronometers.work_time, activities_chronometers.counter, activities_chronometers.activity_id, activities_chronometers.collaborator_id, min(activities_chronometers.createdAt), max(activities_chronometers.createdAt), sum(activities_chronometers.time) FROM activities INNER JOIN activities_chronometers ON activities.id = activities_chronometers.activity_id WHERE activities_chronometers.collaborator_id = 1 AND activities_chronometers.createdAt BETWEEN '2021-04-02' AND '2021-04-07' GROUP BY activities.id */

    async findAllActivitiesAndChronometersOnlyId(collaborator_id) {
        return await
            Activity_Chronometer.findAll({
                attributes: ['activity_id'],
                raw: true,
                where: {
                    [Op.and]: [{
                        collaborator_id: collaborator_id,
                        createdAt: moment().format('YYYY-MM-DD')
                    }]
                },
            })
    }

    async findIdleTime(collaborator_id, process_id, startDate, endDate) {
        return await
            sequelize.query('SELECT *, sum(time) as total_time_idle FROM activities_chronometers WHERE activity_id is NULL AND  collaborator_id = ? AND createdAt BETWEEN ? AND ? GROUP BY activity_id;'
                , {
                    replacements: [collaborator_id, startDate, endDate], type: sequelize.QueryTypes.SELECT,
                    raw: true,
                    nest: true,
                });

    }

 /*    async findProcessAndCounter(collaborator_id, process_id, startDate, endDate) {
        return await
            Process_Counter.findOne({
                raw: true,
                nest: true,
                where: {
                    [Op.and]: [{
                        collaborator_id: collaborator_id,
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        },
                    }],
                }
            })
    } */

    async findAllProcessAndCounter(collaborator_id, process_id, startDate, endDate) {
        return await
            sequelize.query('SELECT * FROM processes_counters WHERE collaborator_id = ? AND createdAt BETWEEN ? AND ? GROUP BY id'
                , {
                    replacements: [collaborator_id, startDate, endDate], type: sequelize.QueryTypes.SELECT,
                    raw: true,
                    nest: true,
                });

    }

    async findCollaboratorAndProcess(process, collaborator_id) {
        return await
            Collaborator.findOne({
                attributes: ['id', 'collaborator_name'],
                raw: true,
                nest: true,
                include: [{
                    model: Process,
                    where: {
                        process_name: process
                    }
                }],
                where: {
                    [Op.and]: [{
                        id: collaborator_id,
                        status: true
                    }]
                }
            })
    }


}

module.exports = new DashboardRepository();