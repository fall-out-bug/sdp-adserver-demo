import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter, resetEventEmitter, getEventEmitter } from './events.js';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on', () => {
    it('should register event listener', () => {
      const listener = vi.fn();
      emitter.on('test', listener);
      expect(emitter.listenerCount('test')).toBe(1);
    });

    it('should return this for chaining', () => {
      const listener = vi.fn();
      const result = emitter.on('test', listener);
      expect(result).toBe(emitter);
    });

    it('should register multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      emitter.on('test', listener1).on('test', listener2);
      expect(emitter.listenerCount('test')).toBe(2);
    });
  });

  describe('once', () => {
    it('should register one-time listener', () => {
      const listener = vi.fn();
      emitter.once('test', listener);
      emitter.emit('test');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(emitter.listenerCount('test')).toBe(0);
    });

    it('should remove listener after first emit', () => {
      const listener = vi.fn();
      emitter.once('test', listener);
      emitter.emit('test');
      emitter.emit('test');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('emit', () => {
    it('should call all listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      emitter.on('test', listener1).on('test', listener2);
      emitter.emit('test');
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to listeners', () => {
      const listener = vi.fn();
      emitter.on('test', listener);
      emitter.emit('test', 'arg1', 'arg2');
      expect(listener).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should return false if no listeners', () => {
      const result = emitter.emit('nonexistent');
      expect(result).toBe(false);
    });

    it('should return true if listeners exist', () => {
      emitter.on('test', () => {});
      const result = emitter.emit('test');
      expect(result).toBe(true);
    });

    it('should handle listener errors without stopping propagation', () => {
      const listener1 = vi.fn(() => {
        throw new Error('Test error');
      });
      const listener2 = vi.fn();
      emitter.on('test', listener1).on('test', listener2);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      emitter.emit('test');
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });
  });

  describe('off', () => {
    it('should remove specific listener', () => {
      const listener = vi.fn();
      emitter.on('test', listener);
      emitter.off('test', listener);
      expect(emitter.listenerCount('test')).toBe(0);
    });

    it('should remove all listeners for event if no listener specified', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      emitter.on('test', listener1).on('test', listener2);
      emitter.off('test');
      expect(emitter.listenerCount('test')).toBe(0);
    });

  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      emitter.on('test', () => {}).on('test', () => {});
      emitter.on('other', () => {});
      emitter.removeAllListeners('test');
      expect(emitter.listenerCount('test')).toBe(0);
      expect(emitter.listenerCount('other')).toBe(1);
    });

    it('should remove all listeners if no event specified', () => {
      emitter.on('test', () => {}).on('other', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('test')).toBe(0);
      expect(emitter.listenerCount('other')).toBe(0);
    });
  });

  describe('listenerCount', () => {
    it('should return 0 for non-existent event', () => {
      expect(emitter.listenerCount('nonexistent')).toBe(0);
    });

    it('should return correct count', () => {
      emitter.on('test', () => {}).on('test', () => {}).on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(3);
    });
  });

  describe('eventNames', () => {
    it('should return array of event names', () => {
      emitter.on('test', () => {}).on('other', () => {});
      const names = emitter.eventNames();
      expect(names).toContain('test');
      expect(names).toContain('other');
      expect(names.length).toBe(2);
    });

    it('should return empty array if no events', () => {
      expect(emitter.eventNames()).toEqual([]);
    });
  });

  describe('maxListeners warning', () => {
    it('should warn when exceeding max listeners', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const limitedEmitter = new EventEmitter({ maxListeners: 5 });
      const listener = vi.fn();
      for (let i = 0; i < 6; i++) {
        limitedEmitter.on('test', listener);
      }
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

describe('Global EventEmitter', () => {
  beforeEach(() => {
    resetEventEmitter();
  });

  afterEach(() => {
    resetEventEmitter();
  });

  it('should share singleton instance', () => {
    const emitter1 = getEventEmitter();
    const emitter2 = getEventEmitter();
    expect(emitter1).toBe(emitter2);
  });

  it('should reset singleton', () => {
    const emitter1 = getEventEmitter();
    emitter1.on('test', () => {});
    resetEventEmitter();
    const emitter2 = getEventEmitter();
    expect(emitter2).not.toBe(emitter1);
    expect(emitter2.listenerCount('test')).toBe(0);
  });
});
