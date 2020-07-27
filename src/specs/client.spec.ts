import { Client } from '../client';
import {
  API_PROTOCOL,
  applyClientProtocol,
  LabeledMsg,
  PartialMsg
} from '../messages/LabeledMsg';
import { EnvData, SetupData } from '../messages/Lifecycle';
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
        applyClientProtocol({
          msgType: 'client_started',
          msg: undefined
        }),
        'https://example.com'
      );
    });
  });

  describe('when an initial data environment is recieved', () => {
    let recievedEnvData: EnvData;

    const testEnvironmentData: SetupData = {
      locale: 'nl-NL',
      hostRootUrl: 'http://example.com/',
      registeredKeys: [],
      custom: undefined,
      assignedRoute: 'app1'
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
      const { assignedRoute, ...restEnvData } = testEnvironmentData;
      expect(recievedEnvData).toEqual(restEnvData);
    });

    describe('access host URL', () => {
      it('should be able to access host url', () => {
        const hostUrl = client.asHostUrl('client/route');
        expect(hostUrl).toEqual('http://example.com/app1/client/route');
      });

      it('should ignore client route leading splash and hash tag', () => {
        let hostUrl = client.asHostUrl('/client/route');
        expect(hostUrl).toEqual('http://example.com/app1/client/route');
        hostUrl = client.asHostUrl('#/client/route');
        expect(hostUrl).toEqual('http://example.com/app1/client/route');
        hostUrl = client.asHostUrl('/#/client/route');
        expect(hostUrl).toEqual('http://example.com/app1/client/route');
      });
      it('should keep query strings', () => {
        const hostUrl = client.asHostUrl('/#/client/route?foo=bar');
        expect(hostUrl).toEqual('http://example.com/app1/client/route?foo=bar');
      });
    });
  });

  describe('when client requests a toast notification', () => {
    beforeEach(() => {
      client.start();
    });

    describe('with only a message', () => {
      beforeEach(() => {
        client.requestNotification({ message: 'Test notification message' });
      });

      it('should send a message to the worker', () => {
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          applyClientProtocol({
            msgType: 'notifyRequest',
            msg: {
              title: undefined,
              message: 'Test notification message',
              custom: undefined
            }
          }),
          'https://example.com'
        );
      });
    });

    describe('with message and extra data', () => {
      beforeEach(() => {
        client.requestNotification({
          title: 'Test title',
          message: 'Test notification message',
          custom: { data: 'test data' }
        });
      });

      it('should send a message to the worker', () => {
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          applyClientProtocol({
            msgType: 'notifyRequest',
            msg: {
              title: 'Test title',
              message: 'Test notification message',
              custom: { data: 'test data' }
            }
          }),
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
        applyClientProtocol({
          msgType: 'publish',
          msg: {
            topic: 'test.topic',
            payload: 'custom data',
            clientId: undefined
          }
        }),
        'https://example.com'
      );
    });
  });

  describe('when listening for messages from the host application', () => {
    let subscriptionCalled = false;
    beforeEach(() => {
      subscriptionCalled = false;
      client.start();
      client.messaging.addListener('origin', () => (subscriptionCalled = true));
    });

    it('should throw an exception on invalid iframe-coordinator message', () => {
      expect(() => {
        mockFrameWindow.trigger('message', {
          origin: 'origin',
          data: {
            protocol: API_PROTOCOL,
            msgType: 'test data',
            msg: 'msg',
            direction: 'HostToClient'
          }
        });
      }).toThrowMatching(err => {
        return err.message.startsWith(
          'I recieved an invalid message from the host application'
        );
      });
      expect(subscriptionCalled).toBe(false);
    });

    it('should throw an exception on invalid iframe-coordinator message with no direction', () => {
      expect(() => {
        mockFrameWindow.trigger('message', {
          origin: 'origin',
          data: {
            protocol: API_PROTOCOL,
            msgType: 'test data',
            msg: 'msg'
          }
        });
      }).toThrowMatching(err => {
        return err.message.startsWith(
          'I recieved an invalid message from the host application'
        );
      });
      expect(subscriptionCalled).toBe(false);
    });

    it('should not throw an exception if not from iframe-coordinator', () => {
      expect(() => {
        mockFrameWindow.trigger('message', {
          protocol: 'whatev',
          origin: 'origin',
          data: {
            protocol: 'whatev',
            msgType: 'test data',
            msg: 'msg'
          }
        });
      }).not.toThrow();
      expect(subscriptionCalled).toBe(false);
    });

    it('should ignore messages from client applications', () => {
      expect(() => {
        mockFrameWindow.trigger('message', {
          protocol: API_PROTOCOL,
          origin: 'origin',
          data: {
            protocol: API_PROTOCOL,
            msgType: 'invalid message type',
            msg: 'msg',
            direction: 'ClientToHost'
          }
        });
      }).not.toThrow();
      expect(subscriptionCalled).toBe(false);
    });
  });

  describe('when recieving an valid window message from the host application missing the direction field', () => {
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
          },
          direction: 'HostToClient'
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
      const testEnvironmentData: SetupData = {
        locale: 'nl-NL',
        hostRootUrl: 'http://example.com/',
        registeredKeys: [{ key: 'a', altKey: true }],
        custom: undefined,
        assignedRoute: 'app1'
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
          altKey: false,
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
          altKey: true,
          ctrlKey: false,
          metaKey: false,
          shiftKey: false
        });
      });

      it('should publish a key event', () => {
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          applyClientProtocol({
            msgType: 'registeredKeyFired',
            msg: {
              altKey: true,
              charCode: undefined,
              code: 'KeyA',
              ctrlKey: false,
              key: 'A',
              keyCode: 65,
              metaKey: false,
              shiftKey: false
            }
          }),
          'https://example.com'
        );
      });
    });
  });

  describe('when client requests to navigate to a new page', () => {
    beforeEach(() => {
      client.requestNavigation({ url: 'http://www.example.com/' });
    });

    it('should notify host of navigation request', () => {
      expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
        applyClientProtocol({
          msgType: 'navRequest',
          msg: { url: 'http://www.example.com/' }
        }),
        'https://example.com'
      );
    });
  });

  describe('when window has a click event', () => {
    let mockElement;
    describe('when click event target is an anchor', () => {
      beforeEach(() => {
        client.startInterceptingLinks();
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

      it('should notify host of navigation request', () => {
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          applyClientProtocol({
            msgType: 'navRequest',
            msg: { url: 'http://www.example.com/' }
          }),
          'https://example.com'
        );
      });
    });

    describe('when click event target is not an anchor', () => {
      beforeEach(() => {
        client.startInterceptingLinks();
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

      it('should not notify host of navigation request', () => {
        expect(mockFrameWindow.parent.postMessage).not.toHaveBeenCalled();
      });
    });

    describe('when the client is created without a specific host origin', () => {
      it("sends messages to it's own origin", () => {
        client = new Client();
        client._clientWindow = mockFrameWindow;
        client.start();
        expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
          applyClientProtocol({
            msgType: 'client_started',
            msg: undefined
          }),
          window.origin
        );
      });
    });
  });
});
