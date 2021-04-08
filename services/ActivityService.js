const ActivityRepository = require('../repositories/ActivityRepository');

class ActivityService {

    async activityIndex() {
        try {
            var activities = await ActivityRepository.findAll();
            return activities;

        } catch (error) {
            return error;
        }
    }

    async activityCreateGet() {
        try {
            var processes = await ActivityRepository.findAllProcesses();
            var activities = await ActivityRepository.findAll();
            var groups = await ActivityRepository.findGroupAndActivity();
            return { processes: processes, groups: groups, activities: activities }

        } catch (error) {
            return error;
        }
    }

    async activityCreatePost(activity_name, process_id, agroup, group_name) {
        try {
            var activityName = await ActivityRepository.findActivityByNameAndProcess(activity_name, process_id);
            console.log(activityName)
            if (activityName == null) {

                if (agroup) {
                    var activityGroup = await ActivityRepository.findActivityGroupByName(group_name, process_id)
                    var group = await ActivityRepository.findGroupByName(group_name);

                    if (group == null && !activityGroup.group) {
                        await ActivityRepository.agroupableUpdateActivityAndCreateGroup(group_name, activity_name, process_id);
                        return 1;

                    } else if (group == null && activityGroup.group.id) {
                        await ActivityRepository.agroupActivityAndCreate(activityGroup.group.id, activity_name, process_id);
                        return 1;

                    } else {
                        await ActivityRepository.agroupActivityAndCreate(activityGroup.group.id, activity_name, process_id);
                        return 1;
                    }

                } else {
                    await ActivityRepository.createActivity(activity_name, null, process_id);
                    return 1;
                }

            } else {
                return 0;
            }

        } catch (error) {
            return error;
        }
    }

    async activityDeletePost(id) {
        try {
            var chronometerHasActivity = await ActivityRepository.findChronometer(id);
            if (chronometerHasActivity == null) {

                var activity = await ActivityRepository.findOneIncludeAll(id);
                if (activity.group_id == null) {
                    await ActivityRepository.deleteActivity(id);
                    return 1;

                } else {
                    if (activity.group.group_name == ("G_" + activity.activity_name)) {
                        var groupHasActivity = await ActivityRepository.findActivtyByGroupId(activity.group.id);
                        if (Object.keys(groupHasActivity).length == 1) {
                            await ActivityRepository.deleteActivityAndGroup(id, activity.group.id);
                            return 1;

                        } else {
                            return 0;
                        }

                    } else {
                        await ActivityRepository.deleteActivity(id);
                        return 1;
                    }
                }

            } else {
                var activity = await ActivityRepository.findOneIncludeAll(id);
                if (activity.group_id == null) {
                    await ActivityRepository.updateActivityStatus(id);
                    return 1;

                } else {
                    if (activity.group.group_name == ("G_" + activity.activity_name)) {
                        var groupHasActivity = await ActivityRepository.findActivtyByGroupId(activity.group.id);
                        if (Object.keys(groupHasActivity).length == 1) {
                            await ActivityRepository.updateActivityStatus(id);
                            return 1;
                        } else {
                            return 0;
                        }
                    } else {
                        await ActivityRepository.updateActivityStatus(id);
                        return 1;
                    }
                }
            }

        } catch (error) {
            return error;
        }
    }

    async activityUpdateGet(id) {
        try {
            var processes = await ActivityRepository.findAllProcesses();
            var groups = await ActivityRepository.findGroupAndActivity();
            var activity = await ActivityRepository.findOneIncludeAll(id);
            var activities = await ActivityRepository.findAll();

            return { processes: processes, groups: groups, activity: activity, activities: activities }

        } catch (error) {
            return error;
        }
    }

