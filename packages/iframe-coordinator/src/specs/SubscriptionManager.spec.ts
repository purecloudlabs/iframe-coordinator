import {
  PublicationHandler,
  SubscriptionManager,
} from "../SubscriptionManager";

describe("SubscriptionManager", () => {
  let handler: PublicationHandler;
  let subscriptionManager: SubscriptionManager;

  beforeEach(() => {
    handler = jasmine.createSpy("publicationHandler");
    subscriptionManager = new SubscriptionManager();
    subscriptionManager.setHandler(handler);
  });

  it("dispatches subscribed messages to the handler function", () => {
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

  it("won't dispatch messages to topics that aren't subscribed", () => {
    subscriptionManager.subscribe("test.topic");
    subscriptionManager.dispatchMessage({
      topic: "not.subscribed",
      payload: "foo",
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("supports unsubscribing from topics.", () => {
    subscriptionManager.subscribe("test.topic");
    subscriptionManager.unsubscribe("test.topic");
    subscriptionManager.dispatchMessage({
      topic: "test.topic",
      payload: "foo",
    });
    expect(handler).not.toHaveBeenCalled();
  });
});
