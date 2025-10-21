import { describe, expect, test, beforeEach } from "vitest";

import { HostRouter } from "../HostRouter";

describe("HostRouter", () => {
  let hostRouter: HostRouter;
  const clientUrl = "http://example.com/#/test/one";
  beforeEach(() => {
    hostRouter = new HostRouter({
      route1: {
        url: clientUrl,
        assignedRoute: "route/one/",
      },
      withRouteSlashes: {
        url: clientUrl,
        assignedRoute: "/leading/and/trailing/",
      },
      noClientHash: {
        url: "http://example.com/my/pushstate/app/?query=works",
        assignedRoute: "noHash",
      },
      withSandboxAndAllow: {
        url: clientUrl,
        assignedRoute: "route/two",
        sandbox: "allow-scripts",
        allow: "microphone *; camera *;",
      },
      withMoreSpecificity: {
        url: clientUrl + "/specific",
        assignedRoute: "route/one/specific",
      },
    });
  });

  describe("when generating client URLs", () => {
    test("should append the path under the primary route to the client URL", () => {
      const clientInfo = hostRouter.getClientTarget("route/one/foo/bar");
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe("http://example.com/#/test/one/foo/bar");
      expect(clientInfo.id).toBe("route1");
    });

    test("should ignore leading and trailing slashes on the client's assigned route", () => {
      const clientInfo = hostRouter.getClientTarget(
        "leading/and/trailing/foo/bar",
      );
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe("http://example.com/#/test/one/foo/bar");
      expect(clientInfo.id).toBe("withRouteSlashes");
    });

    test("should ignore leading slashes on the provided route", () => {
      const clientInfo = hostRouter.getClientTarget("/route/one/foo/bar");
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe("http://example.com/#/test/one/foo/bar");
      expect(clientInfo.id).toBe("route1");
    });

    test("should preserve trailing slashes on the provided route", () => {
      const clientInfo = hostRouter.getClientTarget("/route/one/foo/bar/");
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe("http://example.com/#/test/one/foo/bar/");
      expect(clientInfo.id).toBe("route1");
    });

    test("should append to the path when the client url has no hash", () => {
      const clientInfo = hostRouter.getClientTarget("noHash/foo/bar");
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe(
        "http://example.com/my/pushstate/app/foo/bar?query=works",
      );
      expect(clientInfo.id).toBe("noClientHash");
    });

    test('should return "allow" and "sandbox" config options if they exist', () => {
      const clientInfo = hostRouter.getClientTarget("route/two/");
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe("http://example.com/#/test/one/");
      expect(clientInfo.id).toBe("withSandboxAndAllow");
      expect(clientInfo.sandbox).toBe("allow-scripts");
      expect(clientInfo.allow).toBe("microphone *; camera *;");
    });

    test("should return route with more specificity", () => {
      const clientInfo = hostRouter.getClientTarget("route/one/specific/route");
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe(
        "http://example.com/#/test/one/specific/route",
      );
      expect(clientInfo.id).toBe("withMoreSpecificity");
    });

    test("should resolve same-prefix routes by specificity regardless of order", () => {
      hostRouter = new HostRouter({
        lessSpecific: {
          assignedRoute: "assigned/route/",
          url: "about:blank",
        },
        moreSpecific: {
          assignedRoute: "assigned/route-modified/",
          url: "about:blank",
        },
      });
      let clientInfo = hostRouter.getClientTarget(
        "assigned/route-modified/sub-route",
      );
      expect(clientInfo?.id).toBe("moreSpecific");

      hostRouter = new HostRouter({
        moreSpecific: {
          assignedRoute: "assigned/route-modified/",
          url: "about:blank",
        },
        lessSpecific: {
          assignedRoute: "assigned/route/",
          url: "about:blank",
        },
      });
      clientInfo = hostRouter.getClientTarget(
        "assigned/route-modified/sub-route",
      );
      expect(clientInfo?.id).toBe("moreSpecific");
    });
  });
});
