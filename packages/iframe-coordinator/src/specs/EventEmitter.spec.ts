import { InternalEventEmitter } from '../EventEmitter';

describe('InternalEventEmitter', () => {
  describe('Basic type event emitter', () => {
    let eventEmitter: InternalEventEmitter<string>;
    beforeEach(() => {
      eventEmitter = new InternalEventEmitter<string>();
    });

    it('should not error when dispatching an event with no listeners', () => {
      expect(() => eventEmitter.dispatch('test', 'data')).not.toThrow();
    });

    it('should not error when removing no listeners', () => {
      expect(() => eventEmitter.removeAllListeners('test.event')).not.toThrow();
    });

    it('should not dispatch to different typed event', () => {
      const listener = jasmine.createSpy('wrongEventListener');
      eventEmitter.addListener('wrong.event', listener);
      eventEmitter.dispatch('test.event', 'test.data');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should dispatch to correctly typed event', () => {
      const listener = jasmine.createSpy('eventListener');
      eventEmitter.addListener('test.event', listener);
      eventEmitter.dispatch('test.event', 'test.data');
      expect(listener).toHaveBeenCalledWith('test.data');
    });

    it('should dispatch to multipe listeners of the right type', () => {
      const listener = jasmine.createSpy('eventListener');
      const listener2 = jasmine.createSpy('eventListener2');
      eventEmitter.addListener('test.event', listener);
      eventEmitter.addListener('test.event', listener2);
      eventEmitter.dispatch('test.event', 'test.data');
      expect(listener).toHaveBeenCalledWith('test.data');
      expect(listener2).toHaveBeenCalledWith('test.data');
    });

    it('should not re-add an existing listener', () => {
      const listener = jasmine.createSpy('eventListener');
      eventEmitter.addListener('test.event', listener);
      eventEmitter.addListener('test.event', listener);
      eventEmitter.dispatch('test.event', 'test.data');
      expect(listener).toHaveBeenCalledWith('test.data');
      expect(listener.calls.count()).toBe(1);
    });

    it('should remove an existing listener', () => {
      const listener = jasmine.createSpy('eventListener');
      const listener2 = jasmine.createSpy('eventListener2');
      eventEmitter.addListener('test.event', listener);
      eventEmitter.addListener('test.event', listener2);
      eventEmitter.removeListener('test.event', listener);
      eventEmitter.dispatch('test.event', 'test.data');
      expect(listener).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith('test.data');
    });

    it('should be able to remove a listener from inside the listener callback', () => {
      const event = 'test.event';
      const listener = () => {
        eventEmitter.removeListener(event, listener);
      };
      const listener2 = jasmine.createSpy('eventListener2');

      eventEmitter.addListener(event, listener);
      eventEmitter.addListener(event, listener2);

      expect(() => eventEmitter.dispatch(event, 'test.data')).not.toThrow();

      expect(listener2).toHaveBeenCalledTimes(1);

      eventEmitter.dispatch(event, 'test.data');

      expect(listener2).toHaveBeenCalledTimes(2);
    });

    it('should be able to remove all listeners', () => {
      const listener = jasmine.createSpy('eventListener');
      const listener2 = jasmine.createSpy('eventListener2');
      eventEmitter.addListener('test.event', listener);
      eventEmitter.addListener('test.event', listener2);
      eventEmitter.removeAllListeners('test.event');
      eventEmitter.dispatch('test.event', 'test.data');
      expect(listener).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('Advanced type event emitter', () => {
    // tslint:disable-next-line
    interface CustomTestData {
      // tslint:disable-next-line
      payload1: string;
      // tslint:disable-next-line
      payload2: number;
    }
    let eventEmitter: InternalEventEmitter<CustomTestData>;
    beforeEach(() => {
      eventEmitter = new InternalEventEmitter<CustomTestData>();
    });
    const testData = {
      payload1: 'test.data',
      payload2: 2
    };
    it('should dispatch to multipe listeners of the right type', () => {
      const listener = jasmine.createSpy('eventListener');
      const listener2 = jasmine.createSpy('eventListener2');
      eventEmitter.addListener('test.event', listener);
      eventEmitter.addListener('test.event', listener2);
      eventEmitter.dispatch('test.event', testData);
      expect(listener).toHaveBeenCalledWith(testData);
      expect(listener2).toHaveBeenCalledWith(testData);
    });
  });
});
