import { greet } from '../index.js';
import { describe, expect, it } from '@jest/globals';

describe('CLI logic', () => {
  it('should format greeting correctly', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});