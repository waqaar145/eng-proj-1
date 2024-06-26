const rtpPorts = {
  rtcMinPort: 2000,
  rtcMaxPort: 2100,
};

const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {
      "x-google-start-bitrate": 1000,
    },
  },
];

const webRtcTransport_options = {
  listenIps: [
    {
      ip: "0.0.0.0",
      announcedIp: "127.0.0.1",
    },
  ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
};

module.exports = {
  rtpPorts,
  mediaCodecs,
  webRtcTransport_options
};
