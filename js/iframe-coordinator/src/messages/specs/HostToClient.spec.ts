import { validate } from '../HostToClient';

describe('HostToClient', () => {
  describe('validating an invalid message type', () => {
    const testMessage = {
      msgType: 'foobar',
      msg: 'test-data'
    };

    let testResult: LabeledMsg | null;
    beforeEach(() => {
      testResult = validate(testMessage);
    });
    it('should return test', () => {
      expect(testResult).toBeNull();
    });
  });

  describe('validating publish type', () => {
    describe('when payload is a string', () => {
      const testMessage = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: 'test.payload'
        }
      };
      let testResult: LabeledMsg | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return test', () => {
        expect(testResult).toEqual(testMessage);
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
      let testResult: LabeledMsg | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return test', () => {
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
      let testResult: LabeledMsg | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return test', () => {
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
      const expectedMessage = {
        msgType: 'publish',
        msg: {
          topic: 'test.topic',
          payload: undefined
        }
      };
      let testResult: LabeledMsg | null;
      beforeEach(() => {
        testResult = validate(testMessage);
      });
      it('should return test', () => {
        expect(testResult).toEqual(expectedMessage);
      });
    });
  });
});
