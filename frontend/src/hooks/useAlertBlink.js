// src/hooks/useAlertBlink.js
import { useState, useEffect } from 'react';

export default function useAlertBlink() {
  const [alertBlink, setAlertBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setAlertBlink((prev) => !prev), 1000);
    return () => clearInterval(interval);
  }, []);

  return alertBlink;
}
