import { HTTP_CLIENT } from "@/config/axios";

export const getBranches = async () => {
  const { data } = await HTTP_CLIENT.get(`/restaurant-portal/get-my-branches`);
  return data;
};
