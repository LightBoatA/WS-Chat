const { WebSocket } = require("ws");
const ws = new WebSocket("ws://127.0.0.1:8124");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

let name = "匿名用户";

const onLine = () => {
  readline.on("line", (input) => {
    if (input === "close") {
      ws.close();
      readline.close();
    } else if (input === "user list") {
      ws.send(JSON.stringify({ type: "user_list"}))
    }else {
      // 否则将输入发送给服务器
      ws.send(JSON.stringify({ type: "message", data: name + "：" + input}));
    }
  });
};

ws.on("error", console.error);

ws.on("open", function open() {
  console.log("连接成功");
  readline.question("请输入昵称：", (input) => {
    input && (name = input);
    ws.send(JSON.stringify({ type: "add_user", data: name }))
    onLine();
  });
});

ws.on("message", function message(data) {
  console.log(data.toLocaleString());
});
