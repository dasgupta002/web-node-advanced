let users = [];

function join(id, userName, roomName) {
    const user = { id, userName, roomName };
    users.push(user);
    return user;
}

function currentUser(id) {
    return users.find((user) => user.id === id);
}

function activeUsers(roomName) {
    return users.filter((user) => user.roomName === roomName);
}

function left(id) {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

module.exports = { join, currentUser, activeUsers, left };