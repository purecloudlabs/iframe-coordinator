import * as ClientInjector from 'inject-loader!../client';

describe("client", () => {
  let client: any,
      elmMock: any,
      mockWorker: any,
      mockFrameWindow: any;
  beforeEach(() => {
    mockFrameWindow = {
      eventHandlers: {},
      trigger: (eventId: string, eventData: any) => {
        mockFrameWindow.eventHandlers[eventId](eventData);
      },
      addEventListener: (eventId: string, handler: Function) => {
        mockFrameWindow.eventHandlers[eventId] = handler;
      },
      parent: {
        postMessage: jasmine.createSpy('window.parent.postMessage')
      }
    };

    mockWorker = {
      ports: {
        fromHost: {
          send: jasmine.createSpy('elm.client.fromHost.send')
        },
        fromClient: {
          send: jasmine.createSpy('elm.client.fromClient.send')
        },
        toHost: {
          subscribe: jasmine.createSpy('elm.client.toHost.subscribe').and.callFake((subscribeHandler: Function) => {
            mockWorker.ports.toHost.handler = subscribeHandler;
          }),
          publish: (data: any) => {
            mockWorker.ports.toHost.handler(data);
          }
        },
        toClient: {
          subscribe: jasmine.createSpy('elm.client.toClient.subscribe').and.callFake((subscribeHandler: Function) => {
            mockWorker.ports.toClient.handler = subscribeHandler;
          }),
          publish: (data: any) => {
            mockWorker.ports.toClient.handler(data);
          }
        }
      }
    };
    elmMock = {
      Elm: {
        Client: {
          init: jasmine.createSpy('elm.client.init').and.returnValue(mockWorker)
        }
      }
    };
    
    client = ClientInjector({
      '../elm/Client.elm': elmMock
    }).default;
  });

  describe('when starting the client', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
    });

    it('should initialize the elm client', () => {
      expect(elmMock.Elm.Client.init).toHaveBeenCalled();
    });

    it('should subscribe to host messages', () => {
      expect(mockWorker.ports.toHost.subscribe).toHaveBeenCalled();
    });
  });

  describe('when client requests a toast notification', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
    });

    describe('with only a message', () => {
      beforeEach(() => {
        client.requestToast('Test notification message');
      });

      it('should send a message to the worker', () => {
        expect(mockWorker.ports.fromClient.send).toHaveBeenCalledWith({
           msgType: 'toastRequest', 
           msg: {
            title: null,
            message: 'Test notification message',
            custom: null
          }
        });
      });
    });

    describe('with message and extra data', () => {
      beforeEach(() => {
        client.requestToast('Test notification message', { title: 'Test title', custom: { data: 'test data' }});
      });

      it('should send a message to the worker', () => {
        expect(mockWorker.ports.fromClient.send).toHaveBeenCalledWith({
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
      expect(mockWorker.ports.fromClient.send).toHaveBeenCalledWith({
        msgType: 'subscribe', 
        msg: 'test.topic'
      });
    });
  });

  describe('when unsubscribing to the client', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.unsubscribe('test.topic');
    });

    it('should notify worker of unsubscription', () => {
      expect(mockWorker.ports.fromClient.send).toHaveBeenCalledWith({
        msgType: 'unsubscribe', 
        msg: 'test.topic'
      });
    });
  });

  describe('when publishing a new message', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      client.publish('test.topic', 'custom data');
    });

    it('should notify worker of new publication', () => {
      expect(mockWorker.ports.fromClient.send).toHaveBeenCalledWith({
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
      mockFrameWindow.trigger('message', { origin: 'origin', data: 'test data' });
    });

    it('should notify worker of incoming message', () => {
      expect(mockWorker.ports.fromHost.send).toHaveBeenCalledWith({ origin: 'origin', data: 'test data' });
    });
  });

  describe('when recieving a message directed towards the host application', () => {
    beforeEach(() => {
      client.start(mockFrameWindow);
      mockWorker.ports.toHost.publish('Test Publish');
    });

    it('should post outgoing window message to host application', () => {
      expect(mockFrameWindow.parent.postMessage).toHaveBeenCalledWith('Test Publish', '*');
    });
  });

  describe('when client is publishing an outgoing message', () => {
    let pubSubHandlerCallCount: number, pubSubHandlerData: any;
    beforeEach(() => {
      pubSubHandlerCallCount = 0;
      client.start(mockFrameWindow);
      client.onPubsub((data: any) => {
        pubSubHandlerCallCount++
        pubSubHandlerData = data;
      });
      client.onPubsub(() => pubSubHandlerCallCount++);
      mockWorker.ports.toClient.publish({
        msgType: 'publish',
        msg: { data: 'custom data' }
      });
    });

    it('should notify each of the application\'s publication handlers', () => {
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
        mockElement.setAttribute('href', 'http://www.example.com/')
        mockFrameWindow.trigger('click', {
          target: mockElement,
          button: 0,
          preventDefault: () => {}
        });
      });
  
      it('should notify worker of navigation request', () => {
        expect(mockWorker.ports.fromClient.send).toHaveBeenCalledWith({
          msgType: 'navRequest', 
          msg: 'http://www.example.com/'
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
          preventDefault: () => {}
        });
      });
  
      it('should not notify worker of navigation request', () => {
        expect(mockWorker.ports.fromClient.send).not.toHaveBeenCalled();
      });
    });
  });
});