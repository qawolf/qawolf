import { copy } from "../theme/copy";
import { Log, TeamWithUsers } from "./types";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

export const dateToText = (timestamp: string): string => {
  const date = new Date(timestamp);

  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  return `${month} ${day}`;
};

export const durationToText = (
  startedAt: string,
  completedAt: string
): string => {
  const startDate = Number(startedAt) || new Date(startedAt).getTime();
  const endDate = Number(completedAt) || new Date(completedAt).getTime();

  const msPerMinute = 60 * 1000;

  const elapsed = endDate - startDate;

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)}s`;
  }

  const minutes = Math.floor(elapsed / msPerMinute);
  const seconds = Math.round((elapsed % msPerMinute) / 1000);

  const minutesText = `${minutes}m`;
  if (!seconds) return minutesText;

  return `${minutesText} ${seconds}s`;
};

export const formatBill = (
  { base_price, metered_price, plan }: TeamWithUsers,
  runCount: number
): string => {
  if (plan !== "business") return "";

  let bill = base_price || 119;

  if (runCount > 1000) {
    bill = bill + Math.ceil((runCount - 1000) / 500) * (metered_price || 49);
  }

  return ` (${copy.currentBill} $${bill})`;
};

export const formatLogBackground = (logLevel: Log["severity"]): string => {
  if (logLevel === "error") return "danger10";
  if (logLevel === "warning") return "warning10";

  return "transparent";
};

export const formatLogBorder = (logLevel: Log["severity"]): string => {
  if (logLevel === "error") return "danger9";
  if (logLevel === "warning") return "warning9";

  return "transparent";
};

export const formatLogColor = (
  logLevel: Log["severity"],
  isTimestamp?: boolean
): string => {
  if (logLevel === "error") return "danger4";
  if (logLevel === "warning") return "warning4";

  if (isTimestamp) return "gray5";
  return "gray3";
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);

  const h = `${date.getHours()}`.padStart(2, "0");
  const m = `${date.getMinutes()}`.padStart(2, "0");
  const s = `${date.getSeconds()}`.padStart(2, "0");
  const ms = `${date.getMilliseconds()}`.padEnd(3, "0");

  return `${h}:${m}:${s}.${ms}`;
};

export const isValidURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);

    if (!["https:", "http:"].includes(parsed.protocol)) {
      return false;
    }
    // https://stackoverflow.com/a/49185442
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(
      parsed.href
    );
  } catch (error) {
    return false;
  }
};

export const parseUrl = (url: string): string => {
  if (url.includes("http://") || url.includes("https://")) return url;

  if (url.startsWith("localhost")) {
    return "http://" + url;
  }

  return "https://" + url;
};

export const runAndSetInterval = (
  fn: () => void,
  ms: number
): NodeJS.Timeout => {
  fn();

  return setInterval(fn, ms);
};

// https://stackoverflow.com/a/6109105
export const timeToText = (previousString: string): string => {
  const current = Date.now();
  const previous = Number(previousString) || new Date(previousString).getTime();

  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    const seconds = Math.floor(elapsed / 1000);
    return seconds + "s ago";
  }
  if (elapsed < msPerHour) {
    const minutes = Math.floor(elapsed / msPerMinute);
    return minutes + "m ago";
  }
  if (elapsed < msPerDay) {
    const hours = Math.floor(elapsed / msPerHour);
    return hours + "h ago";
  }
  if (elapsed < msPerMonth) {
    const days = Math.floor(elapsed / msPerDay);
    return days + "d ago";
  }
  if (elapsed < msPerYear) {
    const months = Math.floor(elapsed / msPerMonth);
    return months + "mo ago";
  }
  const years = Math.floor(elapsed / msPerYear);

  return years + "y ago";
};

export const timestampToText = (timestamp: string | number): string => {
  const date = new Date(Number(timestamp) || timestamp);

  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  const hour = date.getHours();
  const formattedHour = hour > 12 ? hour % 12 : hour;
  const minutes = date.getMinutes();
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  const suffix = hour < 12 ? "AM" : "PM";

  return `${month} ${day}, ${formattedHour}:${formattedMinutes} ${suffix}`;
};
