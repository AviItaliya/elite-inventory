import api from "./api.js";

export const registerFcmToken = async (token: string) => {
  const response = await api.post(
    "/api/notifications/fcm-token/register",
    {
      token,
    },
  );

  return response.data;
};

export const removeFcmToken = async (token: string) => {
  const response = await api.delete(
    "/api/notifications/fcm-token/remove",
    {
      data: {
        token,
      },
    },
  );

  return response.data;
};