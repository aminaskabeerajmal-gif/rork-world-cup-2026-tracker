import { useCallback, useEffect, useRef, useState } from "react";
import { MATCHES, type Match } from "@/data/tournament";
import { applyEspnData, fetchRecentEspnScoreboards, type EspnMatchData } from "@/services/espn";

const POLL_INTERVAL = 60_000;

/** Hook that polls ESPN for live scores and returns merged match data. */
export function useEspnLive() {
  const [espnData, setEspnData] = useState<EspnMatchData[]>([]);
  const [espnLive, setEspnLive] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetchRecentEspnScoreboards();
        if (data.length > 0) setEspnLive(true);
        setEspnData(data);
      } catch {
        // silent
      }
    };

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchRecentEspnScoreboards();
      if (data.length > 0) setEspnLive(true);
      setEspnData(data);
    } catch {
      // silent
    }
  }, []);

  const matches = (() => {
    const lookup = new Map<string, EspnMatchData>();
    for (const e of espnData) {
      lookup.set(`${e.homeId}::${e.awayId}`, e);
    }

    return MATCHES.map((m) => {
      const espnKey = `${m.homeId}::${m.awayId}`;
      const espnMatch = lookup.get(espnKey);
      return applyEspnData(m, espnMatch);
    });
  })();

  return { matches, espnLive, refresh };
}
