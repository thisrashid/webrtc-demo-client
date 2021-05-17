import React from "react";
import "webrtc-adapter";
import { Switch, Route, Redirect } from "react-router-dom";
import UserList from "./components/UserList/UserList";
// import Chatroom from "./components/Chatroom/Chatroom";
import Login from "./components/Login/Login";
import { AppContext, useAppContext } from "./utils/AppContext";
import { actions, INIT_STATE, reducer } from "./redux";
import styles from "./App.module.scss";

function PrivateRoute({
  children,
  ...rest
}: JSX.IntrinsicAttributes & { children?: React.ReactNode; path: string }) {
  const { state } = useAppContext();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        state.username ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, INIT_STATE);
  const [offer, setOffer] = React.useState<any>(false);
  const [gotoVideoCall, setVideoCall] = React.useState(false);
  const [hideHeader, setHideHeader] = React.useState(false);

  const reduxActions = React.useMemo(() => {
    return actions(dispatch);
  }, []);

  const onMessage = (evt: MessageEvent) => {
    var msg = JSON.parse(evt.data);

    switch (msg.type) {
      case "userlist": // Received an updated user list
        reduxActions.setUsers(msg.users);
        break;

      case "answer":
        reduxActions.onAnswer(msg.answer);
        break;

      case "candidate":
        reduxActions.addIceCandidate(msg);
        break;

      case "offer":
        reduxActions.videoOffer(msg);
        setOffer(msg);
        break;

      case "end_call":
        reduxActions.endCall();
        break;

      default:
        // reduxActions.addSockMessage(msg);
        console.error("Unknown message received:", msg);
    }
  };
  console.log(hideHeader);
  return (
    <AppContext.Provider value={{ state, actions: reduxActions }}>
      <div className={styles.App}>
        {!gotoVideoCall && !hideHeader && (
          <header className={styles.AppHeader}>
            <span>WebRTC Demo</span>
          </header>
        )}
        {offer && !gotoVideoCall && (
          <div className={styles.Calling}>
            <div className={styles.CallingMessage}>
              <b>{(offer as any).from} Calling...</b>
              <audio src="tmobile_wav.mp3" autoPlay loop />
            </div>
            <div className={styles.CallingActions}>
              <button
                className={styles.Accept}
                onClick={() => {
                  // redirect to chatroom
                  setVideoCall(true);
                }}
              >
                Accept
              </button>
              <button
                className={styles.Reject}
                onClick={() => {
                  //hide this div
                  setOffer(undefined);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        )}
        {gotoVideoCall ? (
          <UserList
            user={(offer as any).from}
            onCallEnd={() => {
              setVideoCall(false);
              setOffer(undefined);
            }}
          />
        ) : (
          <Switch>
            <PrivateRoute path="/user-list">
              <UserList onCallStart={() => setHideHeader(true)} />
            </PrivateRoute>
            <Route path="*">
              <Login onMessage={onMessage} />
            </Route>
          </Switch>
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;
