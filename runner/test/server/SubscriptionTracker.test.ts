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
        [socket, "code"],
        [socket, "elementchooser"],
        [socket, "logs"],
        [socket, "run"],
        [socket, "users"],
      ]);
    });
  });

  describe("subscribe", () => {
    beforeAll(() => {
      tracker.subscribe(socket, { type: "code" });
    });

    it("stores the socket", () => {
      expect(tracker._sockets.get("1")).toEqual(socket);
    });

    it("updates the subscription collection", () => {
      const collection = tracker._subscriptions.get("code");
      expect(collection?.ids).toEqual(["1"]);
      expect(collection?.data).toEqual([undefined]);

      // check it replaces the data
      tracker.subscribe(socket, {
        type: "code",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: 1 as any,
      });
      expect(collection?.data).toEqual([1]);
    });

    describe("unsubscribe", () => {
      it("remove the socket from the subscription collection", () => {
        tracker.unsubscribe(socket, "code");

        const collection = tracker._subscriptions.get("code");
        expect(collection?.ids).toEqual([]);
        expect(collection?.data).toEqual([]);
      });
    });
  });
});
