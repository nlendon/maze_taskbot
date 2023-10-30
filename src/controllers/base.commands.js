import { owner_id } from '../common/constants.js';
import { Keyboard } from 'vk-io';

class BaseCommands {

    // /start от Создателя Бота
    static start = async (context) => {
        try {
            if (context.senderId === owner_id) {
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
}

export default BaseCommands;
