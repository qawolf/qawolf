import axios from "axios";

import environment from "../environment";
import { Logger } from "../Logger";

const EARTH_RADIUS_KM = 6371;

type IpLogger = {
  ip: string | null;
  logger: Logger;
};

type Location = {
  latitude: number;
  longitude: number;
};

const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

// https://stackoverflow.com/a/18883819
export const calculateDistance = (
  location1: Location,
  location2: Location
): number => {
  const dLatitude = toRadians(location2.latitude - location1.latitude);
  const dLongitude = toRadians(location2.longitude - location1.longitude);

  const a =
    Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
    Math.cos(toRadians(location1.latitude)) *
      Math.cos(toRadians(location2.latitude)) *
      Math.sin(dLongitude / 2) *
      Math.sin(dLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return c * EARTH_RADIUS_KM;
};

export const getPossibleLocations = (): string[] => {
  const possibleLocations = Object.keys(environment.RUNNER_LOCATIONS);

  possibleLocations.sort((a, b) => {
    // rank the US at the top in case no IP address is provided
    if (a.includes("us")) return -1;
    if (b.includes("us")) return 1;

    return 0;
  });

  return possibleLocations;
};

export const getUserLocation = async ({
  ip,
  logger,
}: IpLogger): Promise<Location | null> => {
  const log = logger.prefix("getUserLocation");
  if (!ip) {
    log.debug("not found: no ip provided");
    return null;
  }

  try {
    const { data } = await axios.get(
      `http://api.ipstack.com/${ip}?access_key=${environment.IPSTACK_API_KEY}`
    );
    const { latitude, longitude } = data;

    if (!latitude || !longitude) {
      log.debug("not found: no location returned from ipstack");
      return null;
    }

    log.debug("found user location", { latitude, longitude });

    return { latitude, longitude };
  } catch (error) {
    log.error(error.message);
    return null;
  }
};

const sortLocationsByDistance = (
  userLocation: Location
): ((a: string, b: string) => number) => {
  return (a: string, b: string): number => {
    const locationA = environment.RUNNER_LOCATIONS[a];
    const locationB = environment.RUNNER_LOCATIONS[b];

    return (
      calculateDistance(userLocation, locationA) -
      calculateDistance(userLocation, locationB)
    );
  };
};

export const rankLocations = async ({
  ip,
  logger,
}: IpLogger): Promise<string[]> => {
  const log = logger.prefix("rankLocations");

  const possibleLocations = getPossibleLocations();
  const userLocation = await getUserLocation({ ip, logger });

  if (!userLocation) {
    log.debug("use default locations", possibleLocations);
    return possibleLocations;
  }

  possibleLocations.sort(sortLocationsByDistance(userLocation));

  log.debug("sort locations by closeness to user", ip, possibleLocations);

  return possibleLocations;
};
