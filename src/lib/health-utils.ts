// Pure, environment-agnostic helpers shared by the client context and the
// server data layer (no React, no Prisma, no "use client").

/** Formatted date string (YYYY-MM-DD) for `offset` days before today. */
export const getOffsetDateString = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** Sleep quality (1-5) from duration in hours, vs the recommended 8h. */
export const calculateSleepQuality = (duration: number): number => {
  if (duration <= 0) return 0;
  if (duration >= 8) return 5;
  if (duration >= 7) return 4;
  if (duration >= 6) return 3;
  if (duration >= 5) return 2;
  return 1;
};

/* ---- Postgres DATE / TIME <-> client string mapping (UTC to avoid TZ drift) ---- */

/** "YYYY-MM-DD" -> Date at UTC midnight (for a Postgres `@db.Date` column). */
export const parseDateOnly = (dateStr: string): Date =>
  new Date(`${dateStr}T00:00:00.000Z`);

/** Date -> "YYYY-MM-DD" using UTC. */
export const formatDateOnly = (d: Date): string => d.toISOString().slice(0, 10);

/** "08:15 AM" (or 24h "08:15") -> Date holding that time-of-day (for `@db.Time`). */
export const parseTimeOfDay = (timeStr: string): Date => {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  let hours = 0;
  let minutes = 0;
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
  }
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
};

/** Date (time-of-day) -> "hh:mm AM/PM" using UTC. */
export const formatTimeOfDay = (d: Date): string => {
  const h24 = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${minutes} ${meridiem}`;
};
