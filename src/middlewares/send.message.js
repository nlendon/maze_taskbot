import { vk } from '../triggers/index.js';
import { Keyboard } from 'vk-io';

export const sendMessage = async (payload) => {
    if (payload.peerId === 2000000007 || payload.peerId < 2000000000) {
        await vk.api.messages.send({
            peer_id: payload.peerId,
            random_id: payload?.random_id || Math.floor(Math.random() * 200),
            message: payload.message,
            keyboard: payload.keyboard
        });
    } else {
        await vk.api.messages.send({
            peer_id: payload.peerId,
            random_id: payload?.random_id || Math.floor(Math.random() * 200),
            message: payload.message
        });
    }
};
