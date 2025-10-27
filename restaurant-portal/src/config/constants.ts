import axios, { AxiosInstance } from "axios";
export const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const HTTP_CLIENT: AxiosInstance = axios.create({
  baseURL: serverUrl,
});

export default HTTP_CLIENT;
