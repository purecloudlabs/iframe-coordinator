import * as hostRouterInjector from 'inject-loader!../HostRouter';
import { HostRouter } from '../HostRouter';

describe('HostRouter', () => {
  let mocks: any;
  let hostRouter: HostRouter;
  beforeEach(() => {
    mocks = {
      ifcFrame: {
        default: class MockIFCFrame {
          public setAttribute() {
            // Empty
          }

          public addEventListener() {
            // Empty
          }
        }
      },
      node: {
        appendChild: () => {
          // Empty
        }
      }
    };
    /* tslint:disable */
    const HostRouter = hostRouterInjector({
      './elements/x-ifc-frame': mocks.ifcFrame
    }).HostRouter;
    /* tslint:enable */

    hostRouter = new HostRouter({
      node: mocks.node,
      routingMap: {
        route1: {
          url: '/test/one',
          assignedRoute: 'route/one'
        }
      }
    });
  });

  it('should create host routers', () => {
    expect(hostRouter).not.toBe(undefined);
  });
});
