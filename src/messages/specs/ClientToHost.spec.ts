import { ClientToHost, validate } from '../ClientToHost';
import { LabeledNavRequest } from '../NavRequest';
import { LabeledNotification } from '../Notification';
import { LabeledPublication } from '../Publication';

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
    const withClientId = (message: any): any => {
      message.msg.clientId = undefined;
      return message;
    };

    describe('when payload is a string', () => {
      const testMessage = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: 'test.payload'
        }
      };

      const expectedMessage = withClientId({
        ...testMessage,
        protocol: 'iframe-coordinator',
        version: 'unknown'
      }) as LabeledPublication;

      let testResult: ClientToHost;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });

    describe('when payload is an object', () => {
      const testMessage = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: { testData: 'test.data' }
        }
      };

      const expectedMessage = withClientId({
        ...testMessage,
        protocol: 'iframe-coordinator',
        version: 'unknown'
      });

      let testResult: ClientToHost;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
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
      const expectedMessage = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: undefined,
          clientId: undefined
        },
        protocol: 'iframe-coordinator',
        version: 'unknown'
      } as ClientToHost;

      let testResult: ClientToHost;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });
  });

  describe('validating notification type', () => {
    describe('when only a message is provided', () => {
      const testMessage = {
        msgType: 'notifyRequest',
        msg: {
          message: 'toast.message'
        }
      };

      const expectedMessage: ClientToHost = {
        msgType: 'notifyRequest',
        msg: {
          title: undefined,
          message: 'toast.message',
          custom: undefined
        },
        protocol: 'iframe-coordinator',
        version: 'unknown'
      };

      let testResult: ClientToHost;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });

    describe('when title and message are provided', () => {
      const testMessage = {
        msgType: 'notifyRequest',
        msg: {
          title: 'toast.title',
          message: 'toast.message'
        }
      };

      const expectedMessage: ClientToHost = {
        msgType: 'notifyRequest',
        msg: {
          title: 'toast.title',
          message: 'toast.message',
          custom: undefined
        },
        protocol: 'iframe-coordinator',
        version: 'unknown'
      };

      let testResult: ClientToHost;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });

    describe('when everything is provided', () => {
      const testMessage = {
        msgType: 'notifyRequest',
        msg: {
          title: 'toast.title',
          message: 'toast.message',
          custom: 'toast.custom'
        }
      };

      const expectedMessage: ClientToHost = {
        ...testMessage,
        protocol: 'iframe-coordinator',
        version: 'unknown'
      } as LabeledNotification;

      let testResult: ClientToHost;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });

    describe('when an invalid toast message is provided', () => {
      const testMessage = {
        msgType: 'notifyRequest',
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

    it('can handle old requests with toast naming', () => {
      const toastMessage = {
        msgType: 'toastRequest',
        msg: {
          title: 'toast.title',
          message: 'toast.message',
          custom: undefined
        }
      };

      const expectedMessage = {
        ...toastMessage,
        msgType: 'notifyRequest',
        protocol: 'iframe-coordinator',
        version: 'unknown'
      } as LabeledNotification;

      expect(validate(toastMessage)).toEqual(expectedMessage);
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

      const expectedMessage = {
        ...testMessage,
        protocol: 'iframe-coordinator',
        version: 'unknown'
      } as LabeledNavRequest;

      let testResult: ClientToHost;
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
