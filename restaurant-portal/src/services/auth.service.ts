import { HTTP_CLIENT } from "@/config/axios";
import { payload } from "@/contexts/auth-context";

export const loginByStep = async (payload: payload) => {
  const data = {
    phoneNumber: payload.phoneNumber,
    step: payload.step,
    ...(payload.step === 2 && { otpCode: payload.otpCode }),
  };

  return await HTTP_CLIENT.post(`/employee-authentication/login`, data);
};
