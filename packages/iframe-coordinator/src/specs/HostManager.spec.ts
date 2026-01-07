import { describe, expect, test, beforeEach, vi } from "vitest";

import { HostManager } from "../HostManager";
import { applyClientProtocol, applyHostProtocol } from "../messages/LabeledMsg";

const VALID_ORIGIN = "https://valid.example.com";
const BAD_ORIGIN = "https://evil.example.com";
const ENV_DATA = {
  locale: "en-US",
  hostRootUrl: "https://good.example.com/app",
};

class TestHostManager extends HostManager {
  public eventTarget: EventTarget;

  constructor() {
    const eventTarget = {
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      removeEventListener: vi.fn(),
    };
    super(ENV_DATA, eventTarget);
    this.eventTarget = eventTarget;
  }
  public _getClientAssignedRoute = vi.fn();
  public _postMessageToClient = vi.fn();
  protected _expectedClientOrigin(_clientId: String): string {
    return VALID_ORIGIN;
  }
}

const validMessage = {
  origin: VALID_ORIGIN,
  data: applyClientProtocol({
    msgType: "notifyRequest",
    msg: {
      title: undefined,
      message: "Test notification message",
      custom: undefined,
    },
  }),
};

describe("HostManager", () => {
  let hostManager: TestHostManager;
  beforeEach(() => {
    hostManager = new TestHostManager();
  });

  describe("When recieving client messages", () => {
    test("Dispatches valid client messages to it's event target", () => {
      const event = new MessageEvent("message", validMessage);
      hostManager.handleClientMessage(event, "test-client");
      expect(hostManager.eventTarget.dispatchEvent).toHaveBeenCalledWith(
        new CustomEvent(validMessage.data.msgType, {
          detail: validMessage.data.msg,
        }),
      );
    });

    test("Ignores messages from invalid origins", () => {
      const badOriginMsg = { ...validMessage, origin: BAD_ORIGIN };
      const badEvent = new MessageEvent("message", badOriginMsg);
      hostManager.handleClientMessage(badEvent, "test-client");
      expect(hostManager.eventTarget.dispatchEvent).not.toHaveBeenCalled();
    });

    test("Ignores messages with invalid data", () => {
      const event: MessageEvent = new MessageEvent("message", {
        ...validMessage,
        data: "invalid",
      });
      hostManager.handleClientMessage(event, "test-client");
      expect(hostManager.eventTarget.dispatchEvent).not.toHaveBeenCalled();
    });

    test("Ignores HostToClient messages", () => {
      const event = new MessageEvent("message", validMessage);
      event.data.direction = "HostToClient";
      hostManager.handleClientMessage(event, "test-client");
      expect(hostManager.eventTarget.dispatchEvent).not.toHaveBeenCalled();
    });

    test("Ignores messages without the iframe-coordinator protocol", () => {
      const event = new MessageEvent("message", validMessage);
      (event.data.protocol as string) = "unknown protocol";
      hostManager.handleClientMessage(event, "test-client");
      expect(hostManager.eventTarget.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe("When sending messages to clients", () => {
    test("Sends through valid messages", () => {
      let validMessage = {
        msgType: "publish",
        msg: {
          topic: "test.topic",
          payload: {},
        },
      };
      hostManager.sendToClient(validMessage, "test-client");
      expect(hostManager._postMessageToClient).toHaveBeenCalledWith(
        applyHostProtocol(validMessage),
        "test-client",
      );
    });

    test("Throws on invalid messages", () => {
      let invalidMessage = {
        msgType: "publish",
        msg: {
          // topic: "test.topic", <- Missing required field
          payload: {},
        },
      };
      expect(() => {
        hostManager.sendToClient(invalidMessage, "test-client");
      }).toThrow();
    });
  });

  describe("When handling lifecycle events", () => {
    test("Dispatches environment data in response to a client start message", () => {
      const startEvent = new MessageEvent("message", {
        origin: VALID_ORIGIN,
        data: applyClientProtocol({
          msgType: "client_started",
          msg: {},
        }),
      });
      hostManager._getClientAssignedRoute.mockReturnValue("/foo");
      hostManager.handleClientMessage(startEvent, "test-client");
      expect(hostManager._postMessageToClient).toHaveBeenCalledWith(
        applyHostProtocol({
          msgType: "env_init",
          msg: {
            ...ENV_DATA,
            assignedRoute: "/foo",
            registeredKeys: undefined,
            custom: undefined,
          },
        }),
        "test-client",
      );
    });
  });
});
