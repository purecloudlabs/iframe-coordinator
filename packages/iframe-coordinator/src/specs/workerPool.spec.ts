import {
  describe,
  expect,
  test,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";

import { WorkerConfig, WorkerPool } from "../WorkerPool";
import { applyHostProtocol } from "../messages/LabeledMsg";

let workerMap: WorkerMap = {};

class MockWorker {
  public url: string;

  constructor(url: string, { name }: { name: string }) {
    if (url == "invalid-url") {
      throw new Error("INVALID Worker URL!");
    }
    this.url = url;
    workerMap[name] = this;
  }

  terminate = vi.fn();
  addEventListener = vi.fn();
  postMessage = vi.fn();
}

interface WorkerMap {
  [key: string]: MockWorker;
}

const WORKER_CONFIG: WorkerConfig = {
  clients: {
    client1: {
      script: "client1-url",
      app: {
        url: "client1-app",
        assignedRoute: "client1-route",
      },
    },
    client2: {
      script: "client2-url",
      app: {
        url: "client2-app",
        assignedRoute: "client2-route",
      },
    },
  },
  envData: {
    locale: "en-us",
    hostRootUrl: "https://good.example.com",
  },
};

describe("WorkerPool", () => {
  beforeAll(() => {
    vi.stubGlobal("Worker", MockWorker);
  });
  beforeEach(() => {
    workerMap = {};
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  test("Starts configured workers and listens for events when started", () => {
    const workerPool = new WorkerPool();
    workerPool.workerConfig = WORKER_CONFIG;
    expect(workerMap).toEqual({});
    expect(workerPool.isRunning).toBe(false);
    workerPool.start();
    expect(workerPool.isRunning).toBe(true);
    expect(workerMap["worker.client1"].addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
    expect(workerMap["worker.client2"].addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
  });

  test("Will start valid workers if one worker fails", () => {
    const workerPool = new WorkerPool();
    workerPool.workerConfig = {
      ...WORKER_CONFIG,
      clients: {
        client1: {
          script: "client1-url",
          app: {
            url: "client1-app",
            assignedRoute: "client1-route",
          },
        },
        client2: {
          script: "invalid-url",
          app: {
            url: "client2-app",
            assignedRoute: "client2-route",
          },
        },
        client3: {
          script: "client3-url",
          app: {
            url: "client3-app",
            assignedRoute: "client3-route",
          },
        },
      },
    };
    workerPool.start();
    expect(workerMap["worker.client2"]).toBeUndefined();
    expect(workerMap["worker.client1"].addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
    expect(workerMap["worker.client3"].addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
  });

  test("Throws if worker config is changed after starting", () => {
    const workerPool = new WorkerPool();
    workerPool.workerConfig = WORKER_CONFIG;
    workerPool.start();
    expect(() => {
      workerPool.workerConfig = { ...WORKER_CONFIG };
    }).toThrow();
  });

  test("Will publish messages to client workers", () => {
    const publishMessage = { topic: "test.topic", payload: "test.payload" };
    const workerPool = new WorkerPool();
    workerPool.workerConfig = WORKER_CONFIG;
    workerPool.start();
    workerPool.publish("client1", publishMessage);
    expect(workerMap["worker.client1"].postMessage).toHaveBeenCalledWith(
      applyHostProtocol({ msgType: "publish", msg: publishMessage}),
    );
  });

  test("Terminates workers when stopped", () => {
    const workerPool = new WorkerPool();
    workerPool.workerConfig = WORKER_CONFIG;
    workerPool.start();
    workerPool.stop();
    expect(workerMap["worker.client1"].terminate).toHaveBeenCalled();
    expect(workerMap["worker.client2"].terminate).toHaveBeenCalled();
  });
});
