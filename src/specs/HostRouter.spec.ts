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
      },
      routeWithFilter: {
        url: clientUrl,
        assignedRoute: 'route/filter',
        filteredTopics: {
          'keydown.topic': {
            filters: [
              {
                property: 'altKeyPressed',
                comparison: 0,
                expected: 'false'
              }
            ],
            junction: 'and'
          }
        }
      }
    });
  });

  describe('when generating client URLs', () => {
    it('should append the path under the primary route to the client URL', () => {
      const clientInfo = hostRouter.getClientTarget('route/one/foo/bar');
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe('http://example.com/#/test/one/foo/bar');
      expect(clientInfo.id).toBe('route1');
    });

    it("should ignore leading and trailing slashes on the client's assigned route", () => {
      const clientInfo = hostRouter.getClientTarget(
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
      const clientInfo = hostRouter.getClientTarget('/route/one/foo/bar');
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe('http://example.com/#/test/one/foo/bar');
      expect(clientInfo.id).toBe('route1');
    });

    it('should preserve trailing slashes on the provided route', () => {
      const clientInfo = hostRouter.getClientTarget('/route/one/foo/bar/');
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe('http://example.com/#/test/one/foo/bar/');
      expect(clientInfo.id).toBe('route1');
    });

    it('should append to the path when the client url has no hash', () => {
      const clientInfo = hostRouter.getClientTarget('noHash/foo/bar');
      if (!clientInfo) {
        fail();
        return;
      }
      expect(clientInfo.url).toBe(
        'http://example.com/my/pushstate/app/foo/bar?query=works'
      );
      expect(clientInfo.id).toBe('noClientHash');
    });

    it('should convert any filtered topics', () => {
      const clientInfo = hostRouter.getClientTarget('route/filter');
      if (!clientInfo || !clientInfo.filteredTopics) {
        fail();
        return;
      }

      const filter = clientInfo.filteredTopics.get('keydown.topic');

      if (!filter) {
        fail();
        return;
      }
    });
  });
});
