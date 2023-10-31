import { VK } from 'vk-io';
import BaseCommands from '../controllers/base.commands.js';
import ButtonEvent from '../events/button.event.js';
import '../models/index.js';
import { CheckAvailability } from '../middlewares/check.availability.js';
import { sendMessage } from '../middlewares/send.message.js';
import OwnerCommands from '../controllers/owner.commands.js';
import Owners from '../models/owners.js';

export const vk = new VK({
    token: process.env.BOT_TOKEN,
});
export const { updates } = vk;

updates.on('message_new', async (context) => {
    try {
        if (context.is('message') && context.hasText) {
            let message = context.text.toLowerCase();
            message = message.split(' ');
            if (message[0] + ' ' + message[1] !== `${process.env.VK_NICK_COMMAND} /start` && message[0] === `${process.env.VK_NICK_COMMAND}`) {
                const available = await CheckAvailability(context);
                if (available.status !== 200 && available.status !== 405) {
                    return await sendMessage({
                        peerId: context.peerId,
                        message: available.message
                    });
                } else if (available.status === 405) {
                    if (message[1] === '/emergency_start') {
                        const is_owner = await Owners.findOne({ where: { vk_id: context.senderId } });
                        if (!is_owner) return await sendMessage({
                            peerId: context.peerId,
                            message: 'Пипирка твоя не выросла, чтобы использовать эту команду!'
                        });
                        const message = await OwnerCommands.emergency_start(context);
                        await context.send(message);
                    } else return await sendMessage({
                        peerId: context.peerId,
                        message: available.message
                    });
                }
            }
            switch (message[0] + ' ' + message[1]) {
                case `${process.env.VK_NICK_COMMAND} /start`: {
                    await BaseCommands.start(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /help`: {
                    await BaseCommands.help(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /roles`: {
                    await BaseCommands.get_roles(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /запрос`: {
                    await BaseCommands.add_user(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /create_command`: {
                    await OwnerCommands.create_command(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /delete_command`: {
                    await OwnerCommands.delete_command(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /ohelp`: {
                    await OwnerCommands.get_owner_commands(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /авада_кедавра`: {
                    await OwnerCommands.avada_kedavra(context);
                    break;
                }
                case `${process.env.VK_NICK_COMMAND} /emergency_stop`: {
                    await OwnerCommands.emergency_stop(context);
                    break;
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
});


try {
    updates.start().catch(console.error);
    ButtonEvent();
    console.log('Бот начал свою работу');
} catch (e) {
    console.log(e);
}
