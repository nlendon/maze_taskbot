import * as words from '../common/words.json' assert { type: 'json' };
import { bot } from '../app.js';

export const banWords = (ctx) => {
    if(words.find((local) => ctx.message.text.includes(local.word))) {
        ctx.reply('Пошел наххуй')
    } else {
        ctx.reply('ok')
    }
};
