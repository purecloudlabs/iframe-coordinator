import { ClientToHost, validate } from '../ClientToHost';
import { LabeledNavRequest } from '../NavRequest';
import { LabeledToast } from '../Toast';

describe('ClientToHost', () => {
  describe('validating an invalid message type', () => {
    const testMessage = {
      msgType: 'foobar',
      msg: 'test-data'
    };

    it('should throw an exception', () => {
      expect(() => {
        validate(testMessage);
      }).toThrow();
    });
  });

  describe('validating publish type', () => {
    describe('when payload is a string', () => {
      const testMessage: ClientToHost = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: 'test.payload'
        }
      };
      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual({
          msgType: testMessage.msgType,
          msg: { ...testMessage.msg, clientId: undefined }
        });
      });
    });

    describe('when payload is an object', () => {
      const testMessage: ClientToHost = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: { testData: 'test.data' }
        }
      };
      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual({
          msgType: testMessage.msgType,
          msg: { ...testMessage.msg, clientId: undefined }
        });
      });
    });

    describe('when topic is missing', () => {
      const testMessage = {
        msgType: 'publish',
        msg: {
          payload: { testData: 'test.data' }
        }
      };

      it('should throw an exception', () => {
        expect(() => {
          validate(testMessage);
        }).toThrow();
      });
    });

    describe('when payload is missing', () => {
      const testMessage = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic'
        }
      };
      const expectedMessage: ClientToHost = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: undefined,
          clientId: undefined
        }
      };
      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });
  });

  describe('validating toast type', () => {
    describe('when only a message is provided', () => {
      const testMessage = {
        msgType: 'toastRequest',
        msg: {
          message: 'toast.message'
        }
      };

      const expectedMessage: ClientToHost = {
        msgType: 'toastRequest',
        msg: {
          title: undefined,
          message: 'toast.message',
          custom: undefined
        }
      };

      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });

    describe('when title and message are provided', () => {
      const testMessage = {
        msgType: 'toastRequest',
        msg: {
          title: 'toast.title',
          message: 'toast.message'
        }
      };

      const expectedMessage: ClientToHost = {
        msgType: 'toastRequest',
        msg: {
          title: 'toast.title',
          message: 'toast.message',
          custom: undefined
        }
      };

      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });

    describe('when everything is provided', () => {
      const testMessage = {
        msgType: 'toastRequest',
        msg: {
          title: 'toast.title',
          message: 'toast.message',
          custom: 'toast.custom'
        }
      };

      const expectedMessage: ClientToHost = testMessage as LabeledToast;
      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });

    describe('when an invalid toast message is provided', () => {
      const testMessage = {
        msgType: 'toastRequest',
        msg: {
          title: 'toast.title'
          // no message provided
        }
      };

      it('should throw an exception', () => {
        expect(() => {
          validate(testMessage);
        }).toThrow();
      });
    });
  });

  describe('validating navrequest type', () => {
    describe('when valid url is provided', () => {
      const testMessage = {
        msgType: 'navRequest',
        msg: {
          url: 'navRequest.url'
        }
      };

      const expectedMessage: LabeledNavRequest = {
        msgType: 'navRequest',
        msg: {
          url: 'navRequest.url'
        }
      };

      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });

    describe('when invalid data is provided', () => {
      const testMessage = {
        msgType: 'navRequest',
        msg: {
          iurl: 'navRequest.url'
        }
      };

      it('should return throw an exception', () => {
        expect(() => {
          validate(testMessage);
        }).toThrow();
      });
    });
  });
});
