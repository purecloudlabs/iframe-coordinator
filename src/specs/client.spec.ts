import { Client } from '../client';
import { EnvData } from '../messages/Lifecycle';
import { Publication } from '../messages/Publication';

describe('client', () => {
  let client: any;
  let mockFrameWindow: any;

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

    client = new Client({
      hostOrigin: 'https://example.com'
    });
    client._clientWindow = mockFrameWindow;
  });

  describe('when the client is started', () => {
    beforeEach(() => {
      client.start();
    });

    it('should send a client_started notification', () => {
      expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
        {
          msgType: 'client_started',
          msg: undefined
        },
        'https://example.com'
      );
    });
  });

  describe('when an initial data environment is recieved', () => {
    let recievedEnvData: EnvData;

    const testEnvironmentData: EnvData = {
      locale: 'nl-NL',
      hostRootUrl: 'http://example.com/',
      filteredTopics: new Map(),
      custom: undefined
    };
    beforeEach(() => {
      client.addListener('environmentalData', (env: EnvData) => {
        recievedEnvData = env;
      });
      client.start();

      mockFrameWindow.trigger('message', {
        origin: 'origin',
        data: {
          msgType: 'env_init',
          msg: testEnvironmentData
        }
      });
    });

    it('should delegate', () => {
      expect(recievedEnvData).toEqual(testEnvironmentData);
    });
  });

  describe('when client requests a toast notification', () => {
    beforeEach(() => {
      client.start();
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
          'https://example.com'
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
          'https://example.com'
        );
      });
    });
  });

  describe('when publishing a new message', () => {
    beforeEach(() => {
      client.start();
      client.publish({ topic: 'test.topic', payload: 'custom data' });
    });

    it('should notify worker of new publication', () => {
      expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
        {
          msgType: 'publish',
          msg: {
            topic: 'test.topic',
            payload: 'custom data',
            clientId: undefined
          }
        },
        'https://example.com'
      );
    });
  });

  describe('when recieving an invalid window message from the host application', () => {
    let subscriptionCalled = false;
    beforeEach(() => {
      client.start();
      client.messaging.addListener('origin', () => (subscriptionCalled = true));
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
    let recievedPayload: string;
    beforeEach(() => {
      client.start();
      client.messaging.addListener('test.topic', (data: Publication) => {
        publishCalls++;
        recievedPayload = data.payload;
      });
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
      expect(recievedPayload).toBe('test data');
    });
  });

  describe('when window has a key event', () => {
    beforeEach(() => {
      const dataMap = new Map();
      dataMap.set('keydown.topic', {
        filters: [
          {
            property: 'altKey',
            comparison: 0,
            expected: 'false'
          }
        ],
        junction: 'and'
      });

      const testEnvironmentData: EnvData = {
        locale: 'nl-NL',
        hostRootUrl: 'http://example.com/',
        filteredTopics: dataMap,
        custom: undefined
      };

      client.start();

      mockFrameWindow.trigger('message', {
        origin: 'origin',
        data: {
          msgType: 'env_init',
          msg: testEnvironmentData
        }
      });
    });

    describe('when invalid key is encountered', () => {
      beforeEach(() => {
        mockFrameWindow.parent.postMessage.calls.reset();

        mockFrameWindow.trigger('keydown', {
          code: 'KeyA',
          key: 'A',
          keyCode: 65,
          altKey: true,
          ctrlKey: false,
          metaKey: false
        });
      });

      it('should not raise the event', () => {
        expect(mockFrameWindow.parent.postMessage).not.toHaveBeenCalled();
      });
    });

    describe('when valid key is encountered', () => {
      beforeEach(() => {
        mockFrameWindow.trigger('keydown', {
          code: 'KeyA',
          key: 'A',
          keyCode: 65,
          altKey: false,
          ctrlKey: false,
          metaKey: false
        });
      });

      it('should publish a key event', () => {
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          {
            msgType: 'publish',
            msg: {
              topic: 'keydown.topic',
              payload: {
                code: 'KeyA',
                key: 'A',
                keyCode: 65,
                altKey: false,
                ctrlKey: false,
                metaKey: false
              },
              clientId: undefined
            }
          },
          'https://example.com'
        );
      });
    });
  });

  describe('when window has a click event', () => {
    let mockElement;
    describe('when click event target is an anchor', () => {
      beforeEach(() => {
        client.start();
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
          'https://example.com'
        );
      });
    });

    describe('when click event target is not an anchor', () => {
      beforeEach(() => {
        client.start();
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

    describe('when the client is created without a specific host origin', () => {
      it("sends messages to it's own origin", () => {
        client = new Client();
        client._clientWindow = mockFrameWindow;
        client.start();
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          {
            msgType: 'client_started',
            msg: undefined
          },
          window.origin
        );
      });
    });
  });
});
