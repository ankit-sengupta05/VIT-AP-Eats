import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";
import { useRouter } from "next/navigation";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("customer");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setRole(session?.user?.user_metadata?.role ?? "customer");
      setLoading(false);
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setRole(session?.user?.user_metadata?.role ?? "customer");
      
      if (_event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return { user, role, loading, signOut };
}
