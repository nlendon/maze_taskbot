import { owner_commands, owner_id } from '../common/constants.js';
import { sendMessage } from '../middlewares/send.message.js';
import { MessageRestructure } from '../helpers/message.restructure.js';
import Commands from '../models/commands.js';
import Settings from '../models/settings.js';
import Owners from '../models/owners.js';
import { vk } from '../triggers/index.js';
import { UserRestructure } from '../helpers/user.restructure.js';

class OwnerCommands {
    static create_command = async (context) => {
        try {
            const is_owner = await Owners.findOne({ where: { vk_id: context.senderId } });
            if (!is_owner) {
                return await sendMessage({
                    peerId: context.peerId,
                    message: 'Пипирка твоя не выросла, чтобы использовать эту команду!'
                });
            }
            const result = MessageRestructure(context);
            if (result[5]) {
                const setting = await Settings.findOne({ where: { dialog_id: result[5] } });
                if (!setting) return await sendMessage({
                    peerId: context.peerId,
                    message: 'Неправильно отправленный ИД беседы!'
                });
            }
            if (!result[2] || !result[4]) return await sendMessage({
                peerId: context.peerId,
                message: 'Неправильное создание команды!\n\n' +
                    'Пример: @nlendon /create_command название_команды "Описание Команды" Роль ид_беседы' +
                    '\n\nРоли можно посмотреть здесь @nlendon /roles' +
                    '\nЕсли команда используется в самой беседе, ид_беседы вводить необязательно '
            });
            const command = {
                command_name: result[2] || 'Пусто',
                description: result[3] || 'Пусто',
                access: result[4] || 'Пусто',
                dialog_id: result[5] || context.peerId
            };
            await Commands.create(command);
            await context.send('Команда была успешно добавлена!');
        } catch (e) {
            console.log(e);
        }
    };

    static delete_command = async (context) => {
        try {
            const is_owner = await Owners.findOne({ where: { vk_id: context.senderId } });
            if (!is_owner) {
                return await sendMessage({
                    peerId: context.peerId,
                    message: 'Пипирка твоя не выросла, чтобы использовать эту команду!'
                });
            }
            const result = MessageRestructure(context);
            if (!result[2]) return await sendMessage({
                peerId: context.peerId,
                message: 'Название команды введена неправильно!\n\nПример: @nlendon /delete_command /название_команды ид_беседы (Не обязательно)'
            }); else if (result[2].includes('/')) result[2] = result[2].slice(1);
            let command_search = {};
            if (context.peerId >= 2000000000)
                command_search = {
                    command_name: result[2],
                    dialog_id: context.peerId
                };
            else if (result[3]) command_search = { ...command_search, dialog_id: result[3] };
            if (!command_search.dialog_id) return await sendMessage({
                peerId: context.peerId,
                message: 'Команду можно только удалить для определенной Беседы! Исправьте запрос и повторите попытку'
            });
            const command = await Commands.findOne({ where: command_search });
            if (!command) return await sendMessage({
                peerId: context.peerId,
                message: 'Команда не найдена в Базе Данных!'
            });
            console.log(command);
            await command.destroy();
            await context.send('Команда была успешно удалена!');
        } catch (e) {
            console.log(e);
        }
    };

    static get_owner_commands = async (context) => {
        try {
            const is_owner = await Owners.findOne({ where: { vk_id: context.senderId } });
            if (!is_owner) {
                return await sendMessage({
                    peerId: context.peerId,
                    message: 'Пипирка твоя не выросла, чтобы использовать эту команду!'
                });
            }
            await sendMessage({
                peerId: context.peerId,
                message: owner_commands
            });
        } catch (e) {
            console.log(e);
        }
    };

    static avada_kedavra = async (context) => {
        try {
            const owner = await Owners.findOne({ where: { vk_id: context.senderId } });
            if (!owner) {
                return await sendMessage({
                    peerId: context.peerId,
                    message: 'Пипирка твоя не выросла, чтобы использовать эту команду!'
                });
            }
            const result = MessageRestructure(context);
            if (!result[2] || context.peerId < 2000000000) return await sendMessage({
                peerId: context.peerId,
                message: 'Заклинание невозможно вызвать в личных сообщениях бота. Либо пересмотри параметры заклинания'
            });
            if (!owner.is_super) {
                const user = await Owners.findOne({ where: { vk_id: result[2] } });
                if (user || result[2] === owner_id || result[2] === '@arr1stokrat') return await sendMessage({
                    peerId: context.peerId,
                    message: 'Дефендо! Заклинание нельзя использовать против него!'
                });
            } else if (result[2] === owner_id || result[2] === '@arr1stokrat') return await sendMessage({
                peerId: context.peerId,
                message: 'Дефендо! Заклинание нельзя использовать против него!'
            });
            vk.api.messages.removeChatUser({
                chat_id: 6,
                user_id: UserRestructure(result[2])
            }).then(async () => {
                await context.send('Пользователь был кикнут с беседы!');
                await sendMessage({
                    peerId: UserRestructure(result[2]),
                    message: '− А вдруг я попаду в дурацкое положение?\n' +
                        '\n' +
                        '− Тебе не нужно этого бояться, это у тебя в крови.'
                });
            }).catch((error) => {
                console.error(error);
            });
        } catch (e) {
            console.log(e);
        }
    };

    static emergency_stop = async (context) => {
        try {
            if (context.peerId < 2000000000)
                return await context.send('Ай-ай-ай, отключать бота нужно в определенных беседах!');
            await Settings.create({
                name: 'emergency_stop',
                value: true,
                dialog_id: context.peerId
            });
            await context.send('Администратор бота аварийно отключил Надзирателя!');
        } catch (e) {
            console.log(e);
        }
    };

    static emergency_start = async (context) => {
        try {
            if (context.peerId < 2000000000)
                return 'Ай-ай-ай, включать бота нужно в определенных беседах!';
            const setting = await Settings.findOne({ where: { name: 'emergency_stop', dialog_id: context.peerId } });
            if (!setting) return 'Аварийного отключения нет для данной беседы!';
            await setting.destroy();
            return 'Бот возобновил свою работу!';
        } catch (e) {
            console.log(e);
        }
    };
}

export default OwnerCommands;
