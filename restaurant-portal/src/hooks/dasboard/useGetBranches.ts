import { getBranches } from "@/services/branches.service";
import { useQuery } from "@tanstack/react-query";

export const useGetBranches = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });

  return { branches: data?.data || [], isLoading };
};
