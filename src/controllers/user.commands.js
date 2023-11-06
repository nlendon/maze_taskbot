import Users from '../models/users.js';

class UserCommands {
    static get_all_users = async (context) => {
        try {
            const users = await Users.findAll({ is_active: true });
            if (!users.length) return await context.reply('Пользователей пока нет!');
            let message = 'Список всех пользователей:\n\n';
            users.forEach((user, index) => {
                message += `${index + 1}. *id${user.vk_id} (${user.full_name}) - ${user.nick_name} [${user.role}]\n`;
            });
            await context.send(message);
        } catch (e) {
            console.log(e);
        }
    };
}

export default UserCommands;
