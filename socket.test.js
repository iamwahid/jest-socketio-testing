process.env.PORT = 9991;

const Sequelize = require("sequelize-mock");

jest.setTimeout(10000);

const Client = require("socket.io-client");
const { socketTestData } = require("./socketTestData");

socketTestData.setupSocket(5);
const { chatConstant: chatConstantM, message: messageM } = socketTestData.createPrivateChat(1, 2, "hello");
const chatRoomM = socketTestData.createChatRoom(1, "1", "1,2,3");


const mockModels = {
  socket_users: {
    findOne: jest.fn().mockImplementation((args) => {
      return new Promise((resolve, reject) => {
        // console.log(args)
        const socket = socketTestData.sockets[args.where.userId].socket
        if (!socket) reject()
        resolve(socket)
      })
    }),
    create: jest.fn().mockResolvedValue(socketTestData.sockets[1].socket),
    destroy: jest.fn().mockResolvedValue(socketTestData.sockets[1].socket),
  },
  users: {
    findOne: jest.fn(),
    create: jest.fn().mockResolvedValue(socketTestData.sockets[1].user),
    destroy: jest.fn().mockResolvedValue(socketTestData.sockets[1].user),
    findAll: jest.fn(),
  },
  chat_constants: {
    findOne: jest.fn().mockResolvedValue(chatConstantM),
    create: jest.fn().mockResolvedValue(chatConstantM),
  },
  messages: {
    findOne: jest.fn().mockResolvedValue(messageM),
    create: jest.fn().mockResolvedValue(messageM),
  },
  chat_rooms: {
    findOne: jest.fn().mockResolvedValue(chatRoomM),
    create: jest.fn().mockResolvedValue(chatRoomM),
  },
  mute_chats: {
    findOne: jest.fn().mockResolvedValue({
      dataValues: { isMuted: 0 }
    }),
  }
};


jest.mock("../models/init-models", () => () => (mockModels)); // change here

const { app, io, http } = require("../index"); // Change here

let socketId = "";
let socketClients = {};


