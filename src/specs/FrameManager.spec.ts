import * as frameManagerInjector from 'inject-loader!../FrameManager';
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
          return mocks.mockFrame;
        })
    };

    mocks.window = {
      handlers: {},
      document: mocks.document,
      addEventListener: jasmine
        .createSpy('frameAddEventListener')
        .and.callFake((topic: string, handler: (data: any) => void) => {
          mocks.mockFrame.handlers[topic] = handler;
        }),
      raise(topic: string, data: any) {
        mocks.mockFrame.handlers[topic](data);
      },
      location: {
        href: 'http://test.example.com/foo/'
      }
    };

    mocks.mockFrameWindow = {
      location: {
        replace: jasmine.createSpy('frameLocationReplace')
      },
      postMessage: jasmine.createSpy('framePostMessage')
    };

    mocks.mockFrame = {
      setAttribute: jasmine.createSpy('frameSetAttribute'),
      load: () => {
        mocks.mockFrame.contentWindow = mocks.mockFrameWindow;
        if (mocks.mockFrame.onload) {
          mocks.mockFrame.onload();
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
    expect(mocks.mockFrame.setAttribute).toHaveBeenCalledWith(
      'sandbox',
      'allow-scripts allow-same-origin'
    );
  });

  describe("Can be used to set the frame's location", () => {
    it('before the frame loads', () => {
      frameManager.setFrameLocation('http://example.com/');
      mocks.mockFrame.load();
      expect(
        mocks.mockFrame.contentWindow.location.replace
      ).toHaveBeenCalledWith('http://example.com/');
    });

    it('after the frame loads', () => {
      mocks.mockFrame.load();
      frameManager.setFrameLocation('http://example.com/');
      expect(
        mocks.mockFrame.contentWindow.location.replace
      ).toHaveBeenCalledWith('http://example.com/');
    });

    it('to an empty page', () => {
      mocks.mockFrame.load();
      frameManager.setFrameLocation(null);
      expect(
        mocks.mockFrame.contentWindow.location.replace
      ).toHaveBeenCalledWith('about:blank');
    });
  });

  describe('Can send messages to the client frame', () => {
    it('restricted by set location origin', () => {
      const message = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: {}
        }
      } as HostToClient;
      mocks.mockFrame.load();
      frameManager.setFrameLocation('http://example.com:4040/foo/bar/baz/');
      frameManager.sendToClient(message);

      expect(mocks.mockFrame.contentWindow.postMessage).toHaveBeenCalledWith(
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
      mocks.mockFrame.load();
      frameManager.setFrameLocation('/foo/bar/');
      frameManager.sendToClient(message);

      expect(mocks.mockFrame.contentWindow.postMessage).toHaveBeenCalledWith(
        message,
        'http://test.example.com'
      );
    });
  });

  describe('Can be used to subscribe to post messages', () => {
    it('which are bocked if from a different frame', () => {
      expect(true).toBe(false);
    });
  });
});
