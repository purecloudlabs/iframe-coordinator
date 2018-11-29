import { HostRouter } from '../HostRouter';

describe('HostRouter', () => {
  let hostRouter: HostRouter;
  const clientUrl = 'http://example.com/#/test/one';
  beforeEach(() => {
    hostRouter = new HostRouter({
      route1: {
        url: clientUrl,
        assignedRoute: 'route/one'
      },
      withRouteSlashes: {
        url: clientUrl,
        assignedRoute: '/leading/and/trailing/'
      },
      noClientHash: {
        url: 'http://example.com/my/pushstate/app/?query=works',
        assignedRoute: 'noHash'
      }
    });
  });

  describe('when generating client URLs', () => {
    it('should append the path under the primary route to the client URL', () => {
      const clientInfo = hostRouter.getClientInfo('route/one/foo/bar');
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe('http://example.com/#/test/one/foo/bar');
      expect(clientInfo.id).toBe('route1');
    });

    it("should ignore leading and trailing slashes on the client's assigned route", () => {
      const clientInfo = hostRouter.getClientInfo(
        'leading/and/trailing/foo/bar'
      );
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe('http://example.com/#/test/one/foo/bar');
      expect(clientInfo.id).toBe('withRouteSlashes');
    });

    it('should ignore leading slashes on the provided route', () => {
      const clientInfo = hostRouter.getClientInfo('/route/one/foo/bar');
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe('http://example.com/#/test/one/foo/bar');
      expect(clientInfo.id).toBe('route1');
    });

    it('should preserve trailing slashes on the provided route', () => {
      const clientInfo = hostRouter.getClientInfo('/route/one/foo/bar/');
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe('http://example.com/#/test/one/foo/bar/');
      expect(clientInfo.id).toBe('route1');
    });

    it('should append to the path when the client url has no hash', () => {
      const clientInfo = hostRouter.getClientInfo('noHash/foo/bar');
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe(
        'http://example.com/my/pushstate/app/foo/bar?query=works'
      );
      expect(clientInfo.id).toBe('noClientHash');
    });
  });
});
