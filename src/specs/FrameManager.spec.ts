import FrameManager from '../FrameManager';
import { API_PROTOCOL } from '../messages/LabeledMsg';

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
        }),
      head: {
        appendChild: jasmine.createSpy('headAppend')
      }
    };

    mocks.window = {
      handlers: {},
      document: mocks.document,
      addEventListener: jasmine
        .createSpy('windowAddEventListener')
        .and.callFake((topic: string, handler: (data: any) => void) => {
          mocks.window.handlers[topic] = handler;
        }),
      removeEventListener: jasmine
        .createSpy('windowRemoveEventListener')
        .and.callFake((topic: string, handler: (data: any) => void) => {
          mocks.window.handlers[topic] = undefined;
        }),
      raise(topic: string, data: any) {
        if (mocks.window.handlers[topic]) {
          mocks.window.handlers[topic](data);
        }
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

    mocks.handler = jasmine.createSpy('messageHandler');

    frameManager = new FrameManager({
      onMessage: mocks.handler,
      mockWindow: mocks.window
    });
  });

  it('Creates a sandboxed iframe when created', () => {
    expect(mocks.document.createElement).toHaveBeenCalledWith('iframe');
    expect(mocks.frame.setAttribute).toHaveBeenCalledWith(
      'sandbox',
      'allow-scripts allow-same-origin allow-modals allow-forms allow-popups'
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

    it('returns the set location', () => {
      mocks.frame.load();
      const blank = frameManager.setFrameLocation(null);
      const example = frameManager.setFrameLocation('http://example.com');
      expect(blank).toEqual('about:blank');
      expect(example).toEqual('http://example.com');
    });
  });

  describe('Can send messages to the client frame', () => {
    beforeEach(() => {
      mocks.frame.load();
    });

    it('unless the frame location is the default', () => {
      const message = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: {}
        }
      };
      frameManager.sendToClient(message);

      expect(mocks.frame.contentWindow.postMessage).not.toHaveBeenCalled();
    });

    it('restricted by set location origin', () => {
      const message = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: {}
        }
      };
      frameManager.setFrameLocation('http://example.com:4040/foo/bar/baz/');
      frameManager.sendToClient(message);

      expect(mocks.frame.contentWindow.postMessage).toHaveBeenCalledWith(
        {
          msgType: 'publish',
          msg: {
            ...message.msg,
            clientId: undefined
          },
          protocol: 'iframe-coordinator',
          version: 'unknown'
        },
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
      };
      frameManager.setFrameLocation('/foo/bar/');
      frameManager.sendToClient(message);

      expect(mocks.frame.contentWindow.postMessage).toHaveBeenCalledWith(
        {
          msgType: 'publish',
          msg: {
            ...message.msg,
            clientId: undefined
          },
          protocol: 'iframe-coordinator',
          version: 'unknown'
        },
        'http://test.example.com'
      );
    });
  });

  describe('Can be used to subscribe to client messages', () => {
    beforeEach(() => {
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
      frameManager.startMessageHandler();
    });

    it('if the messages are sent correctly', () => {
      mocks.window.raise('message', mocks.messageEvent);
      expect(mocks.handler).toHaveBeenCalledWith({
        msgType: mocks.messageEvent.data.msgType,
        msg: {
          ...mocks.messageEvent.data.msg,
          clientId: undefined
        },
        protocol: 'iframe-coordinator',
        version: 'unknown'
      });
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

    it('which throw exceptions if sent with invalid data from iframe-coordinator', () => {
      mocks.messageEvent.data = {
        protocol: API_PROTOCOL,
        msgType: 'notValid',
        msg: {}
      };
      expect(() => {
        mocks.window.raise('message', mocks.messageEvent);
      }).toThrow();
    });

    it('which do not throw exceptions if sent with invalid data from other sources', () => {
      mocks.messageEvent.data = {
        protocol: 'whatev',
        msgType: 'notValid',
        msg: {}
      };
      expect(() => {
        mocks.window.raise('message', mocks.messageEvent);
      }).not.toThrow();
    });

    it('and can unsubscribe as well.', () => {
      frameManager.stopMessageHandler();
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
      };

      frameManager.sendToClient(message);
      expect(mocks.frame.contentWindow.postMessage).toHaveBeenCalledWith(
        {
          msgType: 'publish',
          msg: {
            ...message.msg,
            clientId: undefined
          },
          protocol: 'iframe-coordinator',
          version: 'unknown'
        },
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

  describe("Can be used to set the frame's allow policy", () => {
    it('set it to a new policy', () => {
      const allowOpts = 'microphone *; camera *;';
      frameManager.setFrameAllow(allowOpts);
      expect(mocks.frame.setAttribute).toHaveBeenCalledWith('allow', allowOpts);
    });

    it('ensure only a string is set', () => {
      frameManager.setFrameAllow(false as any);
      expect(mocks.frame.setAttribute).toHaveBeenCalledWith('allow', '');
    });
  });

  describe("Can be used to set the frame's sandbox", () => {
    const DEFAULT_SANDBOX = [
      'allow-scripts',
      'allow-same-origin',
      'allow-modals',
      'allow-forms',
      'allow-popups'
    ];

    it('add to the sandbox', () => {
      const sandboxOpts = 'awesome-sandbox allow-playground';
      frameManager.setFrameSandbox(sandboxOpts);
      sandboxOpts
        .split(' ')
        .forEach(newOpt =>
          expect(mocks.frame.setAttribute).toHaveBeenCalledWith(
            'sandbox',
            jasmine.stringMatching(newOpt)
          )
        );
    });

    it('ensure defaults are always set', () => {
      frameManager.setFrameSandbox('');
      DEFAULT_SANDBOX.forEach(defaultOpt =>
        expect(mocks.frame.setAttribute).toHaveBeenCalledWith(
          'sandbox',
          jasmine.stringMatching(defaultOpt)
        )
      );
    });

    it('ensure only a string is set', () => {
      frameManager.setFrameSandbox({} as any);
      expect(mocks.frame.setAttribute).not.toHaveBeenCalledWith('sandbox', {});
    });
  });

  it('Can be embeded the frame in another element', () => {
    frameManager.embed(mocks.node);
    expect(mocks.node.appendChild).toHaveBeenCalledWith(mocks.frame);
  });
});
