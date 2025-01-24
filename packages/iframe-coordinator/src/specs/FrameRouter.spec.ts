import { FrameRouterElement } from "../host";

const ENV_DATA = {
  locale: "en-us",
  hostRootUrl: "https://example.com/root/",
};

const ENV_DATA_WITH_HASH = {
  ...ENV_DATA,
  hostRootUrl: "https://example.com/root/#/",
};

describe("The frame router element", () => {
  beforeAll(() => {
    window.customElements.define("frame-router", FrameRouterElement);
  });

  beforeEach(() => {
    // Reset window hash state
    window.location.hash = "";
  });

  /* NOTE: This behavior is inconsistent in practice and needs to be reworked.
   * For now, these tests prevent regressions against the current inconsistent
   * behavior.
   */
  describe("Host URL management", () => {
    it("Removes a trailing slash on the host URL if present", () => {
      const router = new FrameRouterElement();
      router.clientConfig = {
        clients: {},
        envData: ENV_DATA,
      };
      //@ts-ignore
      expect(router._envData).toEqual({
        ...ENV_DATA,
        hostRootUrl: "https://example.com/root",
      });
    });

    it("Adds a fragment to the tracked host URL if one is present on window but not on the provided root URL", () => {
      window.location.hash = "foo";
      const router = new FrameRouterElement();
      router.clientConfig = {
        clients: {},
        envData: ENV_DATA,
      };
      //@ts-ignore
      expect(router._envData).toEqual({
        ...ENV_DATA,
        hostRootUrl: "https://example.com/root/#",
      });
    });

    it("Does not modify the provided host URL if it and the current location have a fragment", () => {
      window.location.hash = "foo";
      const router = new FrameRouterElement();
      router.clientConfig = {
        clients: {},
        envData: ENV_DATA_WITH_HASH,
      };
      //@ts-ignore
      expect(router._envData).toEqual({
        ...ENV_DATA_WITH_HASH,
      });
    });

    // TODO: Test expected query behavior here
  });
});