    async activityUpdatePost(activity_name, process_id, agroup, group_name, id) {
        try {
            var activity = await ActivityRepository.findOneIncludeAll(id);
            var activityName = await ActivityRepository.findActivityByNameAndProcessAndId(activity_name, process_id, id);
            var activitiesLinked = await ActivityRepository.findActivtyByGroupId(activity.group_id);

            //VERIFICAÇÃO PRINCIPAL: NÃO PODE CADASTRAR ATIVIDADES COM NOMES IGUAIS OU VINCULAR A ATIVIDADE EM SI MESMA
            if (activityName == null && activity_name != group_name) {

                if (agroup) {
                    var activityGroup = await ActivityRepository.findActivityGroupByName(group_name, process_id)

                    //SE É UMA ATIVIDADE COMUM, QUE NAO PERTENCE A GRUPO
                    if (activitiesLinked == undefined) {

                        //SE O ALVO NAO TIVER UM GRUPO, CRIA UM GRUPO E VINCULA
                        if (activityGroup.group == null) {
                            console.log('0 ok')
                            await ActivityRepository.agroupUpdateActivitiesAndCreateGroup(group_name, activity_name, process_id, id)
                            return 1;
                        } else {
                            //SE POSSUI UM GRUPO, APENAS VINCULA
                            console.log('000 ok')
                            await ActivityRepository.agroupActivityUpdate(activity_name, process_id, activityGroup.group_id, id);
                            return 1;
                        }

                    } else if (activity.createdAt == activity.group.createdAt && Object.keys(activitiesLinked).length == 1) { //SE FOR UMA ATIVIDADE PRINCIPAL DO GRUPO E NAO POSSUIR OUTRA ATIVIDADE VINCULADA

                        //SE O NOME DA ATIVIDADE SEJA DIFERENTE OU
                        if (process_id == activity.process_id && activity_name != activity.activity_name || activity_name == activity.activity_name) {

                            //SE O GRUPO ALVO E NULL, DELETA O GRUPO ATUAL E VINCULA AO OUTRO
                            if (activityGroup.group == null) {
                                console.log('A ok')
                                await ActivityRepository.noCheckGroupDelete(activity.group_id);
                                await ActivityRepository.agroupUpdateActivitiesAndCreateGroup(group_name, activity_name, process_id, id)
                                return 1;

                                //SE O GRUPO ATUAL E DIFERENTE DO GRUPO ALVO, DELETA O GRUPO ATUAL E VINCULA AO OUTRO
                            } else if (activityGroup.group_id != activity.group_id && activityGroup.group != null) {
                                console.log('A1 ok')
                                await ActivityRepository.noCheckGroupDelete(activity.group_id);
                                await ActivityRepository.agroupActivityUpdate(activity_name, process_id, activityGroup.group_id, id);
                                return 1;

                            } else {
                                console.log('A2 OK')
                                await ActivityRepository.agroupUpdateActivityAndGroup(activity_name, process_id, activityGroup.group_id, id);
                                return 1;
                            }

                        } else if (process_id != activity.process_id) {
                            console.log('B0')
                            //SE O PROCESSO FOR DIFERENTE, ALTERA O PROCESSO
                            await ActivityRepository.noCheckGroupDelete(activity.group_id);
                            await ActivityRepository.agroupActivityUpdate(activity_name, process_id, null, id);
                            return 1;
                            //  }
                        }

                    } else if (activity.createdAt == activity.group.createdAt && Object.keys(activitiesLinked).length > 1) {
                        //CASO POSSUA MAIS DE UMA ATIVIDADE VINCULADA ENTRA NESSE ELSE IF

                        if (process_id == activity.process_id && activity_name != activity.activity_name || activity_name == activity.activity_name && activity.group_id == activityGroup.group_id) {
                            console.log('c1')
                            await ActivityRepository.agroupUpdateActivityAndGroup(activity_name, process_id, activityGroup.group_id, id);
                            return 1;

                            //SE POSSUI MAIS DE UMA ATIVIDADE, NAO É POSSIVEL ALTERAR O PROCESSO OU O GRUPO, PERMITE ALTERAR APENAS O NOME DA ATIVIDADE
                        } else if (activity.group_id != activityGroup.group_id || process_id != activity.process_id) {
                            console.log('c0')
                            return -1;

                        } else {
                            return -1;
                        }

                    } else if (activity.createdAt != activity.group.createdAt && Object.keys(activitiesLinked).length > 1) {

                        //CASO SEJA UMA ATIVIDADE NÃO PRINCIPAL DO GRUPO
                        if (activityGroup.group == null) {
                            await ActivityRepository.agroupUpdateActivitiesAndCreateGroup(group_name, activity_name, process_id, id)
                            return 1;

                        } else {
                            console.log('C1.2')
                            await ActivityRepository.agroupActivityUpdate(activity_name, process_id, activityGroup.group_id, id);
                            return 1;
                        }

                    }

                } else if (!agroup) {

                    if (activitiesLinked == undefined) {
                        console.log('D')
                        await ActivityRepository.noCheckActivityUpdateGroupNull(activity_name, null, process_id, id);
                        return 1;

                    } else if (activity.createdAt == activity.group.createdAt && Object.keys(activitiesLinked).length == 1) {
                        console.log('D1')
                        await ActivityRepository.noCheckGroupDelete(activity.group_id);
                        await ActivityRepository.noCheckActivityUpdateGroupNull(activity_name, null, process_id, id);
                        return 1;

                    } else if (activity.createdAt == activity.group.createdAt && Object.keys(activitiesLinked).length > 1) {
                        console.log('D2')
                        return -1;

                    } else if (activity.createdAt != activity.group.createdAt && Object.keys(activitiesLinked).length > 1) {
                        console.log('D3')
                        await ActivityRepository.noCheckActivityUpdateGroupNull(activity_name, null, process_id, id);
                        return 1;

                    } else {
                        console.log('D4')
                        await ActivityRepository.noCheckActivityUpdateGroupNull(activity_name, null, process_id, id);
                        return 1;
                    }
                }

            } else {
                return 0;
            }

        } catch (error) {
            return error;
        }
    }
}
module.exports = new ActivityService()