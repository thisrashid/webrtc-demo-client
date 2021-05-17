import { sendToServer } from "./WebSocket";

function log(text: string) {
  // var time = new Date();
  // console.log("[" + time.toLocaleTimeString() + "] " + text);
}

function reportError(errMessage: Error) {
  log_error(`Error ${errMessage.name}: ${errMessage.message}`);
}

function log_error(text: string | Error) {
  var time = new Date();

  console.trace("[" + time.toLocaleTimeString() + "] " + text);
}

export class WebRTC {
  private conn: RTCPeerConnection;
  username: string;
  targetUser: string;

  get connection() {
    return this.conn;
  }

  constructor(username: string, targetUser: string) {
    this.username = username;
    this.targetUser = targetUser;
    // Create an RTCPeerConnection which knows to use our chosen
    // STUN server.
    // this.conn = new RTCPeerConnection();
    const configuration = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
    };
    this.conn = new RTCPeerConnection(configuration);

    // Set up event handlers for the ICE negotiation process.

    // this.conn.onicecandidate = this.handleICECandidateEvent;
    // this.conn.oniceconnectionstatechange =
    //   this.handleICEConnectionStateChangeEvent;
    // this.conn.onicegatheringstatechange =
    //   this.handleICEGatheringStateChangeEvent;
    // this.conn.onsignalingstatechange = this.handleSignalingStateChangeEvent;
    // this.conn.onnegotiationneeded = this.handleNegotiationNeededEvent;
    // this.conn.ontrack = this.handleTrackEvent;
    // console.error(this);
  }

  private handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      log("*** Outgoing ICE candidate: " + event.candidate.candidate);

      sendToServer({
        type: "new-ice-candidate",
        target: this.targetUser,
        candidate: event.candidate,
      });
    }
  };

  private handleICEConnectionStateChangeEvent = () => {
    log("*** ICE connection state changed to " + this.conn.iceConnectionState);

    switch (this.conn.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        this.closeVideoCall();
        break;
    }
  };

  private handleICEGatheringStateChangeEvent = () => {
    log("*** ICE gathering state changed to: " + this.conn.iceGatheringState);
  };

  private handleSignalingStateChangeEvent = () => {
    log("*** WebRTC signaling state changed to: " + this.conn.signalingState);
    switch (this.conn.signalingState) {
      case "closed":
        this.closeVideoCall();
        break;
    }
  };

  private handleNegotiationNeededEvent = async () => {
    log("*** Negotiation needed");

    try {
      log("---> Creating offer");
      const offer = await this.conn.createOffer();
      if (!offer) {
        console.log("Offer not created");
        return;
      }

      // If the connection hasn't yet achieved the "stable" state,
      // return to the caller. Another negotiationneeded event
      // will be fired when the state stabilizes.

      if (this.conn.signalingState !== "stable") {
        log("     -- The connection isn't stable yet; postponing...");
        return;
      }

      // Establish the offer as the local peer's current
      // description.

      log("---> Setting local description to the offer");
      await this.conn.setLocalDescription(offer);

      // Send the offer to the remote peer.

      log("---> Sending the offer to the remote peer");
      sendToServer({
        name: this.username,
        target: this.targetUser,
        type: "video-offer",
        sdp: this.conn.localDescription,
      });
    } catch (err) {
      log(
        "*** The following error occurred while handling the negotiationneeded event:"
      );
      reportError(err);
    }
  };

  private handleTrackEvent = (event: RTCTrackEvent) => {
    log("*** Track event");
    // document.getElementById("received_video").srcObject = event.streams[0];
    // document.getElementById("hangup-button").disabled = false;
  };

  private closeVideoCall = () => {
    // var localVideo = document.getElementById("local_video");

    log("Closing the call");

    // Close the RTCPeerConnection

    if (this.conn) {
      log("--> Closing the peer connection");

      // Disconnect all our event listeners; we don't want stray events
      // to interfere with the hangup while it's ongoing.

      this.conn.ontrack = null;
      this.conn.onicecandidate = null;
      this.conn.oniceconnectionstatechange = null;
      this.conn.onsignalingstatechange = null;
      this.conn.onicegatheringstatechange = null;
      this.conn.onnegotiationneeded = null;

      // Stop all transceivers on the connection

      this.conn.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });

      // Stop the webcam preview as well by pausing the <video>
      // element, then stopping each of the getUserMedia() tracks
      // on it.

      // if (localVideo.srcObject) {
      //   localVideo.pause();
      //   localVideo.srcObject.getTracks().forEach((track) => {
      //     track.stop();
      //   });
      // }

      // Close the peer connection

      this.conn.close();
      // this.conn = null;
      // webcamStream = null;
    }

    // Disable the hangup button

    // document.getElementById("hangup-button").disabled = true;
    // targetUsername = null;
  };
}
