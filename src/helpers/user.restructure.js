export const UserRestructure = (text) => {
    const match = text.match(/\[id(\d+)\|/);
    if (match && match[1]) {
        return parseInt(match[1]);
    } else {
        return null;
    }
};
