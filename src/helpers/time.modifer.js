import moment from 'moment-timezone';

export const modifyTime = (inputTime) => {
    const value = parseInt(inputTime);
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    if (inputTime.includes('ч')) {
        const modifiedTime = moment(currentTime).add(value, 'hours').format('HH:mm');
        return { time: modifiedTime, date: moment().format('YYYY-MM-DD') };
    } else if (inputTime.includes('м')) {
        const modifiedTime = moment(currentTime).add(value, 'minutes').format('HH:mm');
        return { time: modifiedTime, date: moment().format('YYYY-MM-DD') };
    } else if (inputTime.includes('д')) {
        const modifiedDate = moment().add(value, 'days').format('YYYY-MM-DD');
        return { time: currentTime, date: modifiedDate };
    } else if (inputTime.includes('н')) {
        const modifiedDate = moment().add(value, 'weeks').format('YYYY-MM-DD');
        return { time: currentTime, date: modifiedDate };
    } else {
        // Если формат не распознан, вернем исходное время и текущую дату
        return { time: currentTime, date: moment().format('YYYY-MM-DD') };
    }
};
