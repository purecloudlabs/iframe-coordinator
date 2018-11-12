import * as ClientInjector from 'inject-loader!../client';
import { EnvData } from '../messages/EnvData';

describe('client', () => {
  let client: any;
  let mockFrameWindow: any;
  let mockSubscriptionManagerObj: any;

  beforeEach(() => {
    mockFrameWindow = {
      eventHandlers: {},
      trigger: (eventId: string, eventData: any) => {
        mockFrameWindow.eventHandlers[eventId](eventData);
      },
      addEventListener: (eventId: string, handler: () => void) => {
        mockFrameWindow.eventHandlers[eventId] = handler;
      },
      removeEventListener: (eventId: string) => {
        delete mockFrameWindow.eventHandlers[eventId];
      },
      parent: {
        postMessage: jasmine.createSpy('window.parent.postMessage')
      }
    };

    mockSubscriptionManagerObj = {
      subscribe: jasmine.createSpy('subscribe'),
      unsubscribe: jasmine.createSpy('unsubscribe'),
      setHandler: jasmine
        .createSpy('setHandler')
        .and.callFake((handler: any) => {
          mockSubscriptionManagerObj.handler = handler;
        }),
      dispatchMessage: jasmine.createSpy('dispatchMessage')
    };

    /* tslint:disable */
    const mockSubscriptionManager = function() {
      return mockSubscriptionManagerObj;
    };
    /* tslint:enable */

    const mockSubscriptionManagerImport = {
      SubscriptionManager: mockSubscriptionManager
    };

    /* tslint:disable */
    let Client = ClientInjector({
      './SubscriptionManager': mockSubscriptionManagerImport
    }).Client;
    /* tslint:enable */

    client = new Client({ clientWindow: mockFrameWindow });
  });

  describe('when the client is started', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
    });

    it('should send a loaded lifecycle notification', () => {
      expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
        {
          msgType: 'lifecycle',
          msg: {
            stage: 'started',
            data: undefined
          }
        },
        '*'
      );
    });
  });

  describe('when the client is stopped', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      mockFrameWindow.parent.postMessage.calls.reset();
      client.stop();
    });

    it('should send a loaded lifecycle notification', () => {
      expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
        {
          msgType: 'lifecycle',
          msg: {
            stage: 'stopped',
            data: undefined
          }
        },
        '*'
      );
    });
  });

  describe('when an initial data lifecycle is recieved', () => {
    beforeEach(() => {
      mockFrameWindow.trigger('message', {
        origin: 'origin',
        data: {
          msgType: 'lifecycle',
          msg: {
            stage: 'init',
            data: 'test data'
          }
        }
      });
    });
  });

  describe('when client requests a toast notification', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
    });

    describe('with only a message', () => {
      beforeEach(() => {
        client.requestToast({ message: 'Test notification message' });
      });

      it('should send a message to the worker', () => {
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          {
            msgType: 'toastRequest',
            msg: {
              title: undefined,
              message: 'Test notification message',
              custom: undefined
            }
          },
          '*'
        );
      });
    });

    describe('with message and extra data', () => {
      beforeEach(() => {
        client.requestToast({
          title: 'Test title',
          message: 'Test notification message',
          custom: { data: 'test data' }
        });
      });

      it('should send a message to the worker', () => {
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          {
            msgType: 'toastRequest',
            msg: {
              title: 'Test title',
              message: 'Test notification message',
              custom: { data: 'test data' }
            }
          },
          '*'
        );
      });
    });
  });

  describe('when subscribing to the client', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.subscribe('test.topic');
    });

    it('should notify worker of subscription', () => {
      expect(mockSubscriptionManagerObj.subscribe).toHaveBeenCalledWith(
        'test.topic'
      );
    });
  });

  describe('when unsubscribing to the client', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.unsubscribe('test.topic');
    });

    it('should notify worker of unsubscription', () => {
      expect(mockSubscriptionManagerObj.unsubscribe).toHaveBeenCalledWith(
        'test.topic'
      );
    });
  });

  describe('when publishing a new message', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.publish({ topic: 'test.topic', payload: 'custom data' });
    });

    it('should notify worker of new publication', () => {
      expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
        {
          msgType: 'publish',
          msg: {
            topic: 'test.topic',
            payload: 'custom data'
          }
        },
        '*'
      );
    });
  });

  describe('when recieving an invalid window message from the host application', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      mockFrameWindow.trigger('message', {
        origin: 'origin',
        data: 'test data'
      });
    });

    it('should not notify subscriptions of incoming message', () => {
      expect(mockSubscriptionManagerObj.dispatchMessage).not.toHaveBeenCalled();
    });
  });

  describe('when recieving an valid window message from the host application', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      mockFrameWindow.trigger('message', {
        origin: 'origin',
        data: {
          msgType: 'publish',
          msg: {
            topic: 'test.topic',
            payload: 'test data'
          }
        }
      });
    });

    it('should notify subscriptions of incoming message', () => {
      expect(mockSubscriptionManagerObj.dispatchMessage).toHaveBeenCalledWith({
        topic: 'test.topic',
        payload: 'test data'
      });
    });
  });

  describe('when client is listening to published messages', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.onPubsub((data: any) => {
        // TODO Empty
      });
    });

    it('should set the handlers of the subscription manager', () => {
      expect(mockSubscriptionManagerObj.setHandler).toHaveBeenCalled();
    });
  });

  describe('when window has a click event', () => {
    let mockElement;
    describe('when click event target is an anchor', () => {
      beforeEach(() => {
        client.start(mockFrameWindow);
        mockElement = document.createElement('a');
        mockElement.setAttribute('href', 'http://www.example.com/');
        mockFrameWindow.trigger('click', {
          target: mockElement,
          button: 0,
          preventDefault: () => {
            // Doesn't need to do anything
          }
        });
      });

      it('should notify worker of navigation request', () => {
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          {
            msgType: 'navRequest',
            msg: { url: 'http://www.example.com/' }
          },
          '*'
        );
      });
    });

    describe('when click event target is not an anchor', () => {
      beforeEach(() => {
        client.start(mockFrameWindow);
        mockFrameWindow.parent.postMessage.calls.reset();
        mockElement = document.createElement('div');
        mockFrameWindow.trigger('click', {
          target: mockElement,
          button: 0,
          preventDefault: () => {
            // Doesn't need to do anything
          }
        });
      });

      it('should not notify worker of navigation request', () => {
        expect(mockFrameWindow.parent.postMessage).not.toHaveBeenCalled();
      });
    });
  });
});
