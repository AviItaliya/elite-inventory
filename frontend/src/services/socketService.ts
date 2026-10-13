import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:1213";

let socket: Socket | null = null;

// Callback registers listeners and returns a cleanup function.
type SocketSubscription = (socket: Socket) => () => void;

const subscriptions = new Set<SocketSubscription>();

const cleanupFunctions = new Map<SocketSubscription, () => void>();

// Register listeners on the current socket.
const notifySocketAvailable = (currentSocket: Socket): void => {
  subscriptions.forEach((subscription) => {
    cleanupFunctions.get(subscription)?.();

    const cleanup = subscription(currentSocket);

    cleanupFunctions.set(subscription, cleanup);
  });
};

// Subscribe to socket availability.
export const onSocketAvailable = (
  subscription: SocketSubscription,
): (() => void) => {
  subscriptions.add(subscription);

  if (socket) {
    const cleanup = subscription(socket);

    cleanupFunctions.set(subscription, cleanup);
  }

  // Called when a React component unmounts.
  return () => {
    cleanupFunctions.get(subscription)?.();

    cleanupFunctions.delete(subscription);
    subscriptions.delete(subscription);
  };
};

// Connect Socket.IO after authentication.
export const connectSocket = (): Socket | null => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    disconnectSocket();
    return null;
  }

  // Reuse the existing socket.
  if (socket) {
    socket.auth = {
      token: accessToken,
    };

    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  // Create Socket.IO client.
  const newSocket = io(SOCKET_URL, {
    autoConnect: false,

    transports: ["websocket", "polling"],

    auth: {
      token: accessToken,
    },

    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket = newSocket;

  // Register inventory listeners.
  notifySocketAvailable(newSocket);

  newSocket.on("connect", () => {
    console.log("Socket connected:", newSocket.id);
  });

  newSocket.on("connect_error", (error) => {
    console.error("Socket connection failed:", error.message);
  });

  newSocket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  newSocket.connect();

  return newSocket;
};

// Update authentication after token refresh.
export const updateSocketToken = (accessToken: string): void => {
  if (!socket) return;

  socket.auth = {
    token: accessToken,
  };

  // Reauthenticate using the refreshed access token.
  socket.disconnect();
  socket.connect();
};

// Disconnect on logout or authentication failure.
export const disconnectSocket = (): void => {
  // Remove registered inventory listeners.
  cleanupFunctions.forEach((cleanup) => {
    cleanup();
  });

  cleanupFunctions.clear();

  if (!socket) return;

  socket.removeAllListeners();
  socket.disconnect();

  socket = null;
};

// Access the current socket.
export const getSocket = (): Socket | null => {
  return socket;
};
