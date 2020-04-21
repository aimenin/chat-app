const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    });

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user);
    return {
        user
    }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    });

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

addUser({
    id: 22,
    username: 'Artem',
    room: 'Group 1'
});

addUser({
    id: 23,
    username: 'Andrew',
    room: 'Group 1'
});

addUser({
    id: 24,
    username: 'Pavel',
    room: 'Group 2'
});

const getUser = (id) => {
    const findedUser = users.find((user) => {
        return user.id === id;
    });

    if (!findedUser) {
        return {
            error: 'No user was founded'
        }
    }

    return findedUser;
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const findedUsers = users.filter(user => user.room === room);

    if (findedUsers.length === 0) {
        return {
            error: 'No users was founded'
        }
    }

    return findedUsers;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

