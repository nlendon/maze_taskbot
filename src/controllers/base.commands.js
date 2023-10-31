import { owner_id, roles } from '../common/constants.js';
import { Keyboard } from 'vk-io';
import Settings from '../models/settings.js';
import Commands from '../models/commands.js';
import { MessageRestructure } from '../helpers/message.restructure.js';
import Users from '../models/users.js';
import { Op } from 'sequelize';
import { vk } from '../triggers/index.js';
import { sendMessage } from '../middlewares/send.message.js';
import { RoleValidator } from '../helpers/role.validator.js';

class BaseCommands {

    // /start от Создателя Бота
    static  start = async (context) => {
        try {
            if (context.senderId === owner_id) {
                const check = await Settings.findOne({
                    where: {
                        name: 'availability',
                        value: true,
                        dialog_id: context.peerId
                    }
                });
                if (check) return await context.send('Бот для данной конференции уже установлен!');
                const keyboard = Keyboard.keyboard([
                    Keyboard.callbackButton({
                        label: 'Принять установление Бота',
                        payload: { action: 'start_accept' },
                        color: Keyboard.POSITIVE_COLOR
                    }),
                    Keyboard.callbackButton({
                        label: 'Отказаться от установления Бота',
                        payload: { action: 'deny_accept' },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]);
                await context.send('Бип-буп-буп-биб?\nЯ нуждаюсь в установке.', {
                    keyboard
                });
            } else {
                await context.send('Ты не обладаешь такой силой, чтобы управлять мной ⛔');
            }
        } catch (e) {
            console.error(e);
        }
    };

    static help = async (context) => {
        try {
            const commands = await Commands.findAll({ where: { dialog_id: context.peerId } });
            if (!commands.length) return context.send('Команды пока не настроены. Обратитесь к администратору!');
            else {
                let message = 'Список моих команд:\n\n';
                commands.map((command, index) => {
                    message += `${index + 1}. Название - ${command.command_name}\nОписание - ${command.description}\nДоступ - ${command.access}\n\n`;
                });
                await context.send(message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    static add_user = async (context) => {
        try {
            const result = MessageRestructure(context);
            const is_role_valid = RoleValidator(result[3]);
            if (!is_role_valid) return await context.send('Неправильно введена должность!\n\nПример: @nlendon /запрос Nick_Lendon "Главный Следящий за Гетто"\n\nПолучить список всех должностей - @nlendon /roles');
            const is_exist = await Users.findOne({
                where: {
                    [Op.or]: [
                        {
                            vk_id: context.senderId
                        },
                        {
                            role: result[3]
                        },
                        {
                            nick_name: result[2]
                        }
                    ]
                }
            });
            if (is_exist) return await context.send('Пользователь с такими данными уже существует');
            const vk_user = await vk.api.users.get({
                user_ids: context.senderId,
                name_case: 'nom'
            });
            await Users.create({
                full_name: vk_user[0].first_name + ' ' + vk_user[0].last_name,
                vk_id: vk_user[0].id,
                role: result[3],
                nick_name: result[2],
                points: 0,
                warns: 0,
                is_active: false
            });
            await sendMessage({
                peerId: 2000000007,
                message: `Пользователь ${vk_user[0].first_name + ' ' + vk_user[0].last_name} подал заявление на получение доступа!\n\nЕго/Её данные:\n1. Имя Фамилия -  ${vk_user[0].first_name + ' ' + vk_user[0].last_name}\n2. Игровой Никнейм - ${result[2]}\n3. Должность - ${result[3]}\n`,
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.callbackButton({
                            label: 'Одобрить запрос',
                            payload: { action: 'invite_accept', vk_id: vk_user[0].id },
                            color: Keyboard.POSITIVE_COLOR
                        }),
                        Keyboard.callbackButton({
                            label: 'Отклонить запрос',
                            payload: { action: 'invite_deny', vk_id: vk_user[0].id },
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ]
                ]).inline().oneTime()
            });
            await context.send('Администрация бота получила ваш запрос! Ожидайте вердикта.');
        } catch (e) {
            console.log(e);
        }
    };

    static get_roles = async (context) => {
        try {
            let message = 'Список всех должностей:\n\n';
            roles.map((role, index) => {
                message += `${index + 1}. ${role}\n`;
            });
            await context.send(message);
        } catch (e) {
            console.log(e);
        }
    };
}

export default BaseCommands;
