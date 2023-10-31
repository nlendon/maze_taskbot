import Settings from '../models/settings.js';

export const CheckAvailability = async (context) => {
    try {
        const setting = await Settings.findOne({
            where: {
                name: 'availability',
                dialog_id: context.peerId
            }
        });
        if (!setting?.value) return { status: 400, message: 'Бот для данной конференции отключен или не настроен!' };
        const is_stopped = await Settings.findOne({
            where: {
                name: 'emergency_stop',
                dialog_id: context.peerId
            }
        });
        if (is_stopped?.value) return {
            status: 405,
            message: 'Бот совершил аварийную остановку. Сообщите Администратору бота!'
        };
        return {
            status: 200
        };
    } catch (e) {
        console.log(e);
    }
};
