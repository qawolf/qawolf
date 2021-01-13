import axios from "axios";

import environment from "../../../server/environment";
import {
  calculateDistance,
  getPossibleLocations,
  getUserLocation,
  rankLocations,
} from "../../../server/services/location";
import { logger } from "../utils";

jest.mock("axios");

describe("calculateDistance", () => {
  it("calculates the distance in km between two locations", () => {
    const distance = calculateDistance(
      { latitude: 45.657, longitude: -111.203 },
      { latitude: 47.233, longitude: -119.852 }
    );

    expect(distance).toBeCloseTo(685.05);
  });
});

describe("getPossibleLocations", () => {
  it("sorts possible locations by putting US first", () => {
    environment.RUNNER_LOCATIONS = {
      westus2: { buffer: 1, latitude: 0, longitude: 0, reserved: 1 },
      japan: { buffer: 1, latitude: 0, longitude: 0, reserved: 1 },
      eastus: { buffer: 1, latitude: 0, longitude: 0, reserved: 1 },
    };

    expect(getPossibleLocations()).toEqual(["eastus", "westus2", "japan"]);
  });
});

describe("getUserLocation", () => {
  it("returns null if no IP address provided", async () => {
    const location = await getUserLocation({ ip: null, logger });
    expect(location).toBeNull();
  });

  it("returns user location based on IP address", async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.get as any).mockResolvedValue({
      data: { latitude: 1, longitude: 2 },
    });

    const location = await getUserLocation({ ip: "127.0.0.1", logger });
    expect(location).toEqual({ latitude: 1, longitude: 2 });
  });

  it("returns null if no latitude or longitude returned", async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.get as any).mockResolvedValue({
      data: { latitude: null, longitude: 2 },
    });

    const location = await getUserLocation({ ip: "127.0.0.1", logger });
    expect(location).toBeNull();
  });

  it("returns null if request not successful", async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.get as any).mockRejectedValue(new Error("demogorgon!"));

    const location = await getUserLocation({ ip: "127.0.0.1", logger });
    expect(location).toBeNull();
  });
});

describe("rankLocations", () => {
  it("ranks possible locations by distance to user", async () => {
    environment.RUNNER_LOCATIONS = {
      westus2: {
        buffer: 1,
        latitude: 47.233,
        longitude: -119.852,
        reserved: 1,
      },
      japaneast: { buffer: 1, latitude: 35.68, longitude: 139.77, reserved: 1 },
      eastus2: {
        buffer: 1,
        latitude: 36.6681,
        longitude: -78.3889,
        reserved: 1,
      },
    };

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.get as any).mockResolvedValue({
      data: { latitude: 45.657, longitude: -111.203 },
    });

    const locations = await rankLocations({ ip: "127.0.0.1", logger });
    expect(locations).toEqual(["westus2", "eastus2", "japaneast"]);
  });
});
