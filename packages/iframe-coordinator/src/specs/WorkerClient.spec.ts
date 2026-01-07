import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { WorkerClient } from "../WorkerClient";
import { applyClientProtocol } from "../messages/LabeledMsg";

describe("WorkerClient", () => {
  let workerClient: WorkerClient;
  let mockPostMessage = vi.fn();
  beforeAll(() => {
    vi.stubGlobal("postMessage", mockPostMessage);
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });
  beforeEach(() => {
    workerClient = new WorkerClient();
    mockPostMessage.mockReset();
  });

  test("publishes to the host by calling `postMessage` on the global scope", () => {
    workerClient.publish({ topic: "test.topic", payload: {} });
    expect(mockPostMessage).toHaveBeenCalledWith(
      applyClientProtocol({
        msgType: "publish",
        msg: {
          topic: "test.topic",
          payload: {},
        },
      }),
    );
  });
});
