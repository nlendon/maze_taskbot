import { Keyboard } from 'vk-io';
import { updates, vk } from '../triggers/index.js';

const ButtonEvent = () => {
    updates.on('message_event', async (context) => {
        const message_payload = context.eventPayload;
        if (message_payload.action === 'start_accept') {
            await vk.api.messages.send({
                peer_id: context.peerId,
                random_id: Math.floor(Math.random() * 100),
                message: `Бот успешно был установлен успешно. Чтобы узнать команды бота пропишите @${process.env.VK_NICK_GLOBAL} /help`,
                keyboard: Keyboard.builder().clone()
            });
        } else if (message_payload.action === 'deny_accept') {
            await vk.api.messages.send({
                peer_id: context.peerId,
                random_id: Math.floor(Math.random() * 100),
                message: 'Создатель бота отказался устанавливать бота.',
                keyboard: Keyboard.builder().clone()
            });
        }
    });
};

export default ButtonEvent;
