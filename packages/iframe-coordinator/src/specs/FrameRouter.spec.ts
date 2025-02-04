import { FrameRouterElement } from "../host";

const ENV_DATA = {
  locale: "en-us",
  hostRootUrl: "https://example.com/root/",
};

const ENV_DATA_WITH_HASH = {
  ...ENV_DATA,
  hostRootUrl: "https://example.com/root/#/",
};

const ENV_DATA_WITH_QUERY = {
  ...ENV_DATA,
  hostRootUrl: "https://example.com/root/?foo=bar",
};

const ENV_DATA_WITH_QUERY_AND_HASH = {
  ...ENV_DATA,
  hostRootUrl: "https://example.com/root/?foo=bar#/",
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
    it("Removes a trailing slash on the host URL if present with no hash", () => {
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

    it("Removes trailing slash from pathname when the provided host URL with query params; urlObject and location have no hash", () => {
      const router = new FrameRouterElement();
      router.clientConfig = {
        clients: {},
        envData: ENV_DATA_WITH_QUERY,
      };
      //@ts-ignore
      expect(router._envData).toEqual({
        ...ENV_DATA_WITH_QUERY,
        hostRootUrl: "https://example.com/root?foo=bar",
      });
    });

    it("Does not add slash between hash and query params if location has hash; urlObject has no hash", () => {
      window.location.hash = "foo";
      const router = new FrameRouterElement();
      router.clientConfig = {
        clients: {},
        envData: ENV_DATA_WITH_QUERY,
      };
      //@ts-ignore
      expect(router._envData).toEqual({
        ...ENV_DATA_WITH_QUERY,
        hostRootUrl: "https://example.com/root/?foo=bar#",
      });
    });

    it("Does not modify provided host URL with query params if urlObject has hash; location hash N/A", () => {
      const router = new FrameRouterElement();
      router.clientConfig = {
        clients: {},
        envData: ENV_DATA_WITH_QUERY_AND_HASH,
      };
      //@ts-ignore
      expect(router._envData).toEqual({
        ...ENV_DATA_WITH_QUERY_AND_HASH,
      });
    });
  });
});
