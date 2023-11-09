import Users from '../models/users.js';
import { record_allowed_roles } from '../common/constants.js';
import { MessageRestructure } from '../helpers/message.restructure.js';
import Settings from '../models/settings.js';
import { vk } from '../triggers/index.js';
import { sendMessage } from '../middlewares/send.message.js';

class UserCommands {
    static get_all_users = async (context) => {
        try {
            const users = await Users.findAll({ is_active: true });
            if (!users.length) return await context.reply('Пользователей пока нет!');
            let message = 'Список всех пользователей:\n\n';
            users.forEach((user, index) => {
                message += `${index + 1}. *id${user.vk_id} (${user.full_name}) - ${user.nick_name} [${user.role}]\n`;
            });
            await context.send(message);
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
            if (!result[2] || result[2] < 2000000000) return await context.reply('Тебе что, трудно в лс написать. Я тут тебе не Печкин!');
            if (!result[3]) return await context.reply('Слушай, я не Ванга, чтобы угадывать твое сообщение!\nПример:\n/обращение идентификатор_беседы "Сообщение"');
            await sendMessage({
                peerId: result[2],
                message: `Внимание Внимание! Обращение от Администрации Бота\n\n ${result[3]}`
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
}

export default UserCommands;
