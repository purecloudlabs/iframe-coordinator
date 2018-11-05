import * as hostRouterInjector from 'inject-loader!../HostRouter';
import { HostRouter } from '../HostRouter';
import { LabeledPublication } from '../messages/Publication';

describe('HostRouter', () => {
  let mocks: any;
  let hostRouter: HostRouter;
  beforeEach(() => {
    /* tslint:disable */
    mocks = {};
    mocks.ifcFrameObj = {
      handlers: {},
      addEventListener: jasmine
        .createSpy('xifcAddEventListener')
        .and.callFake((topic: string, handler: (data: any) => void) => {
          mocks.ifcFrameObj.handlers[topic] = handler;
        }),
      raise(topic: string, data: any) {
        mocks.ifcFrameObj.handlers[topic](data);
      },
      setAttribute: jasmine.createSpy('xifcSetAttribute'),
      send: jasmine.createSpy('xifcSend')
    };
    mocks.ifcFrame = {
      default: jasmine
        .createSpy('xifcConstructor')
        .and.returnValue(mocks.ifcFrameObj)
    };
    mocks.node = {
      appendChild: jasmine.createSpy('nodeAppendChild')
    };

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

  it('should create a new x-ifc-frame', () => {
    expect(mocks.ifcFrame.default).toHaveBeenCalled();
  });

  it('should add the ifc-frame to the target node', () => {
    expect(mocks.node.appendChild).toHaveBeenCalledWith(mocks.ifcFrameObj);
  });

  describe('when publishing a generic message to the client', () => {
    const message: LabeledPublication = {
      msgType: 'publish',
      msg: {
        topic: 'test.topic',
        payload: 'test.data'
      }
    };
    beforeEach(() => {
      hostRouter.publishGenericMessage(message);
    });

    it('shoud send the message to the client', () => {
      expect(mocks.ifcFrameObj.send).toHaveBeenCalledWith(message);
    });
  });

  describe('when client is sending message to host', () => {
    describe('when the message is a publish message', () => {
      describe('if we are interested in the publication topic', () => {
        let handlerData: LabeledMsg;
        const incomingMessage = {
          msgType: 'publish',
          msg: {
            topic: 'test.topic',
            payload: 'test.payload'
          }
        };
        beforeEach(() => {
          hostRouter.subscribeToMessages('test.topic');
          hostRouter.onSendToHost(data => {
            handlerData = data;
          });
          mocks.ifcFrameObj.raise('clientMessage', {
            detail: incomingMessage
          });
        });

        it('should route the message to the host', () => {
          expect(handlerData).toEqual(incomingMessage);
        });
      });

      describe('if we are not interested in the publication topic', () => {
        let handlerData: LabeledMsg;
        const incomingMessage = {
          msgType: 'publish',
          msg: {
            topic: 'test.topic',
            payload: 'test.payload'
          }
        };
        beforeEach(() => {
          hostRouter.onSendToHost(data => {
            handlerData = data;
          });
          mocks.ifcFrameObj.raise('clientMessage', {
            detail: incomingMessage
          });
        });

        it('should route the message to the host', () => {
          expect(handlerData).toBeUndefined();
        });
      });
    });

    describe('when the message is invalid', () => {
      let handlerData: LabeledMsg;
      const incomingMessage = {
        msgType: 'toastRequest',
        msg: {
          topic: 'test.topic',
          payload: 'test.payload'
        }
      };
      beforeEach(() => {
        hostRouter.onSendToHost(data => {
          handlerData = data;
        });
        mocks.ifcFrameObj.raise('clientMessage', {
          detail: incomingMessage
        });
      });

      it('should not route the message to the host', () => {
        expect(handlerData).toBeUndefined();
      });
    });
  });

  describe('when the route is changing', () => {
    beforeEach(() => {
      hostRouter.changeRoute('route/one');
    });

    it('should update the frame source location', () => {
      expect(mocks.ifcFrameObj.setAttribute).toHaveBeenCalledWith(
        'src',
        '/test/one'
      );
    });
  });
});
