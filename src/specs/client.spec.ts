import * as ClientInjector from 'inject-loader!../client';
import { EnvData } from '../messages/EnvData';
import { Publication } from '../messages/Publication';

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
      raiseHandler: (data: Publication) => {
        mockSubscriptionManagerObj.handler(data);
      },
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
    let Client = ClientInjector({}).Client;
    /* tslint:enable */

    client = new Client({ clientWindow: mockFrameWindow });
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
    let subscriptionCalled = false;
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.on('origin', () => (subscriptionCalled = true));
      mockFrameWindow.trigger('message', {
        origin: 'origin',
        data: 'test data'
      });
    });

    it('should not notify subscriptions of incoming message', () => {
      expect(subscriptionCalled).toBeFalsy();
    });
  });

  describe('when recieving an valid window message from the host application', () => {
    let publishCalls = 0;
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.on('test.topic', () => publishCalls++);
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

    it('should raise a publish event for the topic', () => {
      expect(publishCalls).toBe(1);
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

  describe('when the host environment data is sent', () => {
    let actualEnvData: EnvData;
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.getEnvData((envData: EnvData) => (actualEnvData = envData));
      mockFrameWindow.trigger('message', {
        origin: 'origin',
        data: {
          msgType: 'envData',
          msg: {
            locale: 'nl-NL'
          }
        }
      });
    });

    it('should update the client env data', () => {
      expect(actualEnvData.locale).toEqual('nl-NL');
    });
  });
});
