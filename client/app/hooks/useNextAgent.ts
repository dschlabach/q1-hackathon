import { publicSupabase } from "@/database/client";
import { useQuery } from "@tanstack/react-query";

/**
 * Gets the next agent ID to use
 */
export const useNextAgent = () => {
  return useQuery({
    queryKey: ["next-agent"],
    queryFn: async () => {
      const { data } = await publicSupabase
        .from("agents")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      // If no agents exist, start with ID 1
      if (!data || data.length === 0) {
        return { id: 1 };
      }

      return { id: data[0].id + 1 };
    },
    refetchInterval: 5000,
  });
};
