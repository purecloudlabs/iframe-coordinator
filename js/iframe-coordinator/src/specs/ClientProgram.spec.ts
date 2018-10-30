import { SubscriptonManager } from '../SubscriptionManager';

describe('ClientProgram', () => {
  let mocks: any;
  let clientProgram: ClientProgram;
  beforeEach(() => {
    mocks = {
      ifcFrame: {
        default: class MockIFCFrame {
          public setAttribute() {
            // Empty
          }

          public addEventListener() {
            // Empty
          }
        }
      },
      node: {
        appendChild: () => {
          // Empty
        }
      }
    };

    clientProgram = new ClientProgram();
  });

  describe('when message events recieved by the program', () => {
    let handlerData: LabeledMsg;
    beforeEach(() => {
      clientProgram.onMessageToHost(message => {
        handlerData = message;
      });
      clientProgram.send({
        msgType: 'test-mesg',
        msg: { data: 'test-data' }
      });
    });

    it('should allow properly formatted events', () => {
      expect(handlerData).toEqual({
        msgType: 'test-mesg',
        msg: { data: 'test-data' }
      });
    });
  });

  describe('when publish message from host is incoming', () => {
    let handlerData: LabeledMsg | null;
    const recievedMessage: LabeledMsg = {
      msgType: 'publish',
      msg: {
        topic: 'test.topic',
        payload: 'test.payload'
      }
    };

    beforeEach(() => {
      handlerData = null;
      clientProgram.onMessageFromHost((message: LabeledMsg) => {
        handlerData = message;
      });
    });

    describe('when not interested in the message', () => {
      beforeEach(() => {
        clientProgram.messageEventReceived(recievedMessage);
      });

      it('should not raise a message', () => {
        expect(handlerData).toBeNull();
      });
    });

    describe('when interested in the publish message', () => {
      beforeEach(() => {
        clientProgram.subscribe('test.topic');
        clientProgram.messageEventReceived(recievedMessage);
      });

      it('should raise a message', () => {
        expect(handlerData).toEqual(recievedMessage);
      });
    });
  });

  describe('when non-publish message from host is incoming', () => {
    let handlerData: LabeledMsg | null;
    const recievedMessage: LabeledMsg = {
      msgType: 'foobar',
      msg: 'test.data'
    };

    beforeEach(() => {
      handlerData = null;
      clientProgram.onMessageFromHost((message: LabeledMsg) => {
        handlerData = message;
      });

      clientProgram.messageEventReceived(recievedMessage);
    });

    it('should raise a message', () => {
      expect(handlerData).toEqual(recievedMessage);
    });
  });
});
