import Users from '../models/users.js';
import { appoint_toGrade_roles, record_allowed_roles, structures } from '../common/constants.js';
import { MessageRestructure } from '../helpers/message.restructure.js';
import Records from '../models/records.js';
import { Op } from 'sequelize';
import { UserRestructure } from '../helpers/user.restructure.js';
import { vk } from '../triggers/index.js';
import Grades from '../models/grades.js';
import { Keyboard } from 'vk-io';
import { v4 as uuid } from 'uuid';
import { contentDisposition } from 'express/lib/utils.js';

class GradeCommands {
    static add_record = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!record_allowed_roles.find((role) => role === has_access.role))
                return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const result = MessageRestructure(context);
            if (!structures.find((str) => str === result[2]) || !result[3])
                return await context.reply('Неправильное использование команды!\n\nПример - @nlendon /добавить_запись Гетто/"Государственные Структуры"/Мафии "Текст"');
            await Records.create({
                structure: result[2],
                description: result[3],
                points: result[4],
                inspector: context.senderId
            });
            await context.send('Запись успешно добавлена! Чтобы посмотреть список всех записей пропишите @nlendon /записи');
        } catch (e) {
            console.log(e);
        }
    };

    static update_record = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!record_allowed_roles.find((role) => role === has_access.role))
                return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const result = MessageRestructure(context);
            const record = await Records.findByPk(result[2]);
            if (!record) return await context.reply('Такой Записи не существует!');
            if (result[3].toLowerCase() === 'структура') {
                record.structure = result[4];
                await record.save();
            } else if (result[3].toLowerCase() === 'запись') {
                record.description = result[4];
                await record.save();
            } else return await context.reply('Не найден столбец для изменения!\nПример: @nlendon /обновить_запись ID Структура/Запись "Значение" .');
            await context.send('Запись была успешно изменена!');
        } catch (e) {
            console.log(e);
        }
    };

    static delete_record = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!record_allowed_roles.find((role) => role === has_access.role))
                return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const result = MessageRestructure(context);
            const record = await Records.findByPk(result[2]);
            if (!record) return await context.reply('Такой Записи не существует!');
            await record.destroy();
            await context.send('Запись была успешно удалена!');
        } catch (e) {
            console.log(e);
        }
    };

    static get_records = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!record_allowed_roles.find((role) => role === has_access.role))
                return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6);
            const records = await Records.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lte]: new Date()
                    }
                }
            });
            if (!records.length) return await context.reply('Записей пока нет!');
            let message = 'Текующие записи за эту неделю:\n\n';
            records.forEach((record, index) => {
                message += `1. Структура - ${record.structure}\n2. Запись - ${record.description}\n3. Администратор - https://vk.com/id${record.inspector}\n4. Идентификатор - ${record.id}\n\n`;
            });
            await context.send(message);
        } catch (e) {
            console.log(e);
        }
    };

    static appoint_toGrade = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!appoint_toGrade_roles.find((role) => role === has_access.role))
                return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const result = MessageRestructure(context);
            if (!result[2]) return await context.reply('Неправильно введен ID пользователя!\n\n Пример: @nlendon /назначить @test');
            const user_vk = UserRestructure(result[2]);
            const appointer = await Users.findOne({ where: { vk_id: user_vk } });
            if (!appointer) return await context.reply('Такого пользователя не существует в базе данных!\n Список всех пользователей - @nlendon /пользователи');
            appointer.is_inspector = true;
            await appointer.save();
            await context.send('Пользователь был назначен Инспектором!');
        } catch (e) {
            console.log(e);
        }
    };

    static remove_inspector = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!appoint_toGrade_roles.find((role) => role === has_access.role))
                return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            const result = MessageRestructure(context);
            if (!result[2]) return await context.reply('Неправильно введен ID пользователя!\n\n Пример: @nlendon /назначить @test');
            const user_vk = UserRestructure(result[2]);
            const inspector = await Users.findOne({ where: { vk_id: user_vk, is_inspector: true } });
            if (!inspector) return await context.reply('Такого пользователя не существует в базе данных!\n Список всех пользователей - @nlendon /пользователи');
            inspector.is_inspector = false;
            await inspector.save();
            await context.send('Пользователь был разжалован!');
        } catch (e) {
            console.log(e);
        }
    };

    static grade_reminder = async () => {
        try {
            const inspector = await Users.findAll({ where: { is_inspector: true } });
            const inspector_ids = inspector.map((user) => user.vk_id);
            await vk.api.messages.send({
                peer_ids: inspector_ids,
                random_id: Math.floor(Math.random() * 200),
                message: 'Напоминание! Воскресенье день веселия, но нужно оценить Структуры, дорогой Инспектор.\n\nИнструкция действий:\n1. Посмотреть все записи, внесенные за эту неделю(@nlendon /записи)\n2. Подтвести итоги и полностью оценить (@nlendon /оценка)\n3. Радуемся жизни, ведь прошла целая неделя и администраторы работали отлично (Наверное)\n\nЦелую, обнимаю и жду указаний'
            });
        } catch (e) {
            console.log(e);
        }
    };

    static grade_structures = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            const is_inspector = await Users.findOne({ where: { vk_id: context.senderId, is_inspector: true } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!appoint_toGrade_roles.find((role) => role === has_access.role)) {
                if (is_inspector.vk_id !== context.senderId)
                    return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            }
            const result = MessageRestructure(context);
            if (!structures.map((str) => str === result[2]) || !result[3] || !result[4]) {
                return await context.reply('Неправильно! Пример:\n\n @nlendon /оценка Гетто/"Государственные Структуры"/Мафии "Текст" 1 (10 бальная система)');
            }
            const check_structure = await Grades.findOne({ where: { structure: result[2] } });
            if (check_structure) return await context.reply('Данная структура уже оценена! Вы можете либо изменить оценку, либо удалить ее');
            await Grades.create({
                id: uuid(),
                structure: result[2],
                conclusion: result[3],
                points: result[4],
                inspector: context.senderId
            });
            const keyboard = Keyboard.keyboard([
                [
                    Keyboard.callbackButton({
                        label: 'Завершить Оценку',
                        payload: {
                            action: 'grade_complete'
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ]
            ]).inline().oneTime();
            await context.send('Оценка была добавлена', { keyboard });
        } catch (e) {
            console.log(e);
        }
    };

    static update_grade = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            const is_inspector = await Users.findOne({ where: { vk_id: context.senderId, is_inspector: true } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!appoint_toGrade_roles.find((role) => role === has_access.role)) {
                if (is_inspector.vk_id !== context.senderId)
                    return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            }
            const result = MessageRestructure(context);
            const grade = await Grades.findByPk(result[2]);
            switch (result[3].toLowerCase()) {
                case 'структура': {
                    if (structures.find((str) => str === result[4])) {
                        const is_exist = await Grades.findOne({ where: { structure: result[4] } });
                        if (is_exist) {
                            return await context.reply('Данная структура уже оценена. Вы можете либо изменить, либо удалить оценку!');
                        }
                        grade.structure = result[4];
                        await grade.save();
                    }
                    break;
                }
                case 'сообщение': {
                    grade.conclusion = result[4];
                    await grade.save();
                    break;
                }
                case 'баллы': {
                    if (parseInt(result[4]) > 10) {
                        return await context.reply('Блять... Сказали же, система 10 бальная. Ты че не знаешь цифры???????');
                    }
                    grade.points = result[4];
                    await grade.save();
                    break;
                }
                default: {
                    return await context.reply('Что-то пошло не так. Пересмотри ваше сообщение');
                }
            }
            const keyboard = Keyboard.keyboard([
                [
                    Keyboard.callbackButton({
                        label: 'Завершить Оценку',
                        payload: {
                            action: 'grade_complete'
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ]
            ]).inline().oneTime();
            await context.send('Оценка была изменена', { keyboard });
        } catch (e) {
            console.log(e);
        }
    };

    static delete_grade = async (context) => {
        try {
            const has_access = await Users.findOne({ where: { vk_id: context.senderId } });
            const is_inspector = await Users.findOne({ where: { vk_id: context.senderId, is_inspector: true } });
            if (!has_access) return await context.reply('Тебя нет в Базе Данных! Составь заявку через команду @nlendon /запрос');
            if (!appoint_toGrade_roles.find((role) => role === has_access.role)) {
                if (is_inspector.vk_id !== context.senderId)
                    return await context.reply('Пипирка твоя не выросла, чтобы использовать эту команду!');
            }
            const result = MessageRestructure(context);
            const grade = await Grades.findByPk(result[2]);
            if (!grade) return await context.reply('Данной оценки не сущетсвует!');
            await grade.destroy();
            await context.send('Оценка была удалена!');
        } catch (e) {
            console.log(e);
        }
    };

    static get_grades = async (context) => {
        try {
            const user = await Users.findOne({ where: { vk_id: context.senderId } });
            if (!user) return await context.reply('Не нашел тебя в базе данных! Отправь запрос на получение роли');
            const grades = await Grades.findAll();
            if (!grades.length) return await context.reply('Список оценок отсутсвует!');
            let message = 'Список оценок структур\n\n';
            grades.forEach((grade) => {
                message += `1. Структура - ${grade.structure}\n 2. Сообщение - ${grade.conclusion}\n3. Баллы - ${grade.points}/10\n4. Инспектор - https://vk.com/id${grade.inspector}\n5. Идентификатор - ${grade.id}\n\n`;
            });
            await context.send(message);
        } catch (e) {
            console.log(e);
        }
    };
}

export default GradeCommands;
