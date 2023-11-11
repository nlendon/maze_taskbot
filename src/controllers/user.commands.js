import Users from '../models/users.js';
import { record_allowed_roles } from '../common/constants.js';
import { MessageRestructure } from '../helpers/message.restructure.js';
import Settings from '../models/settings.js';
import { vk } from '../triggers/index.js';
import { sendMessage } from '../middlewares/send.message.js';
import { UserRestructure } from '../helpers/user.restructure.js';

class UserCommands {
    static get_all_users = async (context) => {
        try {
            const users = await Users.findAll({ is_active: true });
            if (!users.length) return await context.reply('Пользователей пока нет!');
            let message = 'Список всех пользователей:\n\n';
            users.forEach((user, index) => {
                message += `${index + 1}. *id${user.vk_id} (${user.full_name}) - ${user.nick_name} [${user.role}]\n`;
            });
            await context.send(message, { disable_mentions: 1 });
        } catch (e) {
            console.log(e);
        }
    };

    static message_toAll = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!record_allowed_roles.find((role) => role === has_access.role))
                return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const result = MessageRestructure(context);
            const dialog_ids = [];
            if (!result[2]) return await context.reply('Слушай, я не Ванга, чтобы угадывать твое сообщение!\nПример:\n/обращение идентификатор_беседы "Сообщение"');
            for (let i = 3; i < result.length; i++) {
                if (result[i] < 2000000000) {
                    return await context.reply('Тебе что, трудно в лс написать. Я тут тебе не Печкин!');
                } else dialog_ids.push(result[i]);
            }
            await sendMessage({
                peerId: dialog_ids,
                message: `Внимание Внимание! Обращение от Администрации Бота\n\n ${result[2]}`
            });
            setTimeout(async () => {
                await context.send('Сообщение доставлено!');
            }, 1500);
        } catch (e) {
            console.log(e);
        }
    };

    static get_dialogs = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!record_allowed_roles.find((role) => role === has_access.role))
                return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const dialogs = await Settings.findAll({ where: { name: 'availability', value: true } });
            const dialogIds = dialogs
                .filter((dialog) => dialog.dialog_id > 2000000000)
                .map((dialog) => dialog.dialog_id);
            const dialog = await vk.api.messages.getConversationsById({
                peer_ids: dialogIds
            });
            let message = 'Список всех настроенных Бесед:\n\n';
            dialog.items.forEach((item, index) => {
                message += `${index + 1}. Название - ${item.chat_settings.title}\nКоличество Пользователей - ${item.chat_settings.members_count}\nИдентификатор - ${dialogIds[index]}\n\n`;
            });
            await context.send(message);
        } catch (e) {
            console.log(e);
        }
    };

    static get_points = async (context) => {
        try {
            const admins = await Users.findAll({
                where: { is_active: true },
                attributes: ['full_name', 'vk_id', 'points'],
                order: [['points', 'DESC']]
            });
            let message = 'Список Администраторов с Баллами:\n\n';
            admins.forEach((adm, index) => {
                if (adm.points > 0) {
                    message += `[id${adm.vk_id}|${adm.full_name}] - ${adm.points} баллов\n`;
                }
            });
            if (message === 'Список Администраторов с Баллами:') message = 'Список Администраторов с Баллами отсутствует!';
            await context.send(message, { disable_mentions: 1 });
        } catch (e) {
            console.log(e);
        }
    };

    static get_profile = async (context) => {
        try {
            let user_vk = null;
            const result = MessageRestructure(context);
            if (result[2]) {
                user_vk = UserRestructure(result[2]);
            } else if (context?.replyMessage && context?.replyMessage.senderId) user_vk = context.replyMessage.senderId;
            const user = await Users.findOne({ where: { vk_id: user_vk } });
            if (!user) return await context.reply('Такого пользователя нет в Базе Данных!');
            const message = `Имя Фамилия - ${user.full_name}\nИгровой Никнейм - ${user.nick_name}\n Должность - ${user.role}\nКол-во Баллов - ${user.points}\n Кол-во Предупреждений - ${user.warns}\n ${user.is_inspector ? 'Пользователь является Инспектором' : ''}`;
            await context.reply(message);
        } catch (e) {
            console.log(e);
        }
    };

    static increase_points = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!record_allowed_roles.find((role) => role === has_access.role))
                return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const result = MessageRestructure(context);
            const user_vk = UserRestructure(result[2]);
            const admin = await Users.findOne({ where: { vk_id: user_vk, is_active: true } });
            if (!admin) return await context.reply('Такого пользователя нет в Базе Данных');
            if (isNaN(parseInt(result[3]))) return await context.reply('Цифру введи, а не текст умник');
            admin.points += parseInt(result[3]);
            await admin.save();
            await context.send('Баллы успешно прибавлены');
        } catch (e) {
            console.log(e);
        }
    };
}

export default UserCommands;
