import FrameManager from '../FrameManager';
import { HostToClient } from '../messages/HostToClient';

describe('FrameManager', () => {
  let mocks: any;
  let frameManager: FrameManager;

  beforeEach(() => {
    mocks = {};

    mocks.document = {
      createElement: jasmine
        .createSpy('docCreateElement')
        .and.callFake((element: string) => {
          return mocks.frame;
        })
    };

    mocks.window = {
      handlers: {},
      document: mocks.document,
      addEventListener: jasmine
        .createSpy('frameAddEventListener')
        .and.callFake((topic: string, handler: (data: any) => void) => {
          mocks.window.handlers[topic] = handler;
        }),
      raise(topic: string, data: any) {
        mocks.window.handlers[topic](data);
      },
      location: {
        href: 'http://test.example.com/foo/'
      }
    };

    mocks.frameWindow = {
      location: {
        replace: jasmine.createSpy('frameLocationReplace')
      },
      postMessage: jasmine.createSpy('framePostMessage')
    };

    mocks.frame = {
      setAttribute: jasmine.createSpy('frameSetAttribute'),
      load: () => {
        mocks.frame.contentWindow = mocks.frameWindow;
        if (mocks.frame.onload) {
          mocks.frame.onload();
        }
      }
    };

    mocks.node = {
      appendChild: jasmine.createSpy('nodeAppendChild')
    };

    frameManager = new FrameManager(mocks.window);
  });

  it('Creates a sandboxed iframe when created', () => {
    expect(mocks.document.createElement).toHaveBeenCalledWith('iframe');
    expect(mocks.frame.setAttribute).toHaveBeenCalledWith(
      'sandbox',
      'allow-scripts allow-same-origin'
    );
  });

  describe("Can be used to set the frame's location", () => {
    it('before the frame loads', () => {
      frameManager.setFrameLocation('http://example.com/');
      mocks.frame.load();
      expect(mocks.frame.contentWindow.location.replace).toHaveBeenCalledWith(
        'http://example.com/'
      );
    });

    it('after the frame loads', () => {
      mocks.frame.load();
      frameManager.setFrameLocation('http://example.com/');
      expect(mocks.frame.contentWindow.location.replace).toHaveBeenCalledWith(
        'http://example.com/'
      );
    });

    it('to an empty page', () => {
      mocks.frame.load();
      frameManager.setFrameLocation(null);
      expect(mocks.frame.contentWindow.location.replace).toHaveBeenCalledWith(
        'about:blank'
      );
    });
  });

  describe('Can send messages to the client frame', () => {
    beforeEach(() => {
      mocks.frame.load();
    });

    it('restricted by set location origin', () => {
      const message = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: {}
        }
      } as HostToClient;
      frameManager.setFrameLocation('http://example.com:4040/foo/bar/baz/');
      frameManager.sendToClient(message);

      expect(mocks.frame.contentWindow.postMessage).toHaveBeenCalledWith(
        message,
        'http://example.com:4040'
      );
    });

    it('or restricted by the implied host page origin', () => {
      const message = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: {}
        }
      } as HostToClient;
      frameManager.setFrameLocation('/foo/bar/');
      frameManager.sendToClient(message);

      expect(mocks.frame.contentWindow.postMessage).toHaveBeenCalledWith(
        message,
        'http://test.example.com'
      );
    });
  });

  describe('Can be used to subscribe to client messages', () => {
    beforeEach(() => {
      mocks.handler = jasmine.createSpy('messageHandler');
      mocks.frame.load();
      frameManager.setFrameLocation('http://example.com/');
      mocks.messageEvent = {
        origin: 'http://example.com',
        source: mocks.frame.contentWindow,
        data: {
          msgType: 'publish',
          msg: {
            topic: 'test.topic',
            payload: {}
          }
        }
      };
      frameManager.listenToMessages(mocks.handler);
    });

    it('if the messages are sent correctly', () => {
      mocks.window.raise('message', mocks.messageEvent);
      expect(mocks.handler).toHaveBeenCalledWith(mocks.messageEvent.data);
    });

    it('which are blocked if sent from an unexpected origin', () => {
      mocks.messageEvent.origin = 'http://evil.com';
      mocks.window.raise('message', mocks.messageEvent);
      expect(mocks.handler).not.toHaveBeenCalled();
    });

    it('which are blocked if sent from an unexpected frame', () => {
      mocks.messageEvent.source = {};
      mocks.window.raise('message', mocks.messageEvent);
      expect(mocks.handler).not.toHaveBeenCalled();
    });

    it('which are blocked if sent with invalid data', () => {
      mocks.messageEvent.data = { msgType: 'notValid', msg: {} };
      mocks.window.raise('message', mocks.messageEvent);
      expect(mocks.handler).not.toHaveBeenCalled();
    });
  });

  describe('Can send messages to clients', () => {
    beforeEach(() => {
      mocks.frame.load();
      frameManager.setFrameLocation('http://example.com/');
    });

    it('if the message is valid', () => {
      const message = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: {}
        }
      } as HostToClient;

      frameManager.sendToClient(message);
      expect(mocks.frame.contentWindow.postMessage).toHaveBeenCalledWith(
        message,
        'http://example.com'
      );
    });

    /*
    it('but not if the message is invalid', () => {
      const message = {
        msgType: 'notAValidType',
        msg: {}
      } as HostToClient;
      frameManager.sendToClient(message);
      expect(mocks.frame.contentWindow.postMessage).not.toHaveBeenCalled();
    });
    */
  });

  it('Can be embeded the frame in another element', () => {
    frameManager.embed(mocks.node);
    expect(mocks.node.appendChild).toHaveBeenCalledWith(mocks.frame);
  });
});
