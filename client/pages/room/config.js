export const params = {
  encoding: [
    {
      rid: "r0",
      maxBirate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBirate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBirate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

export const media = {
  audio: true,
  video: {
    width: {
      min: 640,
      max: 1920,
    },
    height: {
      min: 400,
      max: 1080,
    },
  },
};
