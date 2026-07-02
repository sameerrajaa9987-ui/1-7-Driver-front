const ENV = {
  development: {
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL_DEV || "http://localhost:5010/api/v1",
    socketUrl:
      process.env.EXPO_PUBLIC_SOCKET_URL_DEV || "http://localhost:5010",
  },
  production: {
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL || "https://api.schoolride.app/api/v1",
    socketUrl:
      process.env.EXPO_PUBLIC_SOCKET_URL || "https://api.schoolride.app",
  },
};

const getEnv = () => (__DEV__ ? ENV.development : ENV.production);

export const environment = getEnv();
