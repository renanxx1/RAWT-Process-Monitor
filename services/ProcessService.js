const ProcessRepository = require('../repositories/ProcessRepository');


class ProcessService {

    //Retorna dados para a pagina principal
    async getIndex() {
        var processes = await ProcessRepository.findAll();
        return processes;
    }

    //Retorna dados para a pagina de criar processo
    async setCreate(processData) {
        var process = await ProcessRepository.findOneByName(processData.process_name);
        if (process == undefined) {
            if (process_counterCheck) {
                await ProcessRepository.createProcessAndCounterAndGoal(processData.process_name, processData.process_counter, processData.process_goal);
                return 1;
            } else {
                await ProcessRepository.createProcessAndCounterAndGoal(processData.process_name, null);
                return 1;
            }
        } else {
            return 0;
        }
    }

    //Deleta um processo
    async setDelete(processData) {
        var processHasActivity = await ProcessRepository.findActivitiesInProcess(processData.id);
        var processHasCollaborator = await ProcessRepository.findCollaboratorsInProcess(processData.id);
        var processHasActivityStatusFalse = await ProcessRepository.findActivitiesInProcessStatusFalse(processData.id);

        if (Object.keys(processHasActivity).length == 0 && processHasCollaborator == null && processHasActivityStatusFalse != null) {
            await ProcessRepository.updateProcessStatus(processData.id);
            return 1;

        } else if (Object.keys(processHasActivity).length == 0 && processHasCollaborator == null) {
            await ProcessRepository.deleteProcess(processData.id);
            return 1;

        } else {
            return 0;
        }
    }

    //Retorna dados para a pagina de atualizar processos
    async getUpdate(processData) {
        var process = await ProcessRepository.findByPk(processData.id);
        return process;
    }

    //Atualiza dados do processo
    async setUpdate(processData) {
        var process = await ProcessRepository.findOneByNameNotSameId(processData.id, processData.process_name);

        if (process == null) {
            if (process_counterCheck) {
                await ProcessRepository.updateProcessAndCounterAndGoal(processData.id, processData.process_name, processData.process_counter, processData.process_goal);
                return 1;

            } else {
                await ProcessRepository.updateProcessAndCounterAndGoal(processData.id, processData.process_name, null, null);
                return 1;
            }

        } else {
            return 0;
        }
    }

}


module.exports = new ProcessService();