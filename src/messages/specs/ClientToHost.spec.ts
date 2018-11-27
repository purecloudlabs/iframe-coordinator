import { ClientToHost, validate } from '../ClientToHost';
import { LabeledNavRequest } from '../NavRequest';
import { LabeledToast } from '../Toast';

describe('ClientToHost', () => {
  describe('validating an invalid message type', () => {
    const testMessage = {
      msgType: 'foobar',
      msg: 'test-data'
    };

    let testResult: ClientToHost | null;
    beforeEach(() => {
      testResult = validate(testMessage);
    });
    it('should return a null message', () => {
      expect(testResult).toBeNull();
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
        expect(testResult).toEqual(testMessage);
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
        expect(testResult).toEqual(testMessage);
      });
    });

    describe('when topic is missing', () => {
      const testMessage = {
        msgType: 'publish',
        clientId: 'test_client',
        msg: {
          payload: { testData: 'test.data' }
        }
      };
      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return the validated message', () => {
        expect(testResult).toBeNull();
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
          origin: undefined
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
        clientId: 'test_client',
        msg: {
          message: 'toast.message'
        }
      };

      const expectedMessage: ClientToHost = {
        msgType: 'toastRequest',
        clientId: 'test_client',
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
        clientId: 'test_client',
        msg: {
          title: 'toast.title',
          message: 'toast.message'
        }
      };

      const expectedMessage: ClientToHost = {
        msgType: 'toastRequest',
        clientId: 'test_client',
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
        clientId: 'test_client',
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

      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return a null message', () => {
        expect(testResult).toBeNull();
      });
    });
  });

  describe('validating navrequest type', () => {
    describe('when valid url is provided', () => {
      const testMessage = {
        msgType: 'navRequest',
        clientId: 'test_client',
        msg: {
          url: 'navRequest.url'
        }
      };

      const expectedMessage: LabeledNavRequest = {
        msgType: 'navRequest',
        clientId: 'test_client',
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

    describe('when invalid url is provided', () => {
      const testMessage = {
        msgType: 'navRequest',
        clientId: 'test_client',
        msg: {
          iurl: 'navRequest.url'
        }
      };

      let testResult: ClientToHost | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });

      it('should return the validated message', () => {
        expect(testResult).toBeNull();
      });
    });
  });
});
