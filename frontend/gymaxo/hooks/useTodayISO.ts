import { useEffect, useState } from "react";

import { todayISO } from "@/lib/subscription";

function msUntilNextLocalDay() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 1, 0);
  return next.getTime() - now.getTime();
}

export function useTodayISO() {
  const [today, setToday] = useState(todayISO);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(() => {
        setToday(todayISO());
        schedule();
      }, msUntilNextLocalDay());
    };

    schedule();
    return () => clearTimeout(timer);
  }, []);

  return today;
}
