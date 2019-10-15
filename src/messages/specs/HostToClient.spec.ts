import { HostToClient, validate } from '../HostToClient';

describe('HostToClient', () => {
  describe('validating an invalid message type', () => {
    const testMessage = {
      msgType: 'foobar',
      msg: 'test-data'
    };

    it('should return a null message', () => {
      expect(() => {
        validate(testMessage);
      }).toThrow();
    });
  });

  describe('validating publish type', () => {
    describe('when payload is a string', () => {
      const testMessage: HostToClient = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: 'test.payload'
        }
      };
      let testResult: HostToClient | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return the validated message', () => {
        expect(testResult).toEqual({
          msgType: 'publish',
          msg: { ...testMessage.msg, clientId: undefined }
        });
      });
    });

    describe('when payload is an object', () => {
      const testMessage: HostToClient = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: { testData: 'test.data' }
        }
      };
      let testResult: HostToClient | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return the validated message', () => {
        expect(testResult).toEqual({
          msgType: 'publish',
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
      const expectedMessage: HostToClient = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: undefined,
          clientId: undefined
        }
      };
      let testResult: HostToClient | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return the validated message', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });
  });

  describe('validating env_init type', () => {
    describe('when given a proper environmental data payload', () => {
      const testMessage: HostToClient = {
        msgType: 'env_init',
        msg: {
          locale: 'nl-NL',
          hostRootUrl: 'http://example.com/',
          registeredKeys: [],
          assignedRoute: 'app1'
        }
      };

      it('should return the validated message', () => {
        const testResult = validate(testMessage);
        expect(testResult).toEqual({
          msgType: 'env_init',
          msg: {
            ...testMessage.msg,
            custom: undefined
          }
        });
      });
    });

    describe('when given a proper environmental data payload including custom data', () => {
      const testMessage: HostToClient = {
        msgType: 'env_init',
        msg: {
          locale: 'nl-NL',
          hostRootUrl: 'http://example.com/',
          registeredKeys: [],
          custom: {
            appContext: 'MyApp'
          },
          assignedRoute: 'app1'
        }
      };
      let testResult: HostToClient;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return the validated message', () => {
        expect(testResult).toEqual(testMessage);
      });
    });

    describe('when host root url is missing', () => {
      const testMessage = {
        msgType: 'env_init',
        msg: {
          locale: 'nl-NL'
        }
      };

      it('should throw an exception', () => {
        expect(() => {
          validate(testMessage);
        }).toThrow();
      });
    });
  });
});