describe("Chat Namespace", () => {

  afterEach((done) => {

    for (const key in socketClients) {
      if (Object.hasOwnProperty.call(socketClients, key)) {
        const socket = socketClients[key];
        socket.close()
      }
    }
    done();
  });


  test("connect_user should respond with socket ID", (done) => {
    socketClients[1] = socketTestData.createClient(1, "/chat")
    mockModels.users.findOne.mockImplementation((args) => {
      return new Promise((resolve, reject) => {
        // console.log(args)
        const user = socketTestData.sockets[args.where.auth_key]?.user || socketTestData.sockets[args.where.id]?.user
        if (!user) reject()
        resolve(user)
      })
    });
    socketClients[1].connect();

    socketClients[1].on("connect", () => {
      // console.log(socketClients[1].id);
      socketId = socketClients[1].id;
    });

    socketClients[1].emit("connect_user", { userId: 1, roomId: 1 });
    socketClients[1].on("connect_user", (arg) => {
      expect(arg).toBe(socketId);
      done();
    });
  });

  test("User send message to private chat", (done) => {
    const message = {
      receiverId: 2,
      senderId: 1,
      userId: 1,
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
      parentFileSize: ""
    }
    const eMessage = {
      receiverId: 2,
      senderId: 1,
      userId: 1,
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
      parentMessageJson: null,
      parentUserName: null,
      parentUserProfile: null,
      parentUserUName: null,
      id: 1,
    }

    socketClients[1] = socketTestData.createClient(1, "/chat");
    socketClients[1].on("connect", () => {
      // console.log(socketClients[1].id);
      socketId = socketClients[1].id;
    });

    socketClients[2] = socketTestData.createClient(2, "/chat");
    socketClients[2].on("connect", () => {
      // console.log(socketClients[2].id);
      socketTestData.sockets[2].user.socketUser = {
        socketId: socketClients[2].id
      }
    });
    mockModels.users.findOne.mockImplementation((args) => {
      return new Promise((resolve, reject) => {
        // console.log(args)
        const user = socketTestData.sockets[args.where.auth_key]?.user || socketTestData.sockets[args.where.id]?.user
        if (!user) reject()
        resolve(user)
      })
    });
    socketClients[2].connect();
    socketClients[1].connect();

    socketClients[1].on("chat_message", (arg) => {
      expect(arg).toStrictEqual(eMessage);
    });

    socketClients[2].on("chat_message", (arg) => {
      expect(arg).toStrictEqual(eMessage);
      done();
    });
    socketClients[2].emit("connect_user", { userId: 2, roomId: 1 });
    socketClients[1].emit("connect_user", { userId: 1, roomId: 1 });

    socketClients[1].emit("chat_message", message)
  });

  test("User send message to group chat", (done) => {
    const message = {
      receiverId: 2,
      senderId: 1,
      userId: 1,
      roomid: 1,
      recipients: "2,3",
      senderName: "User 1",
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
      parentFileSize: ""
    }
    let eMessage = {
      receiverId: 2,
      senderId: 1,
      userId: 1,
      senderName: "User 1",
      message: "hello",
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
      chatConstantId: chatConstantM.id,
      id: 1,
      dataValues: {
        receiverId: 2,
        senderId: 1,
        userId: 1,
        groupImage: "",
        groupName: "Chat Room 1,2,3",
        isMuted: 1,
        senderName: "User 1",
        message: "hello",
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
        parentUserName: null,
        id: 1,
      }
    }
    
    socketClients[1] = socketTestData.createClient(1, "/chat");
    socketClients[1].on("connect", () => {
      // console.log(socketClients[1].id);
      // Update socket id
      socketTestData.sockets[1].user.socketUser.socketId = socketClients[1].id;
      socketTestData.sockets[1].user.socket_user.socketId = socketClients[1].id;

      eMessage.dataValues["sender"] = socketTestData.getUser(1, ["dataValues", "save"], ["save"]);

      socketId = socketClients[1].id;
    });

    socketClients[2] = socketTestData.createClient(2, "/chat");
    socketClients[2].on("connect", () => {
      // console.log(socketClients[2].id);
      socketTestData.sockets[2].user.socketUser.socketId = socketClients[2].id
    });

    socketClients[3] = socketTestData.createClient(3, "/chat");
    socketClients[3].on("connect", () => {
      // console.log(socketClients[3].id);
      socketTestData.sockets[3].user.socketUser.socketId = socketClients[3].id;
    });

    mockModels.users.findOne.mockImplementation((args) => {
      return new Promise((resolve, reject) => {
        // console.log(args)
        const user = socketTestData.sockets[args.where.auth_key]?.user || socketTestData.sockets[args.where.id]?.user
        if (!user) reject()
        resolve(user)
      })
    });

    mockModels.users.findAll.mockImplementation((args) => {
      return new Promise((resolve, reject) => {
        // console.log(args)
        const users = [
          socketTestData.sockets[1].user,
          socketTestData.sockets[2].user,
          socketTestData.sockets[3].user,
        ]
        if (!users) reject()
        resolve(users)
      })
    });

    socketClients[2].connect();
    socketClients[3].connect();
    socketClients[1].connect();

    socketClients[1].on("group_chat_message", (arg) => {
      expect(arg).toStrictEqual(eMessage);
    });

    socketClients[2].on("group_chat_message", (arg) => {
      expect(arg).toStrictEqual(eMessage);
    });
    
    socketClients[3].on("group_chat_message", (arg) => {
      expect(arg).toStrictEqual(eMessage);
      done();
    });
    socketClients[2].emit("connect_user", { userId: 2, roomId: 1 });
    socketClients[3].emit("connect_user", { userId: 3, roomId: 1 });
    socketClients[1].emit("connect_user", { userId: 1, roomId: 1 });

    socketClients[1].emit("group_chat_message", message)
  });
});
