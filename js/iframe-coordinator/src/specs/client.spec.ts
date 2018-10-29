import * as ClientInjector from 'inject-loader!../client';
import { ClientProgram } from '../ClientProgram';

describe('client', () => {
  let client: any;
  let mockWorker: any;
  let mockFrameWindow: any;
  let mockClientProgramObj: any;

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

    mockClientProgramObj = {
      onMessageFromHost: jasmine
        .createSpy('onMessageFromHost')
        .and.callFake((handler: (data: any) => void) => {
          mockClientProgramObj.messageFromHostHandler = handler;
        }),
      raiseMessageFromHost: (data: any) => {
        mockClientProgramObj.messageFromHostHandler(data);
      },
      onMessageToHost: jasmine
        .createSpy('onMessageToHost')
        .and.callFake((handler: (data: any) => void) => {
          mockClientProgramObj.messageToHostHandler = handler;
        }),
      raiseMessageToHost: (data: any) => {
        mockClientProgramObj.messageToHostHandler(data);
      },
      send: jasmine.createSpy('clientProgramSend'),
      subscribe: jasmine.createSpy('subscribe'),
      unsubscribe: jasmine.createSpy('unsubscribe'),
      messageEventReceived: jasmine.createSpy('messageEventReceived')
    };

    /* tslint:disable */
    const mockClientProgram = function() {
      return mockClientProgramObj;
    };
    /* tslint:enable */

    mockWorker = {
      ClientProgram: mockClientProgram
    };

    /* tslint:disable */
    let Client = ClientInjector({
      './ClientProgram': mockWorker
    }).Client;
    /* tslint:enable */

    client = new Client({ clientWindow: mockFrameWindow });
  });

  describe('when starting the client', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
    });

    it('should subscribe to host messages', () => {
      expect(mockClientProgramObj.onMessageFromHost).toHaveBeenCalled();
    });

    it('should subscribe to host messages', () => {
      expect(mockClientProgramObj.onMessageFromHost).toHaveBeenCalled();
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
        expect(mockClientProgramObj.send).toHaveBeenCalledWith({
          msgType: 'toastRequest',
          msg: {
            title: undefined,
            message: 'Test notification message',
            custom: undefined
          }
        });
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
        expect(mockClientProgramObj.send).toHaveBeenCalledWith({
          msgType: 'toastRequest',
          msg: {
            title: 'Test title',
            message: 'Test notification message',
            custom: { data: 'test data' }
          }
        });
      });
    });
  });

  describe('when subscribing to the client', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.subscribe('test.topic');
    });

    it('should notify worker of subscription', () => {
      expect(mockClientProgramObj.subscribe).toHaveBeenCalledWith('test.topic');
    });
  });

  describe('when unsubscribing to the client', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.unsubscribe('test.topic');
    });

    it('should notify worker of unsubscription', () => {
      expect(mockClientProgramObj.unsubscribe).toHaveBeenCalledWith(
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
      expect(mockClientProgramObj.send).toHaveBeenCalledWith({
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: 'custom data'
        }
      });
    });
  });

  describe('when recieving a window message from the host application', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      mockFrameWindow.trigger('message', {
        origin: 'origin',
        data: 'test data'
      });
    });

    it('should notify worker of incoming message', () => {
      expect(mockClientProgramObj.messageEventReceived).toHaveBeenCalledWith(
        'test data'
      );
    });
  });

  describe('when recieving a message directed towards the host application', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      mockClientProgramObj.raiseMessageToHost('Test Publish');
    });

    it('should post outgoing window message to host application', () => {
      expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith(
        'Test Publish',
        '*'
      );
    });
  });

  describe('when client is publishing an outgoing message', () => {
    let pubSubHandlerCallCount: number;
    let pubSubHandlerData: any;
    beforeEach(() => {
      pubSubHandlerCallCount = 0;
      client.start(mockFrameWindow);
      client.onPubsub((data: any) => {
        pubSubHandlerCallCount++;
        pubSubHandlerData = data;
      });
      client.onPubsub(() => pubSubHandlerCallCount++);
      mockClientProgramObj.raiseMessageFromHost({
        msgType: 'publish',
        msg: { data: 'custom data' }
      });
    });

    it("should notify each of the application's publication handlers", () => {
      expect(pubSubHandlerCallCount).toBe(2);
    });

    it('should send the publish data to the publication handlers', () => {
      expect(pubSubHandlerData).toEqual({ data: 'custom data' });
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
        expect(mockClientProgramObj.send).toHaveBeenCalledWith({
          msgType: 'navRequest',
          msg: { fragment: '' }
        });
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
        expect(mockClientProgramObj.send).not.toHaveBeenCalled();
      });
    });
  });
});
