import { Message } from "../utils/types";
import { WebRTC } from "../utils/WebRTC";
import { Action } from "./actions";

export type State = {
  username: string;
  clientId: number;
  users: string[];
  messages: Message[];
  sockMsgs: any[];
  rtc?: WebRTC;
  offer?: any;
  socket?: WebSocket;
  answer?: any;
  endCall: boolean;
};

export const INIT_STATE: State = {
  username: "",
  clientId: -1,
  users: [],
  messages: [],
  sockMsgs: [],
  endCall: false,
};

export function reducer(state: State, action: Action) {
  // console.log(action.type, state, action);
  switch (action.type) {
    case "SET_USER_NAME":
      return { ...state, username: action.name };

    case "SET_USERS":
      return { ...state, users: action.users };

    // case "SET_CLIENT_ID":
    //   return { ...state, clientId: action.clientId };

    // case "ADD_MESSAGE":
    //   return { ...state, messages: [...state.messages, action.message] };

    // case "ADD_SOCK_MESSAGE":
    //   return { ...state, sockMsgs: [...state.sockMsgs, action.message] };

    case "VIDEO_OFFER":
      return {
        ...state,
        offer: action.message,
      };

    case "INIT_RTC":
      return {
        ...state,
        rtc: action.message,
        endCall: false,
      };

    case "ON_ANSWER":
      const desc = new RTCSessionDescription(action.message);
      state.rtc?.connection.setRemoteDescription(desc);
      return {
        ...state,
      };

    case "INIT_SOCKET":
      return {
        ...state,
        socket: state.socket || action.message,
      };

    case "ADD_ICE_CANDIDATE": {
      state.rtc?.connection.addIceCandidate(
        new RTCIceCandidate(action.message.candidate)
      );
      return {
        ...state,
        rtc: state.rtc,
      };
    }

    case "END_CALL":
      return { ...state, endCall: true };

    default:
      // throw new Error();
      console.error(state, action);
      return state;
  }
}

export const actions = (dispatch: (action: Action) => void) => {
  return {
    setUserName(name: string) {
      dispatch({ type: "SET_USER_NAME", name });
    },
    setUsers(users: string[]) {
      dispatch({ type: "SET_USERS", users });
    },
    // setClientId(clientId: number) {
    //   dispatch({ type: "SET_CLIENT_ID", clientId });
    // },
    // addMessage(message: Message) {
    //   dispatch({ type: "ADD_MESSAGE", message });
    // },
    // addSockMessage(message: any) {
    //   dispatch({ type: "ADD_SOCK_MESSAGE", message });
    // },
    addIceCandidate(message: any) {
      dispatch({ type: "ADD_ICE_CANDIDATE", message });
    },
    videoOffer(message: any) {
      dispatch({ type: "VIDEO_OFFER", message });
    },
    answerVideo(message: any) {
      dispatch({ type: "ANSWER_VIDEO", message });
    },
    initRtc(message: WebRTC) {
      dispatch({ type: "INIT_RTC", message });
    },
    initSocket(message: WebSocket) {
      dispatch({ type: "INIT_SOCKET", message });
    },
    onAnswer(message: any) {
      dispatch({ type: "ON_ANSWER", message });
    },
    endCall() {
      dispatch({ type: "END_CALL" });
    },
  };
};
