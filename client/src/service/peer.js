class PeerService {
  constructor() {
    this.createPeer();
  }

  createPeer() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }

  // Called when call is ended or hung up
  createNewPeer() {
    if (this.peer) {
      this.peer.close();
    }
    this.createPeer();
  }

  async getOffer() {
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  }

  async getAnswer(offer) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(new RTCSessionDescription(answer));
    return answer;
  }

  async setLocalDescription(answer) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
  }
}

export default new PeerService();
