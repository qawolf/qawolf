import { Log } from "./types";

export const DEFAULT_URL = "http://todomvc.com/examples/react";

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

const isSameDay = (date: Date, compare: Date): boolean => {
  return (
    date.getDate() === compare.getDate() &&
    date.getMonth() === compare.getMonth() &&
    date.getFullYear() === compare.getFullYear()
  );
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(Number(timestamp) || timestamp);
  const time = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      minute: "numeric",
    })
    .toLowerCase();

  let day = date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, new Date())) day = "Today";
  else if (isSameDay(date, tomorrow)) day = "Tomorrow";

  return `${day} at ${time}`;
};

export const formatLogColor = (logLevel: Log["severity"]): string => {
  if (logLevel === "error") return "red";
  if (logLevel === "warning") return "yellow";

  return "white";
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
  if (
    url.startsWith("http://localhost") ||
    url.startsWith("https://localhost")
  ) {
    return true;
  }

  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator

  return !!pattern.test(url);
};

export const parseUrl = (url: string): string => {
  if (!url) return DEFAULT_URL;

  if (url.includes("http://") || url.includes("https://")) return url;

  if (url.startsWith("localhost")) {
    return "http://" + url;
  }

  return "https://" + url;
};

const pluralCharacter = (digit: number): string => {
  return digit === 1 ? "" : "s";
};

export const randomWolfVariant = (): string => {
  const variants = ["black", "blue", "brown", "gray", "husky", "white"];
  return variants[Math.floor(Math.random() * variants.length)];
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
    return seconds + ` second${pluralCharacter(seconds)} ago`;
  }
  if (elapsed < msPerHour) {
    const minutes = Math.floor(elapsed / msPerMinute);
    return minutes + ` minute${pluralCharacter(minutes)} ago`;
  }
  if (elapsed < msPerDay) {
    const hours = Math.floor(elapsed / msPerHour);
    return hours + ` hour${pluralCharacter(hours)} ago`;
  }
  if (elapsed < msPerMonth) {
    const days = Math.floor(elapsed / msPerDay);
    return days + ` day${pluralCharacter(days)} ago`;
  }
  if (elapsed < msPerYear) {
    const months = Math.floor(elapsed / msPerMonth);
    return months + ` month${pluralCharacter(months)} ago`;
  }
  const years = Math.floor(elapsed / msPerYear);

  return years + ` year${pluralCharacter(years)} ago`;
};
