import { useEffect } from "react";
import { connectSocket, disconnectSocket, updateSocketToken } from "../services/socketService";

export const useSocket = (accessToken: string | null): void => {
  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }
    localStorage.setItem("accessToken", accessToken);
    const socket = connectSocket();
    if (socket && socket.connected) {
      updateSocketToken(accessToken);
    }
    return () => {
      disconnectSocket();
    };
  }, [accessToken]);
};