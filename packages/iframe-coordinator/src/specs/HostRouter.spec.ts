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
    it("should append the path under the primary route to the client URL", () => {
      const clientInfo = hostRouter.getClientTarget("route/one/foo/bar");
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe("http://example.com/#/test/one/foo/bar");
      expect(clientInfo.id).toBe("route1");
    });

    it("should ignore leading and trailing slashes on the client's assigned route", () => {
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

    it("should ignore leading slashes on the provided route", () => {
      const clientInfo = hostRouter.getClientTarget("/route/one/foo/bar");
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe("http://example.com/#/test/one/foo/bar");
      expect(clientInfo.id).toBe("route1");
    });

    it("should preserve trailing slashes on the provided route", () => {
      const clientInfo = hostRouter.getClientTarget("/route/one/foo/bar/");
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe("http://example.com/#/test/one/foo/bar/");
      expect(clientInfo.id).toBe("route1");
    });

    it("should append to the path when the client url has no hash", () => {
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

    it('should return "allow" and "sandbox" config options if they exist', () => {
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

    it("should return route with more specificity", () => {
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
  });
});
