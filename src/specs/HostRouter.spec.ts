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
      expect(hostRouter.getClientUrl('route/one/foo/bar')).toBe(
        'http://example.com/#/test/one/foo/bar'
      );
    });

    it("should ignore leading and trailing slashes on the client's assigned route", () => {
      expect(hostRouter.getClientUrl('leading/and/trailing/foo/bar')).toBe(
        'http://example.com/#/test/one/foo/bar'
      );
    });

    it('should ignore leading slashes on the provided route', () => {
      expect(hostRouter.getClientUrl('/route/one/foo/bar')).toBe(
        'http://example.com/#/test/one/foo/bar'
      );
    });

    it('should preserve trailing slashes on the provided route', () => {
      expect(hostRouter.getClientUrl('/route/one/foo/bar/')).toBe(
        'http://example.com/#/test/one/foo/bar/'
      );
    });

    it('should append to the path when the client url has no hash', () => {
      expect(hostRouter.getClientUrl('noHash/foo/bar')).toBe(
        'http://example.com/my/pushstate/app/foo/bar?query=works'
      );
    });
  });
});
