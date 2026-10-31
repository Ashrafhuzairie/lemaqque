import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, repository, LOCAL_USER } from "./repository";
import type { TableName, Tables } from "./types";
const Context = createContext<{
  local: boolean;
  userId: string | null;
  ready: boolean;
  repo: ReturnType<typeof repository>;
  enterLocal: () => void;
  signOut: () => Promise<void>;
} | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [local, setLocal] = useState(
    () => localStorage.getItem("lmq:mode") === "local",
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(!supabase);
  const query = useQueryClient();
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error) setUserId(data.session?.user.id || null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id || null);
      if (session) {
        setLocal(false);
        localStorage.removeItem("lmq:mode");
      }
      query.clear();
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [query]);
  const id = local ? LOCAL_USER : userId;
  return (
    <Context.Provider
      value={{
        local,
        userId: id,
        ready,
        repo: repository(local, id || ""),
        enterLocal: () => {
          setLocal(true);
          localStorage.setItem("lmq:mode", "local");
          query.clear();
        },
        signOut: async () => {
          if (userId && supabase) {
            const { error } = await supabase.auth.signOut({ scope: "local" });
            if (error) throw error;
          }
          setLocal(false);
          setUserId(null);
          localStorage.removeItem("lmq:mode");
          query.clear();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const ctx = useContext(Context);
  if (!ctx) throw Error("Missing data provider");
  return ctx;
}
export function useRows<K extends TableName>(table: K) {
  const { repo, userId, local } = useStore();
  return useQuery({
    queryKey: [local, userId, table],
    queryFn: () => repo.list(table),
    enabled: !!userId,
  });
}
export function useSave<K extends TableName>(table: K) {
  const { repo, userId, local } = useStore();
  const query = useQueryClient();
  return useMutation({
    mutationFn: (row: Tables[K]) => repo.save(table, row),
    onSuccess: () =>
      query.invalidateQueries({ queryKey: [local, userId, table] }),
  });
}
export function useRemove(table: TableName) {
  const { repo, userId, local } = useStore();
  const query = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repo.remove(table, id),
    onSuccess: () => {
      query.invalidateQueries({ queryKey: [local, userId, table] });
      if (table === "workout_sessions")
        query.invalidateQueries({ queryKey: [local, userId, "set_logs"] });
    },
  });
}
export function useProfile() {
  const query = useRows("profiles");
  return { ...query, profile: query.data?.[0] };
}
export function identity(userId: string) {
  return { id: crypto.randomUUID(), user_id: userId };
}
