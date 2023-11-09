import Users from '../models/users.js';
import { Access_Checker } from '../helpers/hierarchy.check.js';
import { MessageRestructure } from '../helpers/message.restructure.js';
import Tasks from '../models/tasks.js';
import { v4 as uuid } from 'uuid';
import { UserRestructure } from '../helpers/user.restructure.js';
import { sendMessage } from '../middlewares/send.message.js';
import { Keyboard } from 'vk-io';
import { modifyTime } from '../helpers/time.modifer.js';

class TaskCommands {
    static add_task = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных!');
            if (Access_Checker(has_access.role)) return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const result = MessageRestructure(context);
            if (!result[2] || !result[3] || !result[4] || !result[5] || !result[6] || !result[7]) return await context.reply('Пересмотри отправленные данные! Что-то не так там');
            const modifiedTime = modifyTime(result[4]);
            const user_vk = UserRestructure(result[7]);
            const user = await Users.findOne({ where: { vk_id: user_vk } });
            if (!user) return await context.reply('Такого пользователя в Базе данных нет!');
            const task_id = uuid();
            await Tasks.create({
                id: task_id,
                title: result[2],
                description: result[3],
                appointer: context.senderId,
                performer: user_vk,
                priority: result[6],
                estimation_time: result[4],
                deadline: `${modifiedTime.date} ${modifiedTime.time.slice(11)}`,
                points: result[8],
                is_done: false,
                cancelable: !!result[9]
            });
            await sendMessage({
                peerId: user_vk,
                message: `Вам поступила новая задача от ${has_access.full_name}\n\nЗаголовок - ${result[2]}\nОписание - ${result[3]}\nПриоритет - ${result[6]}\nОценка времени работы - ${result[4]}\nКрайний срок - ${result[5]}\nКол-во Баллов - ${result[8]}`,
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.callbackButton({
                            label: 'Выполнено',
                            payload: { action: 'task_done', vk_id: user_vk, task_id },
                            color: Keyboard.POSITIVE_COLOR
                        }),
                        Keyboard.callbackButton({
                            label: 'Отказаться',
                            payload: { action: 'task_cancel', vk_id: user_vk, task_id },
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ]
                ]).inline().oneTime()
            });
            setTimeout(async () => {
                await context.send('Задание успешно было добавлено!');
            }, 1000);
        } catch (e) {
            console.log(e);
        }
    };

    static delete_task = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных!');
            if (Access_Checker(has_access.role)) return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const result = MessageRestructure(context);
            //result[2] - task id
            const task = await Tasks.findByPk(result[2]);
            if (!task) return await context.reply('Такой задачи не существует!');
            await task.destroy();
            const performer = await Users.findOne({ where: { vk_id: task.performer } });
            if (!performer) return await context.reply('Выполняющий администратор не существует!');
            setTimeout(async () => {
                await sendMessage({
                    peerId: task.performer,
                    message: `Администратор ${has_access.full_name} удалил(а) ваше задание под названием: ${task.title}`
                });
            }, 2000);
            setTimeout(async () => {
                await sendMessage({
                    peerId: 2000000007,
                    message: `Администратор ${has_access.full_name} удалил(а) задание ${performer.full_name} под названием: ${task.title}`
                });
            }, 2000);
            await context.reply('Задача была успешно удалена!');
        } catch (e) {
            console.log(e);
        }
    };

    static get_all_tasks = async (context) => {
        try {
            const tasks = await Tasks.findAll({ where: { is_done: false } });
            let message = 'Список действующих задач:\n\n';
            if (!tasks.length) return await context.send('Действующих задач нет!');
            tasks.map((task) => {
                message += `Идентификатор - ${task.id}\nЗаголовок - ${task.title}\nОписание - ${task.description}\nОценка времени - ${task.estimation_time}\nВыполняющий - https://vk.com/id${task.performer}\n\n`;
            });
            await context.send(message);
        } catch (e) {
            console.log(e);
        }
    };

    static get_my_tasks = async (context) => {
        try {
            const tasks = await Tasks.findAll({ where: { is_done: false, performer: context.senderId } });
            if (!tasks.length) return context.reply('Действующих задач для вас не найдено!');
            let message = 'Список ваших действующих задач:\n\n';
            tasks.map((task) => {
                message += `Идентификатор - ${task.id}\nЗаголовок - ${task.title}\nОписание - ${task.description}\nОценка времени - ${task.estimation_time}\nКол-во баллов - ${task.points}\n\n`;
            });
            await sendMessage({
                peerId: context.senderId,
                message: message + '\n\nЧтобы выполнить или отклонить задачи используйте эти команды:\n\n @nlendon /выполнить\n@nlendon /отклонить'
            });
            if (context.peerId > 2000000000) {
                return await context.reply('Отправил список ваших задач в личные сообщения');
            }
        } catch (e) {
            console.log(e);
        }
    };

    static complete_myTask = async (context) => {
        try {

            if (context.peerId > 2000000000) return await context.reply('Выполнять задания можно только в Личных сообщениях со мной');
            const user = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!user) return context.reply('Не нашел вас в базе данных! Используйте команду /запрос чтобы администрация добавила вас');
            const result = MessageRestructure(context);
            const task = await Tasks.findByPk(result[2]);
            if (!task) return await context.reply('Такой задачи не существует!');
            setTimeout(async () => {
                await sendMessage({
                    peerId: 2000000007,
                    message: `Пользователь ${user.full_name} выполнил задание.\nДетали задания:\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.callbackButton({
                                label: 'Подтвердить',
                                payload: {
                                    action: 'task_check_done',
                                    vk_id: user.vk_id,
                                    task_id: task.id
                                },
                                color: Keyboard.POSITIVE_COLOR
                            }),
                            Keyboard.callbackButton({
                                label: 'Отклонить',
                                payload: {
                                    action: 'task_check_cancel', vk_id: user.vk_id,
                                    task_id: task.id
                                },
                                color: Keyboard.NEGATIVE_COLOR
                            })
                        ]
                    ]).inline().oneTime()
                });
            }, 2000);
            await context.reply('Успех! Администрация получила ваше подтверждение, в скором времени я вам напишу)');
        } catch (e) {
            console.log(e);
        }
    };

    static cancel_myTask = async (context) => {
        try {
            if (context.peerId > 2000000000) return await context.reply('Отклонять задания можно только в Личных сообщениях со мной');
            const user = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!user) return context.reply('Не нашел вас в базе данных! Используйте команду /запрос чтобы администрация добавила вас');
            const result = MessageRestructure(context);
            const task = await Tasks.findByPk(result[2]);
            if (!task) return await context.reply('Такой задачи не существует!');
            setTimeout(async () => {
                await sendMessage({
                    peerId: 2000000007,
                    message: `Пользователь ${user.full_name} отказался от задания.\nДетали задания:\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.callbackButton({
                                label: 'Удалить Задачу',
                                payload: {
                                    action: 'task_cancel_delete',
                                    vk_id: user.vk_id,
                                    task_id: task.id
                                },
                                color: Keyboard.SECONDARY_COLOR
                            }),
                            Keyboard.callbackButton({
                                label: 'Выдать Предупреждение',
                                payload: {
                                    action: 'task_cancel_warn', vk_id: user.vk_id,
                                    task_id: task.id
                                },
                                color: Keyboard.NEGATIVE_COLOR
                            })
                        ]
                    ]).inline().oneTime()
                });
            }, 2000);
            await context.reply(`Успех! Администрация получила ваше отклонение, ожидайте ответа Администрации)`);
        } catch (e) {
            console.log(e);
        }
    };
}

export default TaskCommands;
