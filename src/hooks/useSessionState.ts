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

    let isMounted = true;

    const hydrateSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(currentSession);
      setIsSessionLoading(false);
      if (!currentSession) storage.clearCache();
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setIsSessionLoading(false);
      if (!nextSession) storage.clearCache();
    });

    void hydrateSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    isSessionLoading,
  };
}
