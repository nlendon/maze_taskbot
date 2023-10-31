import { vk } from '../triggers/index.js';
import { Keyboard } from 'vk-io';

export const sendMessage = async (payload) => {
    await vk.api.messages.send({
        peer_id: payload.peerId,
        random_id: payload?.random_id || Math.floor(Math.random() * 200),
        message: payload.message,
        keyboard: payload?.keyboard || Keyboard.builder().clone()
    });
};
