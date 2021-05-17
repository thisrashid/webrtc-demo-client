let client: WebSocket;
let username: string;

export const createWebSocket = (name: string) => {
  // client = new window.WebSocket(
  //   `wss://${document.location.hostname}:4000`,
  //   "json"
  // );
  client = new window.WebSocket(`wss://ra-webrtc.herokuapp.com/`, "json");

  username = name;
  client.onopen = () => {
    console.log("WebSocket client connected");
  };

  client.onerror = (e) => console.error("WebSocket error observed:", e);

  return client;
};

export const useWebSocket = () => {
  if (!client) {
    throw Error(
      "WebSocket is not created. Please call 'createWebSocket' before this hook"
    );
  }
  return client;
};

export const sendToServer = (msg: any) => {
  if (!client) {
    throw Error(
      "WebSocket is not created. Please call 'createWebSocket' before this hook"
    );
  }
  msg.username = msg.username || username;
  var msgJSON = JSON.stringify(msg);

  // console.log("Sending '" + msg.type + "' message: " + msgJSON);
  client.send(msgJSON);
};
