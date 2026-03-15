import { useState, useEffect } from "preact/hooks";

interface DigitalClockProps {
  className?: string;
}

import { memo } from "preact/compat";

export const DigitalClock = memo(function DigitalClock({
  className,
}: DigitalClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <span className={className}>{time.toLocaleTimeString()}</span>;
});
