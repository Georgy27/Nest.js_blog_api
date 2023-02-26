export type JwtAtPayload = {
  userId: string;
  userLogin: string;
  iat: number;
};
export type JwtRtPayload = {
  userId: string;
  userLogin: string;
  deviceId: string;
  iat: number;
};
