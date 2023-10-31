import { updates } from '../triggers/index.js';
import Settings from '../models/settings.js';
import { sendMessage } from '../middlewares/send.message.js';
import Owners from '../models/owners.js';
import Users from '../models/users.js';
import axios from 'axios';

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
                await sendMessage({
                    peerId: context.peerId,
                    message: `Бот успешно был успешно установлен. Чтобы узнать команды бота пропишите @${process.env.VK_NICK_GLOBAL} /help`
                });
                break;
            }
            case 'deny_accept': {
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
                await axios.post('https://api.vk.com/method/messages.edit', null, {
                    params: {
                        peer_id: 2000000007,
                        message: `Пользователь ${user.full_name} подал заявление на получение доступа!\n\nЕго/Её данные:\n1. Имя Фамилия -  ${user.full_name}\n2. Игровой Никнейм - ${user.nick_name}\n3. Должность - ${user.role}\n`,
                        conversation_message_id: context.conversationMessageId,
                        access_token: process.env.BOT_TOKEN,
                        v: '5.154'
                    }
                }).then(async () => {

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

                })
                    .catch((error) => {
                        console.error('Произошла ошибка при редактировании сообщения:', error);
                    });
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

                await axios.post('https://api.vk.com/method/messages.edit', null, {
                    params: {
                        peer_id: 2000000007,
                        message: `Пользователь ${user.full_name} подал заявление на получение доступа!\n\nЕго/Её данные:\n1. Имя Фамилия -  ${user.full_name}\n2. Игровой Никнейм - ${user.nick_name}\n3. Должность - ${user.role}\n`,
                        conversation_message_id: context.conversationMessageId,
                        access_token: process.env.BOT_TOKEN,
                        v: '5.154'
                    }
                }).then(async () => {
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
                })
                    .catch((error) => {
                        console.error('Произошла ошибка при редактировании сообщения:', error);
                    });
                break;
            }
        }
    });
};

export default ButtonEvent;
