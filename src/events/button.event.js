import { updates } from '../triggers/index.js';
import Settings from '../models/settings.js';
import { sendMessage } from '../middlewares/send.message.js';
import Owners from '../models/owners.js';
import Users from '../models/users.js';
import axios from 'axios';
import { EditMessage } from '../helpers/edit.message.js';
import Tasks from '../models/tasks.js';
import { Keyboard } from 'vk-io';

const ButtonEvent = () => {
    updates.on('message_event', async (context) => {
        const message_payload = context.eventPayload;
        switch (message_payload.action) {
            case 'start_accept': {
                await Settings.create({
                    name: 'availability',
                    value: true,
                    dialog_id: context.peerId
                });
                await EditMessage({
                    conversation_message_id: context.conversationMessageId,
                    peer_id: context.peerId,
                    message: 'Бип-буп-буп-биб?\nЯ нуждаюсь в установке.'
                });
                await sendMessage({
                    peerId: context.peerId,
                    message: `Бот успешно был успешно установлен. Чтобы узнать команды бота пропишите @${process.env.VK_NICK_GLOBAL} /help`
                });
                break;
            }
            case 'deny_accept': {
                await EditMessage({
                    conversation_message_id: context.conversationMessageId,
                    peer_id: context.peerId,
                    message: 'Бип-буп-буп-биб?\nЯ нуждаюсь в установке.'
                });
                await sendMessage({
                    peerId: context.peerId,
                    message: 'Создатель бота отказался устанавливать бота. Обратитесь к нему для настройки!'
                });
                break;
            }
            case 'invite_accept': {
                const is_owner = await Owners.findOne({ where: { vk_id: context.userId } });
                if (!is_owner)
                    return await sendMessage({
                        peerId: context.peerId,
                        message: 'Пипирка твоя не выросла, чтобы использовать эту команду!'
                    });
                const user = await Users.findOne({
                    where: {
                        vk_id: message_payload.vk_id
                    }
                });
                if (!user) return await sendMessage({
                    peerId: context.peerId,
                    message: 'Данный Пользователь не подавал заявку, либо вынесли вердикт!'
                });
                user.is_active = true;
                await user.save();
                await EditMessage({
                    peer_id: 2000000007,
                    message: `Пользователь ${user.full_name} подал заявление на получение доступа!\n\nЕго/Её данные:\n1. Имя Фамилия -  ${user.full_name}\n2. Игровой Никнейм - ${user.nick_name}\n3. Должность - ${user.role}\n`,
                    conversation_message_id: context.conversationMessageId
                });
                //Отправка сообщений в логи
                setTimeout(async () => {
                    await sendMessage({
                        peerId: context.peerId,
                        message: `Пользователь ${user.full_name} был одобрен! (${is_owner.full_name})`
                    });
                }, 2000);

                //Отправка сообщений пользователю
                setTimeout(async () => {
                    await sendMessage({
                        peerId: message_payload.vk_id,
                        message: `Ваша заявка на получение доступа была одобрена! (${is_owner.full_name})`
                    });
                }, 5000);
                break;
            }
            case 'invite_deny': {
                const is_owner = await Owners.findOne({ where: { vk_id: context.userId } });
                if (!is_owner)
                    return await sendMessage({
                        peerId: context.peerId,
                        message: 'Пипирка твоя не выросла, чтобы использовать эту команду!'
                    });
                const user = await Users.findOne({
                    where: {
                        vk_id: message_payload.vk_id
                    }
                });
                if (!user) return await sendMessage({
                    peerId: context.peerId,
                    message: 'Данный Пользователь не подавал заявку, либо вынесли вердикт!'
                });
                await EditMessage({
                    message: `Пользователь ${user.full_name} подал заявление на получение доступа!\n\nЕго/Её данные:\n1. Имя Фамилия -  ${user.full_name}\n2. Игровой Никнейм - ${user.nick_name}\n3. Должность - ${user.role}\n`,
                    conversation_message_id: context.conversationMessageId,
                    peer_id: 2000000007
                });
                //Отправка сообщений в логи
                setTimeout(async () => {
                    await sendMessage({
                        peerId: context.peerId,
                        message: `Заявка пользователя ${user.full_name} была отклонена! (${is_owner.full_name})`
                    });
                }, 2000);
                //Отправка сообщений пользователю
                await sendMessage({
                    peerId: message_payload.vk_id,
                    message: `Ваша заявка на получение доступа была отклонена! (${is_owner.full_name})`
                });
                break;
            }
            case 'task_done': {
                const task = await Tasks.findByPk(message_payload.task_id);
                if (!task) return await sendMessage({
                    peerId: context.peerId,
                    message: `Такой задачи не существует!`
                });
                const appointer = await Users.findOne({ where: { vk_id: task.appointer } });
                const performer = await Users.findOne({ where: { vk_id: task.performer } });
                if (!performer) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5001)`
                });
                if (parseInt(task.performer) !== context.userId) return await sendMessage({
                    peerId: context.peerId,
                    message: `Ты как посмел тырить задания другого!`
                });
                await EditMessage({
                    message: `Вам поступила новая задача от ${appointer.full_name}\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                    conversation_message_id: context.conversationMessageId,
                    peer_id: context.peerId
                });
                setTimeout(async () => {
                    await sendMessage({
                        peerId: 2000000007,
                        message: `Пользователь ${performer.full_name} выполнил задание.\nДетали задания:\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                        keyboard: Keyboard.keyboard([
                            [
                                Keyboard.callbackButton({
                                    label: 'Подтвердить',
                                    payload: {
                                        action: 'task_check_done',
                                        vk_id: performer.vk_id,
                                        task_id: task.id,
                                        inspector: context.userId
                                    },
                                    color: Keyboard.POSITIVE_COLOR
                                }),
                                Keyboard.callbackButton({
                                    label: 'Отклонить',
                                    payload: {
                                        action: 'task_check_cancel', vk_id: performer.vk_id,
                                        task_id: task.id,
                                        inspector: context.userId
                                    },
                                    color: Keyboard.NEGATIVE_COLOR
                                })
                            ]
                        ]).inline().oneTime()
                    });
                }, 2000);

                await sendMessage({
                    peerId: message_payload.vk_id,
                    message: `Успех! Администрация получила ваше подтверждение, в скором времени я вам напишу)`
                });
                break;
            }
            case 'task_cancel': {
                const task = await Tasks.findByPk(message_payload.task_id);
                if (!task) return await sendMessage({
                    peerId: context.peerId,
                    message: `Такой задачи не существует!`
                });
                const appointer = await Users.findOne({ where: { vk_id: task.appointer } });
                const performer = await Users.findOne({ where: { vk_id: task.performer } });
                if (!performer) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5001)`
                });
                if (parseInt(task.performer) !== context.userId) return await sendMessage({
                    peerId: context.peerId,
                    message: `Ты как посмел тырить задания другого!`
                });
                await EditMessage({
                    message: `Вам поступила новая задача от ${appointer.full_name}\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                    conversation_message_id: context.conversationMessageId,
                    peer_id: context.peerId
                });
                setTimeout(async () => {
                    await sendMessage({
                        peerId: 2000000007,
                        message: `Пользователь ${performer.full_name} отказался от задания.\nДетали задания:\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                        keyboard: Keyboard.keyboard([
                            [
                                Keyboard.callbackButton({
                                    label: 'Удалить Задачу',
                                    payload: {
                                        action: 'task_cancel_delete',
                                        vk_id: performer.vk_id,
                                        task_id: task.id,
                                        inspector: context.userId
                                    },
                                    color: Keyboard.SECONDARY_COLOR
                                }),
                                Keyboard.callbackButton({
                                    label: 'Выдать Предупреждение',
                                    payload: {
                                        action: 'task_cancel_warn', vk_id: performer.vk_id,
                                        task_id: task.id,
                                        inspector: context.userId
                                    },
                                    color: Keyboard.NEGATIVE_COLOR
                                })
                            ]
                        ]).inline().oneTime()
                    });
                }, 2000);
                await sendMessage({
                    peerId: message_payload.vk_id,
                    message: `Успех! Администрация получила ваше отклонение, ожидайте ответа Администрации)`
                });
                break;
            }
            case 'task_check_done': {
                const task = await Tasks.findByPk(message_payload.task_id);
                if (!task) return await sendMessage({
                    peerId: context.peerId,
                    message: `Такой задачи не существует!`
                });
                const performer = await Users.findOne({ where: { vk_id: task.performer } });
                if (!performer) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5001)`
                });
                await EditMessage({
                    message: `Пользователь ${performer.full_name} выполнил задание.\nДетали задания:\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                    conversation_message_id: context.conversationMessageId,
                    peer_id: 2000000007
                });
                task.is_done = true;
                await task.save();
                performer.points += task.points;
                await performer.save();
                await sendMessage({
                    peerId: message_payload.vk_id,
                    message: `Успех! Администрация подтвердила ваше задание! Вам начислили баллы)`
                });
                const inspector = await Users.findOne({ where: { vk_id: context.userId } });
                if (!inspector) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5002)`
                });
                setTimeout(async () => {
                    await sendMessage({
                        peerId: 2000000007,
                        message: `Администратор ${inspector.full_name} подтвердил(а) задание ${performer.full_name}а!`
                    });
                }, 2000);
                break;
            }
            case 'task_check_cancel': {
                const task = await Tasks.findByPk(message_payload.task_id);
                if (!task) return await sendMessage({
                    peerId: context.peerId,
                    message: `Такой задачи не существует!`
                });
                const performer = await Users.findOne({ where: { vk_id: task.performer } });
                if (!performer) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5001)`
                });
                await EditMessage({
                    message: `Пользователь ${performer.full_name} выполнил задание.\nДетали задания:\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                    conversation_message_id: context.conversationMessageId,
                    peer_id: 2000000007
                });
                const inspector = await Users.findOne({ where: { vk_id: context.userId } });
                if (!inspector) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5002)`
                });
                await sendMessage({
                    peerId: message_payload.vk_id,
                    message: `Провал! Администрация отклонила ваше подтверждение! Задание остается в силе)`,
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.callbackButton({
                                label: 'Выполнено',
                                payload: { action: 'task_done', vk_id: message_payload.vk_id, task_id: task.id },
                                color: Keyboard.POSITIVE_COLOR
                            }),
                            Keyboard.callbackButton({
                                label: 'Отказаться',
                                payload: { action: 'task_cancel', vk_id: task.performer, task_id: task.id },
                                color: Keyboard.NEGATIVE_COLOR
                            })
                        ]
                    ]).inline().oneTime()
                });
                setTimeout(async () => {
                    await sendMessage({
                        peerId: 2000000007,
                        message: `Администратор ${inspector.full_name} отказал(а) подтверждение задания ${performer.full_name}а!`
                    });
                }, 2000);
                break;
            }
            case 'task_cancel_delete': {
                const task = await Tasks.findByPk(message_payload.task_id);
                if (!task) return await sendMessage({
                    peerId: context.peerId,
                    message: `Такой задачи не существует!`
                });
                const performer = await Users.findOne({ where: { vk_id: task.performer } });
                if (!performer) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5001)`
                });
                await task.destroy();
                const inspector = await Users.findOne({ where: { vk_id: context.userId } });
                if (!inspector) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5002)`
                });
                await EditMessage({
                    message: `Пользователь ${performer.full_name} отказался  от задания.\nДетали задания:\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                    conversation_message_id: context.conversationMessageId,
                    peer_id: 2000000007
                });
                setTimeout(async () => {
                    await sendMessage({
                        peerId: 2000000007,
                        message: `Администратор ${inspector.full_name} удалил(а) задание ${performer.full_name}а!`
                    });
                }, 2000);
                await sendMessage({
                    peerId: message_payload.vk_id,
                    message: `Администрация удалила ваше задание.`
                });
                break;
            }
            case 'task_cancel_warn': {
                const task = await Tasks.findByPk(message_payload.task_id);
                if (!task) return await sendMessage({
                    peerId: context.peerId,
                    message: `Такой задачи не существует!`
                });
                const performer = await Users.findOne({ where: { vk_id: task.performer } });
                if (!performer) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5001)`
                });
                await task.destroy();
                const inspector = await Users.findOne({ where: { vk_id: context.userId } });
                if (!inspector) return await sendMessage({
                    peerId: context.peerId,
                    message: `Что-то пошло не так! Сообщите Разработчику бота (#5002)`
                });
                await EditMessage({
                    message: `Пользователь ${performer.full_name} отказался  от задания.\nДетали задания:\n\nЗаголовок - ${task.title}\nОписание - ${task.description}\nПриоритет - ${task.priority}\nОценка времени работы - ${task.estimation_time}\nКрайний срок - ${task.deadline}\nКол-во Баллов - ${task.points}`,
                    conversation_message_id: context.conversationMessageId,
                    peer_id: 2000000007
                });
                performer.warns += 1;
                await performer.save();
                setTimeout(async () => {
                    await sendMessage({
                        peerId: 2000000007,
                        message: `Администратор ${inspector.full_name} удалил(а) и выдал(а) предупреждение ${performer.full_name}у!`
                    });
                }, 2000);
                await sendMessage({
                    peerId: message_payload.vk_id,
                    message: `Администрация удалила ваше задание и выдала вам предупреждение! Чтобы оспорить используйте команду /сообщение "Сообщение".`
                });
                break;
            }
        }
    });
};

export default ButtonEvent;
