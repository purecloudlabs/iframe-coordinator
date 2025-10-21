import { describe, expect, test, beforeEach, vi } from "vitest";

import { InternalEventEmitter } from "../EventEmitter";

describe("InternalEventEmitter", () => {
  describe("Basic type event emitter", () => {
    let eventEmitter: InternalEventEmitter<string>;
    beforeEach(() => {
      eventEmitter = new InternalEventEmitter<string>();
    });

    test("should not error when dispatching an event with no listeners", () => {
      expect(() => eventEmitter.dispatch("test", "data")).not.toThrow();
    });

    test("should not error when removing no listeners", () => {
      expect(() => eventEmitter.removeAllListeners("test.event")).not.toThrow();
    });

    test("should not dispatch to different typed event", () => {
      const listener = vi.fn();
      eventEmitter.addListener("wrong.event", listener);
      eventEmitter.dispatch("test.event", "test.data");
      expect(listener).not.toHaveBeenCalled();
    });

    test("should dispatch to correctly typed event", () => {
      const listener = vi.fn();
      eventEmitter.addListener("test.event", listener);
      eventEmitter.dispatch("test.event", "test.data");
      expect(listener).toHaveBeenCalledWith("test.data");
    });

    test("should dispatch to multipe listeners of the right type", () => {
      const listener = vi.fn();
      const listener2 = vi.fn();
      eventEmitter.addListener("test.event", listener);
      eventEmitter.addListener("test.event", listener2);
      eventEmitter.dispatch("test.event", "test.data");
      expect(listener).toHaveBeenCalledWith("test.data");
      expect(listener2).toHaveBeenCalledWith("test.data");
    });

    test("should not re-add an existing listener", () => {
      const listener = vi.fn();
      eventEmitter.addListener("test.event", listener);
      eventEmitter.addListener("test.event", listener);
      eventEmitter.dispatch("test.event", "test.data");
      expect(listener).toHaveBeenCalledWith("test.data");
      expect(listener.mock.calls.length).toBe(1);
    });

    test("should remove an existing listener", () => {
      const listener = vi.fn();
      const listener2 = vi.fn();
      eventEmitter.addListener("test.event", listener);
      eventEmitter.addListener("test.event", listener2);
      eventEmitter.removeListener("test.event", listener);
      eventEmitter.dispatch("test.event", "test.data");
      expect(listener).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith("test.data");
    });

    test("should be able to remove a listener from inside the listener callback", () => {
      const event = "test.event";
      const listener = () => {
        eventEmitter.removeListener(event, listener);
      };
      const listener2 = vi.fn();

      eventEmitter.addListener(event, listener);
      eventEmitter.addListener(event, listener2);

      expect(() => eventEmitter.dispatch(event, "test.data")).not.toThrow();

      expect(listener2).toHaveBeenCalledTimes(1);

      eventEmitter.dispatch(event, "test.data");

      expect(listener2).toHaveBeenCalledTimes(2);
    });

    test("should be able to remove all listeners", () => {
      const listener = vi.fn();
      const listener2 = vi.fn();
      eventEmitter.addListener("test.event", listener);
      eventEmitter.addListener("test.event", listener2);
      eventEmitter.removeAllListeners("test.event");
      eventEmitter.dispatch("test.event", "test.data");
      expect(listener).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe("Advanced type event emitter", () => {
    interface CustomTestData {
      payload1: string;
      payload2: number;
    }
    let eventEmitter: InternalEventEmitter<CustomTestData>;
    beforeEach(() => {
      eventEmitter = new InternalEventEmitter<CustomTestData>();
    });
    const testData = {
      payload1: "test.data",
      payload2: 2,
    };
    test("should dispatch to multipe listeners of the right type", () => {
      const listener = vi.fn();
      const listener2 = vi.fn();
      eventEmitter.addListener("test.event", listener);
      eventEmitter.addListener("test.event", listener2);
      eventEmitter.dispatch("test.event", testData);
      expect(listener).toHaveBeenCalledWith(testData);
      expect(listener2).toHaveBeenCalledWith(testData);
    });
  });
});
