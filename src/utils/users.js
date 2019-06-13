const users = [];

// addUser m removeUser, getUser, getUserInRoom

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate the data
    if (!username || !room){return {error: 'Username or Room are required'}}

    // Check for existing Users with this name
    const existingUser = users.find((user)=>{return user.room === room && user.username === username;})

    //Validate Username
    if (existingUser){return {error:'Username is in use'}}

    // Store user
    const user = {id, username, room};
    users.push(user);
    return { user }
};

const getUser = (id)=>{
    return users.find((user) =>{return user.id === id});};

const getUserInRoom = (room)=>{
       return users.filter((user) => user.room === room)};

const removeUser = (id)=>{
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1){
        return users.splice(index, 1)[0]
    }
};


module.exports = {
    getUser,
    getUserInRoom,
    addUser,
    removeUser
};
