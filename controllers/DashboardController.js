const DashboardService = require('../services/DashboardService');
class DashboardController {


    async index(req, res) {
        renderIndex(req, res, 200);
    }

    async dashboardIndex(req, res) {
        renderDashboard(req, res, 200);
    }
}


async function renderIndex(req, res, code) {
    res.status(code).render('dashboards/index', {
        statusCode: code,
    });
}


async function renderDashboard(req, res, code) {
    var collaborator = await DashboardService.dashboardIndexGet(req.params.process, req.params.id);
    res.status(code).render('dashboards/dashboardProcess', {
        collaborator: collaborator,
        statusCode: code,
    });
}


io.on("connection", async function (socket) {

    socket.on('getDataChart', async (data) => {
        var chartData = await DashboardService.getDashboardData(data.collaborator_id, data.process_id, data.startDate, data.endDate);
        if (data.action == 1) {
            socket.emit('chartData', chartData);
        } else {
            socket.emit('chartDataIdle', chartData);
        }
    })

    socket.on('getDataChartUpdate', async (data) => {
        var chartData = await DashboardService.getDashboardData(data.collaborator_id, data.process_id, data.startDate, data.endDate);
        socket.emit('chartDataUpdate', chartData);
    })

    socket.on('activityOn', async (data) => {
        try {
            if (data.process_counter) {
                io.emit('newDataAvailable', {
                    collaborator_id: data.collaborator_id,
                    process_counter: data.process_counter,
                    process_counter_name: data.process_counter_name
                })
            } else {
                io.emit('newDataAvailable', {
                    collaborator_id: data.collaborator_id,
                    activity_id: data.activity_id,
                    activity_name: data.activity_name,
                    time: data.time,
                    counter: data.counter,
                    work_time: data.work_time
                });
            }
        } catch (error) {

        }
    })


})


module.exports = new DashboardController();