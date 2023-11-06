import axios from 'axios';

export const EditMessage = async (payload) => {
    await axios.post('https://api.vk.com/method/messages.edit', null, {
        params: {
            peer_id: payload.peer_id,
            message: payload.message,
            conversation_message_id: payload.conversation_message_id,
            access_token: process.env.BOT_TOKEN,
            v: '5.154'
        }
    });
};

export const DeleteMessage = async (payload) => {
    console.log(payload);
    try {
        await axios.post('https://api.vk.com/method/messages.delete', null, {
            params: {
                peer_id: payload.peer_id,
                message_ids: null,
                cmids: payload.message_id,
                access_token: process.env.BOT_TOKEN,
                delete_for_all: true,
                v: '5.154'
            }
        });
    } catch (e) {
        console.log(e);
    }
};
