import React from "react";
import { useAppContext } from "../../utils/AppContext";
import { WebRTC } from "../../utils/WebRTC";
import { sendToServer } from "../../utils/WebSocket";
import styles from "./VideoCall.module.scss";

export type VideoCallType = {
  target: string;
  join?: boolean;
  onCallEnd: () => void;
};

const createAndSendAnswer = async (peerConn: RTCPeerConnection, offer: any) => {
  const desc = new RTCSessionDescription(offer.offer);
  await peerConn.setRemoteDescription(desc);
  const answer = await peerConn.createAnswer();
  await peerConn.setLocalDescription(answer);
  sendToServer({
    username: offer.from,
    type: "send_answer",
    answer: answer,
  });
};

const VideoCall: React.FC<VideoCallType> = ({ target, join, onCallEnd }) => {
  const [localStream, setLocalStream] =
    React.useState<MediaStream | undefined>();
  const [remoteStream, setRemoteStream] =
    React.useState<MediaStream | undefined>();
  const [isCallStarted, setStartCall] = React.useState(false);
  const [isJoined, setJoined] = React.useState(false);
  const [isAnswered, setAnswered] = React.useState(false);
  const [isMuteLocal, setMuteLocal] = React.useState(false);
  const [isPauseLocal, setPauseLocal] = React.useState(false);
  const [localVideo, setLocalVideo] =
    React.useState<HTMLVideoElement | undefined>();

  const [rtc, setRtc] = React.useState<RTCPeerConnection | undefined>();

  const { state, actions } = useAppContext();

  (window as any).state = state;

  React.useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isPauseLocal;
    }
  }, [isPauseLocal, localStream]);

  React.useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMuteLocal;
    }
  }, [isMuteLocal, localStream]);

  const localRef = (video: HTMLVideoElement) => {
    if (localStream && video) {
      video.srcObject = localStream;
      setLocalVideo(video);
    }
  };

  const remoteRef = (video: HTMLVideoElement) => {
    if (remoteStream && video) {
      console.log("set remoteStream", video, remoteStream);
      video.srcObject = remoteStream;
    }
  };

  const handleEndCall = React.useCallback(() => {
    if (state.rtc?.connection) {
      state.rtc.connection.ontrack = null;
      state.rtc.connection.onicecandidate = null;
      state.rtc.connection.oniceconnectionstatechange = null;
      state.rtc.connection.onsignalingstatechange = null;
      state.rtc.connection.onicegatheringstatechange = null;
      state.rtc.connection.onnegotiationneeded = null;

      state.rtc.connection.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });

      if (localVideo?.srcObject) {
        localVideo.pause();
        (localVideo.srcObject as MediaStream).getTracks().forEach((track) => {
          track.stop();
        });
      }

      state.rtc.connection.close();
      actions.initRtc(undefined);
      sendToServer({
        type: "end_call",
        target,
      });

      onCallEnd();
    }
  }, [actions, localVideo, onCallEnd, state.rtc?.connection, target]);

  React.useEffect(() => {
    const createAndSendOffer = async (peerConn: RTCPeerConnection) => {
      const offer = await peerConn.createOffer({});

      sendToServer({
        target,
        type: "store_offer",
        offer: offer,
      });

      peerConn.setLocalDescription(offer);
    };

    const createPeerConn = async (mode: "start" | "join") => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          frameRate: 24,
          width: {
            min: 480,
            ideal: 720,
            max: 1280,
          },
          aspectRatio: 1.33333,
        },
        audio: true,
      });

      setLocalStream(stream);

      const rtc = new WebRTC(state.username, target);
      actions.initRtc(rtc);
      setRtc(rtc.connection);

      stream.getTracks().forEach(function (track) {
        rtc.connection.addTrack(track, stream);
      });

      rtc.connection.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
      };

      if (mode === "start") {
        rtc.connection.onicecandidate = (e) => {
          if (e.candidate == null) {
            return;
          }

          sendToServer({
            target,
            type: "store_candidate",
            candidate: e.candidate,
          });
        };
      } else {
        rtc.connection.onicecandidate = (e) => {
          if (e.candidate == null) return;

          sendToServer({
            username: state.offer.from,
            type: "send_candidate",
            candidate: e.candidate,
          });
        };
      }

      return rtc;
    };

    const startCall = async () => {
      const rtc = await createPeerConn("start");

      createAndSendOffer(rtc.connection);
    };

    if (!join && !isCallStarted) {
      setStartCall(true);
      startCall();
    }
    if (join && !isJoined) {
      setJoined(true);
      createPeerConn("join");
    }
  }, [
    state.username,
    state.offer,
    actions,
    join,
    target,
    isCallStarted,
    isJoined,
  ]);

  React.useEffect(() => {
    if (state.offer && rtc && !isAnswered) {
      setAnswered(true);
      createAndSendAnswer(rtc, state.offer);
    }
  }, [state.offer, rtc, isAnswered, target]);

  React.useEffect(() => {
    if (state.endCall) {
      handleEndCall();
    }
  }, [state.endCall, handleEndCall]);

  return (
    <div className={styles.VideoCall} data-testid="VideoCall">
      <video
        className={styles.LocalVideo}
        autoPlay
        ref={localRef}
        muted
      ></video>
      <video className={styles.RemoteVideo} autoPlay ref={remoteRef}></video>
      <div className={styles.CallActionDiv}>
        <button onClick={() => setPauseLocal(!isPauseLocal)}>
          {isPauseLocal ? "Play" : "Pause"} Video
        </button>
        <button onClick={() => setMuteLocal(!isMuteLocal)}>
          {isMuteLocal ? "Unmute" : "Mute"} Audio
        </button>
        <button onClick={handleEndCall}>End Call</button>
      </div>
    </div>
  );
};

export default VideoCall;
