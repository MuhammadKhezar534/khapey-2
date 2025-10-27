import axios, { AxiosInstance } from "axios";
import useAuthenticated from "@/hooks/useAuthenticate";
import { getToken } from "@/utils/functions";
export const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const HTTP_CLIENT: AxiosInstance = axios.create({
  baseURL: serverUrl,
});

const token = getToken();

console.log({ token });
if (typeof window !== "undefined") {
  HTTP_CLIENT.interceptors.request.use(
    async (config: any) => {
      try {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {}

      return config;
    },
    (err: any) => {
      return Promise.reject(err);
    }
  );
}

export { HTTP_CLIENT };
