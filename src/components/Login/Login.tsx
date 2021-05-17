import React from "react";
import { Redirect } from "react-router";
import styles from "./Login.module.scss";
import { createWebSocket, sendToServer } from "../../utils/WebSocket";
import { useAppContext } from "../../utils/AppContext";

export type LoginType = {
  onMessage: (evt: MessageEvent) => void;
};
const Login: React.FC<LoginType> = ({ onMessage }: LoginType) => {
  const [name, setName] = React.useState("");
  const [isConnected, setIsConnected] = React.useState(false);
  const { actions } = useAppContext();

  const handleInput = React.useCallback(
    (evt) => {
      setName(evt.target.value);
      actions.setUserName(evt.target.value);
    },
    [actions]
  );

  const connect = React.useCallback(() => {
    console.log("Connect");
    const ws = createWebSocket(name);
    ws.onerror = (event) => {
      console.error("Error occurred: ", event);
    };

    ws.onopen = () => {
      console.log("WebSocket client connected");
      sendToServer({
        type: "store_user",
        username: name,
      });
      setIsConnected(true);
    };

    ws.onmessage = onMessage;
    actions.initSocket(ws);
  }, [onMessage, actions, name]);

  if (isConnected) {
    return <Redirect to="/user-list" />;
  }
  return (
    <div className={styles.Login} data-testid="Login">
      <label>Username</label>
      <input
        id="name"
        type="text"
        maxLength={12}
        required
        value={name}
        onChange={handleInput}
        autoComplete="username"
        inputMode="text"
        placeholder="Username"
      />
      <button onClick={connect}>Login</button>
    </div>
  );
};

export default Login;
