import { describe, expect, test, beforeEach, vi } from "vitest";

import { AbstractClient } from "../AbstractClient";
import { API_PROTOCOL, applyClientProtocol } from "../messages/LabeledMsg";
import { SetupData } from "../messages/Lifecycle";
import { Publication } from "../messages/Publication";

class TestClient extends AbstractClient<Window> {
  public _globalContext: Window;
  public _onEnvironmentData = vi.fn();
  public _postMessage = vi.fn();
}

describe("client", () => {
  let client: TestClient;
  let mockGlobalScope: any;

  beforeEach(() => {
    mockGlobalScope = {
      eventHandlers: {},
      trigger: (eventId: string, eventData: any) => {
        mockGlobalScope.eventHandlers[eventId](eventData);
      },
      addEventListener: (eventId: string, handler: () => void) => {
        mockGlobalScope.eventHandlers[eventId] = handler;
      },
      removeEventListener: (eventId: string) => {
        delete mockGlobalScope.eventHandlers[eventId];
      }
    };

    client = new TestClient();
    client._globalContext = mockGlobalScope;
  });

  describe("when the client is started", () => {
    beforeEach(() => {
      client.start();
    });

    test("should send a client_started notification", () => {
      expect(client._postMessage).toHaveBeenCalledWith(
        applyClientProtocol({
          msgType: "client_started",
          msg: undefined,
        }),
      );
    });
  });

  describe("after environment data is received", () => {
    const testEnvironmentData: SetupData = {
      locale: "nl-NL",
      hostRootUrl: "http://example.com/host-root/",
      registeredKeys: [],
      custom: undefined,
      assignedRoute: "client-route",
    };
    let environmentListener = vi.fn();

    beforeEach(() => {
      environmentListener.mockReset();
      client.addListener("environmentalData", environmentListener);
      client.start();

      mockGlobalScope.trigger("message", {
        data: {
          msgType: "env_init",
          msg: testEnvironmentData,
        },
      });
    });

    test("should call any registered `environmentalData` listeners", () => {
      const { assignedRoute, ...restEnvData } = testEnvironmentData;
      expect(environmentListener).toHaveBeenCalledWith(restEnvData);
    });

    describe("generate full URL from client path", () => {
      test("should be able to generate full url from client path", () => {
        const urlFromClient = client.urlFromClientPath("client/path");
        expect(urlFromClient).toEqual("http://example.com/host-root/client-route/client/path");
      });

      test("should ignore client route leading slash and hash tag", () => {
        let urlFromClient = client.urlFromClientPath("/client/path");
        expect(urlFromClient).toEqual("http://example.com/host-root/client-route/client/path");
        urlFromClient = client.urlFromClientPath("#/client/path");
        expect(urlFromClient).toEqual("http://example.com/host-root/client-route/client/path");
        urlFromClient = client.urlFromClientPath("/#/client/path");
        expect(urlFromClient).toEqual("http://example.com/host-root/client-route/client/path");
      });
      test("should keep query strings", () => {
        const urlFromClient = client.urlFromClientPath(
          "/#/client/path?foo=bar",
        );
        expect(urlFromClient).toEqual(
          "http://example.com/host-root/client-route/client/path?foo=bar",
        );
      });
    });

    describe("generate full URL from host path", () => {
      test("should be able to access full url from host path", () => {
        const urlFromHost = client.urlFromHostPath("host-route");
        expect(urlFromHost).toEqual("http://example.com/host-root/host-route");
      });

      test("should ignore host route leading slash and hash tag", () => {
        let urlFromHost = client.urlFromHostPath("/host-route");
        expect(urlFromHost).toEqual("http://example.com/host-root/host-route");
        urlFromHost = client.urlFromHostPath("#/host-route");
        expect(urlFromHost).toEqual("http://example.com/host-root/host-route");
        urlFromHost = client.urlFromHostPath("/#/host-route");
        expect(urlFromHost).toEqual("http://example.com/host-root/host-route");
      });
      test("should keep query strings", () => {
        const urlFromHost = client.urlFromHostPath("/#/host-route?foo=bar");
        expect(urlFromHost).toEqual("http://example.com/host-root/host-route?foo=bar");
      });
    });
  });

  describe("when client requests a toast notification", () => {
    beforeEach(() => {
      client.start();
    });

    describe("with only a message", () => {
      beforeEach(() => {
        client.requestNotification({
          message: "Test notification message",
        } as any);
      });

      test("should send a message to the host", () => {
        expect(client._postMessage).toHaveBeenCalledWith(
          applyClientProtocol({
            msgType: "notifyRequest",
            msg: {
              title: undefined,
              message: "Test notification message",
              custom: undefined,
            },
          }),
        );
      });
    });

    describe("with message and extra data", () => {
      beforeEach(() => {
        client.requestNotification({
          title: "Test title",
          message: "Test notification message",
          custom: { data: "test data" },
        });
      });

      test("should send a message to the host", () => {
        expect(client._postMessage).toHaveBeenCalledWith(
          applyClientProtocol({
            msgType: "notifyRequest",
            msg: {
              title: "Test title",
              message: "Test notification message",
              custom: { data: "test data" },
            },
          }),
        );
      });
    });
  });

  describe("when publishing a new message", () => {
    beforeEach(() => {
      client.start();
      client.publish({ topic: "test.topic", payload: "custom data" });
    });

    test("should notify host of new publication", () => {
      expect(client._postMessage).toHaveBeenCalledWith(
        applyClientProtocol({
          msgType: "publish",
          msg: {
            topic: "test.topic",
            payload: "custom data",
            clientId: undefined,
          },
        }),
      );
    });
  });

  describe("when listening for messages from the host application", () => {
    let subscriptionCalled = false;
    beforeEach(() => {
      subscriptionCalled = false;
      client.start();
      client.messaging.addListener(
        "myTopic",
        () => (subscriptionCalled = true),
      );
    });

    test("should throw an exception on invalid message type", () => {
      expect(() => {
        mockGlobalScope.trigger("message", {
          data: {
            protocol: API_PROTOCOL,
            msgType: "not valid type",
            msg: { topic: "myTopic", payload: "data" },
            direction: "HostToClient",
          },
        });
      }).toThrowError(
        /^I received an invalid message from the host application/,
      );
      expect(subscriptionCalled).toBe(false);
    });

    test("should throw an exception on invalid message content", () => {
      expect(() => {
        mockGlobalScope.trigger("message", {
          data: {
            protocol: API_PROTOCOL,
            msgType: "publish",
            msg: { invalid: "yes" },
            direction: "HostToClient",
          },
        });
      }).toThrowError(
        /^I received an invalid message from the host application/,
      );
      expect(subscriptionCalled).toBe(false);
    });

    // Fix this in next major release, holding off for now in case of compat issues
    // test("should throw an exception on invalid iframe-coordinator message with no direction", () => {
    //   expect(() => {
    //     mockFrameWindow.trigger("message", {
    //       data: {
    //         protocol: API_PROTOCOL,
    //         msgType: "publish",
    //         msg: { topic: "myTopic", payload: "data" },
    //       },
    //     });
    //   }).toThrowMatching((err) => {
    //     return err.message.startsWith(
    //       "I received an invalid message from the host application",
    //     );
    //   });
    //   expect(subscriptionCalled).toBe(false);
    // });

    test("should ignore messages from other client applications", () => {
      expect(() => {
        mockGlobalScope.trigger("message", {
          protocol: API_PROTOCOL,
          data: {
            protocol: API_PROTOCOL,
            msgType: "publish",
            msg: { topic: "myTopic", payload: "data" },
            direction: "ClientToHost",
          },
        });
      }).not.toThrow();
      expect(subscriptionCalled).toBe(false);
    });
  });

  describe("when receiving an valid window message from the host application missing the direction field", () => {
    let publishCalls = 0;
    let receivedPayload: string;
    beforeEach(() => {
      client.start();
      client.messaging.addListener("test.topic", (data: Publication) => {
        publishCalls++;
        receivedPayload = data.payload;
      });
      mockGlobalScope.trigger("message", {
        data: {
          msgType: "publish",
          msg: {
            topic: "test.topic",
            payload: "test data",
          },
        },
      });
    });

    test("should raise a publish event for the topic", () => {
      expect(publishCalls).toBe(1);
      expect(receivedPayload).toBe("test data");
    });
  });

  describe("when receiving an valid window message from the host application", () => {
    let publishCalls = 0;
    let receivedPayload: string;
    beforeEach(() => {
      client.start();
      client.messaging.addListener("test.topic", (data: Publication) => {
        publishCalls++;
        receivedPayload = data.payload;
      });
      mockGlobalScope.trigger("message", {
        data: {
          msgType: "publish",
          msg: {
            topic: "test.topic",
            payload: "test data",
          },
          direction: "HostToClient",
        },
      });
    });

    test("should raise a publish event for the topic", () => {
      expect(publishCalls).toBe(1);
      expect(receivedPayload).toBe("test data");
    });
  });

  describe("when client requests to navigate to a new page", () => {
    beforeEach(() => {
      client.requestNavigation({ url: "http://www.example.com/" });
    });

    test("should notify host of navigation request", () => {
      expect(client._postMessage).toHaveBeenCalledWith(
        applyClientProtocol({
          msgType: "navRequest",
          msg: { url: "http://www.example.com/", history: undefined },
        }),
      );
    });
  });
});
