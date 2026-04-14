import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { storage } from "../storage";

export function useSessionState() {
  const [session, setSession] = useState<any>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsSessionLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsSessionLoading(false);
      if (!nextSession) storage.clearCache();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    isSessionLoading,
  };
}
