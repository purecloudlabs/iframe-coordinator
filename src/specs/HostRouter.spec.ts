import * as hostRouterInjector from 'inject-loader!../HostRouter';
import { HostRouter } from '../HostRouter';

describe('HostRouter', () => {
  let mocks: any;
  let hostRouter: HostRouter;
  beforeEach(() => {
    hostRouter = new HostRouter({
      route1: {
        url: 'http://example.com/#/test/one',
        assignedRoute: 'route/one'
      }
    });
  });

  describe('when generating client URLs', () => {
    it('should append the path under the primary route to the client URL', () => {
      expect(hostRouter.getClientUrl('route/one/foo/bar')).toBe(
        'http://example.com/#/test/one/foo/bar'
      );
    });
  });
});
