import { VK } from 'vk-io';
import BaseCommands from '../controllers/base.commands.js';
import ButtonEvent from '../events/button.event.js';

export const vk = new VK({
    token: process.env.SECOND_TOKEN
});
export const { updates } = vk;

updates.on('message_new', async (context) => {
    if (context.is('message') && context.hasText) {
        const message = context.text.toLowerCase();
        switch (message) {
            case `${process.env.VK_NICK_COMMAND} /start`: {
                await BaseCommands.start(context);
            }
        }
    }
});


try {
    updates.start().catch(console.error);
    ButtonEvent();
    console.log('Бот начал свою работу');
} catch (e) {
    console.log(e);
}
