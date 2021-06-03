import { getUserLocation } from "../services/location";
import { sortLocationsByDistance } from "../services/location";
import { Context, FileModel, ModelOptions } from "../types";
import { findRunnerLocations } from "./environment_variable";

// NYC
const defaultUserLocation = { latitude: 40.7, longitude: -73.9 };

type BuildFileUrl = {
  id: string;
  ip: Context["ip"];
};

type CreateFile = {
  id: string;
  url: string;
};

export const buildFileUrl = async (
  { id, ip }: BuildFileUrl,
  { db, logger }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("buildFileUrl");
  log.debug("file", id);

  const existingFile = await findFile(id, { db, logger });
  if (existingFile) return existingFile.url;

  const url = await findClosestUrl(ip, { db, logger });
  const newFile = await createFile({ id, url }, { db, logger });

  return newFile.url;
};

export const createFile = async (
  { id, url }: CreateFile,
  { db, logger }: ModelOptions
): Promise<FileModel> => {
  const log = logger.prefix("createFile");
  log.debug("file", id, "url", url);

  const files = await db("files").insert({ id, url }, "*");
  return files[0];
};

export const deleteFile = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<FileModel> => {
  const log = logger.prefix("deleteFile");
  log.debug("file", id);

  const files = await db("files").where({ id }).del("*");
  const file = files[0];
  log.debug("deleted", file?.id);

  return file;
};

export const findClosestUrl = async (
  ip: Context["ip"],
  { db, logger }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("findClosestUrl");
  log.debug("ip", ip);

  const locations = await findRunnerLocations({ db, logger });

  let userLocation = await getUserLocation({ ip, logger });
  if (!userLocation) userLocation = defaultUserLocation;

  const sortedLocations = Object.keys(locations).sort(
    sortLocationsByDistance(locations, userLocation)
  );
  const closestLocation = locations[sortedLocations[0]];
  log.debug("closest", sortedLocations[0]);

  const url = closestLocation.url;
  return url.replace(/^http/, "ws");
};

export const findFile = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<FileModel | null> => {
  const log = logger.prefix("findFile");
  log.debug("file", id);

  const file = await db("files").where({ id }).first();
  log.debug(file ? "found" : "not found");

  return file || null;
};
