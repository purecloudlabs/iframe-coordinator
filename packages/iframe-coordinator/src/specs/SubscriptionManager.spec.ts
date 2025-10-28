import { describe, expect, test, beforeEach, vi } from "vitest";

import {
  PublicationHandler,
  SubscriptionManager,
} from "../SubscriptionManager";

describe("SubscriptionManager", () => {
  let handler: PublicationHandler;
  let subscriptionManager: SubscriptionManager;

  beforeEach(() => {
    handler = vi.fn();
    subscriptionManager = new SubscriptionManager();
    subscriptionManager.setHandler(handler);
  });

  test("dispatches subscribed messages to the handler function", () => {
    subscriptionManager.subscribe("test.topic");
    subscriptionManager.dispatchMessage({
      topic: "test.topic",
      payload: { meaning: 42 },
    });
    expect(handler).toHaveBeenCalledWith({
      topic: "test.topic",
      payload: { meaning: 42 },
    });
  });

  test("won't dispatch messages to topics that aren't subscribed", () => {
    subscriptionManager.subscribe("test.topic");
    subscriptionManager.dispatchMessage({
      topic: "not.subscribed",
      payload: "foo",
    });
    expect(handler).not.toHaveBeenCalled();
  });

  test("supports unsubscribing from topics.", () => {
    subscriptionManager.subscribe("test.topic");
    subscriptionManager.unsubscribe("test.topic");
    subscriptionManager.dispatchMessage({
      topic: "test.topic",
      payload: "foo",
    });
    expect(handler).not.toHaveBeenCalled();
  });
});
