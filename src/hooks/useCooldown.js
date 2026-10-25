import { useEffect, useState } from "react";

export const useCooldown = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (secondsRemaining <= 0) return undefined;
    const timeout = window.setTimeout(
      () => setSecondsRemaining((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [secondsRemaining]);

  return {
    secondsRemaining,
    startCooldown: (seconds = 60) => setSecondsRemaining(seconds),
  };
};
