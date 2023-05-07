export const callJoinedNsps = {
  prefix: "call",
  wsEvents: {
    JOIN_ROOM: "JOIN_ROOM",
    ALL_USERS_IN_ROOM: "ALL_USERS_IN_ROOM",
    GET_RTP_CAPABILITIES: "GET_RTP_CAPABILITIES",
    CREATE_WEB_RTC_TRANSPORT: "CREATE_WEB_RTC_TRANSPORT",
    PRODUCER_TRANSPORT_CONNECT: "PRODUCER_TRANSPORT_CONNECT",
    PRODUCER_TRANSPORT_PRODUCE: "PRODUCER_TRANSPORT_PRODUCE",
    NEW_PRODUCER: "NEW_PRODUCER",
    TRANSPORT_RECV_CONNECT: "TRANSPORT_RECV_CONNECT",
    CONSUME: "CONSUME",
    CONSUMER_RESUME: "CONSUMER_RESUME",
    GET_PRODUCERS: "GET_PRODUCERS",
    PRODUCER_CLOSED: "PRODUCER_CLOSED",
  },
};
