export const MessageRestructure = (context) => {
    const regex = /[^\s"]+|"([^"]*)"/g;
    const result = [];
    let match;
    while (match = regex.exec(context.message.text)) {
        result.push(match[1] || match[0]);
    }
    return result;
};
