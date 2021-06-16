import { noop } from "lodash";

import { SubscriptionTracker } from "../../src/server/SubscriptionTracker";

describe("SubscriptionTracker", () => {
  const tracker = new SubscriptionTracker();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socket: any = {
    id: "1",
    emit: noop,
  };

  describe("disconnect", () => {
    let unsubscribeSpy: jest.SpyInstance;

    beforeAll(() => {
      unsubscribeSpy = jest.spyOn(tracker, "unsubscribe");

      tracker.disconnect(socket);
    });

    it("deletes the socket", () => {
      expect(tracker._sockets.get("1")).toBeUndefined();
    });

    it("unsubscribes each collection", () => {
      expect(unsubscribeSpy.mock.calls).toEqual([
        [socket, "elementchooser"],
        [socket, "logs"],
        [socket, "run"],
      ]);
    });
  });

  describe("subscribe", () => {
    beforeAll(() => {
      tracker.subscribe(socket, { type: "elementchooser" });
    });

    it("stores the socket", () => {
      expect(tracker._sockets.get("1")).toEqual(socket);
    });

    it("updates the subscription collection", () => {
      const collection = tracker._subscriptions.get("elementchooser");
      if (!collection) throw new Error();
      expect([...collection.values()]).toEqual(["1"]);
    });

    describe("unsubscribe", () => {
      it("remove the socket from the subscription collection", () => {
        tracker.unsubscribe(socket, "elementchooser");
        const collection = tracker._subscriptions.get("elementchooser");
        if (!collection) throw new Error();
        expect([...collection.values()]).toEqual([]);
      });
    });
  });
});
