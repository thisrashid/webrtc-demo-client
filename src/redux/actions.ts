import { Message } from "../utils/types";
import { WebRTC } from "../utils/WebRTC";

type SetUsername = {
  type: "SET_USER_NAME";
  name: string;
};

type SetUsers = {
  type: "SET_USERS";
  users: string[];
};

// type SetClientId = {
//   type: "SET_CLIENT_ID";
//   clientId: number;
// };

// type AddMessage = {
//   type: "ADD_MESSAGE";
//   message: Message;
// };

// type AddSockMessage = {
//   type: "ADD_SOCK_MESSAGE";
//   message: any;
// };

type AddIceCandidate = {
  type: "ADD_ICE_CANDIDATE";
  message: any;
};

type VideoOffer = {
  type: "VIDEO_OFFER";
  message: any;
};

type AnswerVideo = {
  type: "ANSWER_VIDEO";
  message: any;
};

type InitRTC = {
  type: "INIT_RTC";
  message: WebRTC;
};

type InitSocket = {
  type: "INIT_SOCKET";
  message: WebSocket;
};

type OnAnswer = {
  type: "ON_ANSWER";
  message: any;
};

type EndCall = {
  type: "END_CALL";
};

export type Action =
  | SetUsername
  | SetUsers
  // | SetClientId
  // | AddMessage
  // | AddSockMessage
  | AddIceCandidate
  | VideoOffer
  | AnswerVideo
  | InitRTC
  | InitSocket
  | OnAnswer
  | EndCall;
