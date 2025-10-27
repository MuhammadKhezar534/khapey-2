import { HTTP_CLIENT } from "@/config/axios";

type Id = string | number | undefined | null;

const getParams = (time?: string, id?: Id) => {
  const params = new URLSearchParams();
  if (id) params.append("branch_id", String(id));
  if (time) params.append("time_filter", time);
  return params;
};

export const getDashboardOverview = async (time?: string, id?: Id) => {
  const params = getParams(time, id);

  const { data } = await HTTP_CLIENT.get(
    `/restaurant-portal/get-overview?${params.toString()}`
  );
  return data;
};

export const getBranchesBreakDown = async (time?: string, id?: Id) => {
  const params = getParams(time, id);

  const { data } = await HTTP_CLIENT.get(
    `/restaurant-portal/get-branches-breakdown?${params.toString()}`
  );
  return data;
};

export const getBranchesPerformance = async (time?: string, id?: Id) => {
  const params = getParams(time, id);

  const { data } = await HTTP_CLIENT.get(
    `/restaurant-portal/get-branches-performance?${params.toString()}`
  );
  return data;
};

export const getReviews = async (time?: string, id?: Id) => {
  const params = getParams(time, id);
  const { data } = await HTTP_CLIENT.get(
    `/restaurant-portal/get-branches-reviews?${params.toString()}`
  );
  return data;
};

export const getQNAByBranch = async (id?: Id) => {
  const { data } = await HTTP_CLIENT.get(
    `/review-answers/review-answer-qna/${id}`
  );
  return data;
};
