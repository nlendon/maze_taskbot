import { VK } from 'vk-io';
import BaseCommands from '../controllers/base.commands.js';
import ButtonEvent from '../events/button.event.js';
import '../models/index.js';
import { CheckAvailability } from '../middlewares/check.availability.js';
import { sendMessage } from '../middlewares/send.message.js';
import OwnerCommands from '../controllers/owner.commands.js';
import Owners from '../models/owners.js';
import TaskCommands from '../controllers/task.commands.js';
import GradeCommands from '../controllers/grade.commands.js';
import { owner_id, owners_id } from '../common/constants.js';
import UserCommands from '../controllers/user.commands.js';
import SpellCommands from '../controllers/spell.commands.js';

export const vk = new VK({
    token: process.env.BOT_TOKEN
});
export const { updates } = vk;

export let grade_interval = null;

updates.on('message_new', async (context) => {
    try {
        if (context.is('message') && context.hasText) {
            let message = context.text.toLowerCase();
            message = message.split(' ');
            if (message[0] + ' ' + message[1] !== `${process.env.VK_NICK_COMMAND} /start` && message[0] === `${process.env.VK_NICK_COMMAND}`) {
                const available = await CheckAvailability(context);
                if (available.status !== 200 && available.status !== 405) {
                    return await sendMessage({
                        peerId: context.peerId,
                        message: available.message
                    });
                } else if (available.status === 405) {
                    if (message[1] === '/emergency_start') {
                        const is_owner = await Owners.findOne({ where: { vk_id: context.senderId } });
                        if (!is_owner) return await sendMessage({
                            peerId: context.peerId,
                            message: 'Пипирка твоя не выросла, чтобы использовать эту команду!'
                        });
                        const message = await OwnerCommands.emergency_start(context);
                        await context.send(message);
                    } else return await sendMessage({
                        peerId: context.peerId,
                        message: available.message
                    });
                }
            }
            if (context.peerId >= 2000000000) {
                message = message[0] + ' ' + message[1];
            } else if (context.peerId < 2000000000) {
                message = process.env.VK_NICK_COMMAND + ' ' + message[0];
                context.message.text = process.env.VK_NICK_COMMAND + ' ' + context.message.text
            }
            switch (message) {
                case `${process.env.VK_NICK_COMMAND} /start`: {
                    await BaseCommands.start(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /help`: {
                    await BaseCommands.help(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /roles`: {
                    await BaseCommands.get_roles(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /запрос`: {
                    await BaseCommands.add_user(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /сообщение`: {
                    await BaseCommands.message_toAdmins(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /create_command`: {
                    await OwnerCommands.create_command(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /delete_command`: {
                    await OwnerCommands.delete_command(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /ohelp`: {
                    await OwnerCommands.get_owner_commands(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /авада_кедавра`: {
                    await OwnerCommands.avada_kedavra(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /emergency_stop`: {
                    await OwnerCommands.emergency_stop(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /удалить_напоминалку`: {
                    if (owners_id.find((owner) => owner === context.senderId)) {
                        clearInterval(grade_interval);
                        await context.send('Напоминалка была удалена! Перезапустите меня, чтобы вновь заработала она.');
                    }
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /add_owner`: {
                    await OwnerCommands.add_owner(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /del_owner`: {
                    await OwnerCommands.delete_owner(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /задача`: {
                    await TaskCommands.add_task(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /удалить_задачу`: {
                    await TaskCommands.delete_task(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /задачи`: {
                    await TaskCommands.get_all_tasks(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /мои_задачи`: {
                    await TaskCommands.get_my_tasks(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /выполнить`: {
                    await TaskCommands.complete_myTask(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /отклонить`: {
                    await TaskCommands.cancel_myTask(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /добавить_запись`: {
                    await GradeCommands.add_record(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /обновить_запись`: {
                    await GradeCommands.update_record(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /удалить_запись`: {
                    await GradeCommands.delete_record(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /записи`: {
                    await GradeCommands.get_records(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /назначить`: {
                    await GradeCommands.appoint_toGrade(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /разжаловать`: {
                    await GradeCommands.remove_inspector(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /оценка`: {
                    await GradeCommands.grade_structures(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /изменить_оценку`: {
                    await GradeCommands.update_grade(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /удалить_оценку`: {
                    await GradeCommands.delete_grade(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /оценки`: {
                    await GradeCommands.get_grades(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /пользователи`: {
                    await UserCommands.get_all_users(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /агуаменти`: {
                    await context.reply('Вжууухххх....Твои трусы уже мокрые');
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /эванеско`: {
                    await SpellCommands.evanesko(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /круцио`: {
                    await SpellCommands.krucio(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /беседы`: {
                    await UserCommands.get_dialogs(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /обращение`: {
                    await UserCommands.message_toAll(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /баллы`: {
                    await UserCommands.get_points(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /профиль`: {
                    await UserCommands.get_profile(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /выдать_баллы`: {
                    await UserCommands.increase_points(context);
                    break;
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
});

try {
    updates.start().catch(console.error);
    ButtonEvent();
    console.log('Бот начал свою работу');
    grade_interval = setInterval(async () => {
        const now = new Date();
        if (now.getDay() === 0) await GradeCommands.grade_reminder();
    }, 24 * 60 * 60 * 1000);
} catch (e) {
    console.log(e);
}
