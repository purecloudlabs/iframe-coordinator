import { HostToClient, validate } from '../HostToClient';

describe('HostToClient', () => {
  describe('validating an invalid message type', () => {
    const testMessage = {
      msgType: 'foobar',
      msg: 'test-data'
    };

    let testResult: HostToClient | null;
    beforeEach(() => {
      testResult = validate(testMessage);
    });
    it('should return a null message', () => {
      expect(testResult).toBeNull();
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
        expect(testResult).toEqual(testMessage);
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
        expect(testResult).toEqual(testMessage);
      });
    });

    describe('when topic is missing', () => {
      const testMessage = {
        msgType: 'publish',
        msg: {
          payload: { testData: 'test.data' }
        }
      };
      let testResult: HostToClient | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return a null message', () => {
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
      const expectedMessage: HostToClient = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: undefined
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
          language: 'nl',
          locale: 'nl-NL',
          platformId: 'PureCloud',
          hostRootUrl: 'http://example.com/'
        }
      };
      let testResult: HostToClient | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return the validated message', () => {
        expect(testResult).toEqual(testMessage);
      });
    });

    describe('when language is missing', () => {
      const testMessage = {
        msgType: 'env_init',
        msg: {
          locale: 'nl-NL',
          platformId: 'PureCloud',
          hostRootUrl: 'http://example.com/'
        }
      };
      let testResult: HostToClient | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return a null message', () => {
        expect(testResult).toBeNull();
      });
    });

    describe('when platform id is missing', () => {
      const testMessage = {
        msgType: 'env_init',
        msg: {
          language: 'nl',
          locale: 'nl-NL',
          hostRootUrl: 'http://example.com/'
        }
      };
      let testResult: HostToClient | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return a null message', () => {
        expect(testResult).toBeNull();
      });
    });

    describe('when host root url is missing', () => {
      const testMessage = {
        msgType: 'env_init',
        msg: {
          language: 'nl',
          locale: 'nl-NL',
          platformId: 'PureCloud'
        }
      };
      let testResult: HostToClient | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return a null message', () => {
        expect(testResult).toBeNull();
      });
    });
  });
});
