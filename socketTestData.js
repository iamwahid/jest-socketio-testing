const Client = require("socket.io-client");


const userSchema = {
    id: 1,
    name: "User",
    username: "user",
    profileImage: "",
    phone: "",
    email: "",
    socialId: "",
    socialType: "",
    password: "",
    forgotPassword: "",
    countryCode: "",
    notificationStatus: "",
    lat: "",
    lng: "",
    location: "",
    profileAddress: "",
    state: "",
    country: "",
    zip: "",
    CurrentLocation: "",
    profileType: "",
    language: "",
    dob: "",
    LinkedIn: "",
    Twitter: "",
    Instagram: "",
    about: "",
    height: "",
    plan: "",
    screen: "",
    hideage: "",
    datinghide: "",
    deactivateDelete: "",
    privateEmail: "",
    privateHeight: "",
    verify: "",
    emailverify: "",
    connectwith: "",
    authKey: "",
    deviceType: "",
    pushkitToken: "",
    uuid: "",
    deviceToken: "",
    emailNewPal: "",
    emailNewMesage: "",
    emailPromotion: "",
    pushNewMessage: "",
    pushPal: "",
    is_verify: "",
    deactivate_time: "",
    isDobChanged: "",
    status: "",
    swipes: "",
    emailToken: "",
    isVerified: "",
    tokenExpiry: "",
    firstLogin: "",
    rememberPassword: "",
    loginCategory: "",
    lastLogin: "",
    loginAttempt: "",
    isLocked: "",
    lastLoginAttempt: "",
    chatAuthStatus: "",
    emailNewFollower: "",
    pushNewFollower: "",
    is_phone_verify: "",
    privatePhone: "",
    profilePhone: "",
    profileEmail: "",
    website: "",
    privateReligion: "",
    privateEducation: "",
    privateEthnicity: "",
    privateInterest: "",
    privateField: "",
    privateOccupation: "",
    createdAt: "",
    updatedAt: "",
    stripeCustomerID: "",
    save: jest.fn()
}

const socketUserSchema = {
    id: 1,
    userId: 1,
    socketId: "bAJpxNT3XGEXQCFKAAAB",
    createdAt: "2019-01-01 13:30:31",
    updatedAt: "2019-01-01 13:30:31",
    save: jest.fn()
}

const chatConstantSchema = {
    id: 1,
    userOne: 1,
    userTwo: 2,
    createdAt: "",
    updatedAt: "",
    save: jest.fn()
}

const messageSchema = {
    receiverId: 1,
    senderId: 2,
    userId: 2,
    senderName: "Test User",
    message: "hello 8",
    messageType: 1,
    filename: "",
    lat: "",
    lng: "",
    address: "",
    parentId: null,
    parentMessage: null,
    parentUserId: null,
    mentionedUsers: "",
    fileSize: "",
    parentFileSize: "",
    save: jest.fn()
}

const chatRoomSchema = {
    id: 1,
    name: "Chat Room",
    image: "",
    memberids: "",
    deleted_by_user: "",
    left_by_user: "",
    adminIds: "",
    status: 1,
    createdAt: "",
    updatedAt: "",
}

let socketTestData = {
    sockets: {},
    setupSocket: function (count) {
        // create mocked pair user and socket
        for (let i = 0; i < count; i++) {
            const id = i + 1;
            let user = Object.assign({}, userSchema);
            user.id = id;
            user.authKey = id;
            user.name = `User ${id}`
            user.username = `user_${id}`
            user.email = `user_${id}@testing.com`
            
            let socket = Object.assign({}, socketUserSchema);
            socket.id = id;
            socket.userId = user.id
            socket.socketId = "bAJpxNT3XGEXQCFKAAAB";
            user.socketUser = socket;
            user.socket_user = socket;

            user.dataValues = Object.assign({}, user);
            socket.dataValues = Object.assign({}, socket);

            const socket_user = {
                socket,
                user
            }
            socketTestData.sockets[id] = socket_user
        }
    },
    createClient: function (userId, nsp="/") {
        let socketClient = new Client(`http://localhost:${process.env.PORT}${nsp}`, { autoConnect: false });
        socketClient.auth = {
            security_key: "secret-token",
            auth_key: userId
        }
        return socketClient;
    },
    createPrivateChat: function (senderId, receiverId, messageContent) {
        const sender = socketTestData.sockets[senderId];
        const receiver = socketTestData.sockets[receiverId];
        let chatConstant = Object.assign({}, chatConstantSchema);
        chatConstant.id = parseInt(`${senderId}${receiverId}`)
        chatConstant.userOne = senderId;
        chatConstant.userTwo = receiverId;
        let message = Object.assign({}, messageSchema);
        message.id = 1;
        message.message = messageContent;
        message.receiverId = receiverId;
        message.senderId = senderId;
        message.userId = senderId;
        message.senderName = sender.user.name;

        message.dataValues = Object.assign({}, message);
        return {sender, receiver, chatConstant, message}
    },
    createChatRoom: function (roomId, adminIds, memberids) {
        let chatRoom = Object.assign({}, chatRoomSchema);
        chatRoom.id = roomId;
        chatRoom.adminIds = adminIds;
        chatRoom.memberids = memberids;
        chatRoom.name = `Chat Room ${memberids}`;
        chatRoom.dataValues = Object.assign({}, chatRoom);
        return chatRoom;
    },
    getUser: function (userId, excludes = [], subExcludes = []) {
        let user = JSON.parse(JSON.stringify(socketTestData.sockets[userId].user));
        excludes.forEach(field => {
            delete user[field]
        });

        for (const field in user) {
            if (Object.hasOwnProperty.call(user, field)) {
                const root = user[field];
                if (typeof root == "object") {
                    for (const key in root) {
                        if (subExcludes.includes(key)) {
                            delete user[field][key];
                        }
                    }
                }
            }
        }

        return user;
    }
}

module.exports = {
    socketTestData
}
