import { EventEmitter } from '../EventEmitter';

describe('EventEmitter', () => {
  describe('Basic type event emitter', () => {
    let eventEmitter: EventEmitter<string>;
    beforeEach(() => {
      eventEmitter = new EventEmitter<string>();
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
      payload1: string;
      payload2: number;
    }
    let eventEmitter: EventEmitter<CustomTestData>;
    beforeEach(() => {
      eventEmitter = new EventEmitter<CustomTestData>();
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
