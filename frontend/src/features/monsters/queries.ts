import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../api/client";
import type { MonsterCatalogResponse } from "./types";

export function useMonstersQuery() {
  return useQuery({
    queryKey: ["monsters"],
    queryFn: () => apiGet<MonsterCatalogResponse>("/monsters"),
  });
}

