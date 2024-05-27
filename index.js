const { WebSocketServer } = require("ws");

const NOTICE_PERFIX = '--- 通知☆ --- ';
const REPLY_PERFIX = '--- 服务器回复☆ --- ';
let onlineUsers = [];

const wss = new WebSocketServer({ port: 8124 }, () => {
  console.log("success:ws://127.0.0.1:8124");
});

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  ws.on("message", function message(data) {
    try {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case 'add_user':
          addUser(msg.data, ws);
          break;
        case 'user_list':
          sendUserList(ws);
          break;
        case 'message':
          broadcastUsers(msg.data, ws);
          break;
        default:
          break;
      }
    } catch (error) {
      broadcastUsers(getServerErrorMsg(error))
    }
  });
  ws.on("close", () => {
    removeUser(ws)
  });
});

const getAllOnlineUsersMsg = (perfix) => {
  return (perfix || NOTICE_PERFIX) + '当前在线用户：' + onlineUsers.map(user => user.username).join('、');
}

const getAddUserMsg = (username) => {
  return NOTICE_PERFIX + username + '上线了！' + '\n' + getAllOnlineUsersMsg();
}

const getRemoveUserMsg = (username) => {
  return NOTICE_PERFIX + username + '下线了！' + '\n' + getAllOnlineUsersMsg();
}

const getServerErrorMsg = (error) => {
  return NOTICE_PERFIX + '服务器故障：' + error;
}

const addUser = (username, ws) => {
  onlineUsers.push({ username, socket: ws });
  const data = getAddUserMsg(username)
  broadcastUsers(data);
  console.log('用户加入');
}

const removeUser = (ws) => {
  const offlineUser = onlineUsers.find(user => user.socket === ws);
  if (offlineUser) {
    onlineUsers = onlineUsers.filter(user => user.socket !== ws)
    const data = getRemoveUserMsg(offlineUser.username);
    broadcastUsers(data);
    console.log('用户离开');
  }
}

const sendUserList = (ws) => {
  const data = getAllOnlineUsersMsg(REPLY_PERFIX);
  ws.send(data);
}

const broadcastUsers = (data, ws) => {
  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === 1) {
      client.send(data);
    }
  });
}