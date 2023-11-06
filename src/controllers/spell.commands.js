import { contentDisposition } from 'express/lib/utils.js';
import { owners_id } from '../common/constants.js';
import { vk } from '../triggers/index.js';
import { DeleteMessage } from '../helpers/edit.message.js';
import Users from '../models/users.js';

class SpellCommands {
    static evanesko = async (context) => {
        try {
            if (owners_id.find((owner) => owner === context.senderId)) {
                await DeleteMessage({
                    peer_id: context.peerId,
                    message_id: context.replyMessage.conversationMessageId
                });
                await context.reply('Хз получилось или нет, но ВЖУУУУУУУУУХ');
            } else {
                await context.reply('А ну Съебастиян отсюда');
            }
        } catch (e) {
            console.log(e);
        }
    };

    static krucio = async (context) => {
        try {
            if (owners_id.find((owner) => owner === context.senderId)) {
                const user = await Users.findOne({ where: { vk_id: context.replyMessage.senderId } });
                if (!user) return await context.reply('Этого далбаеба нет в Базе Данных');
                user.points -= 10;
                await user.save();
                await context.reply("Вжуххх, у него -10 баллов");
            }
        } catch (e) {
            console.log(e);
        }
    };
}

export default SpellCommands;
