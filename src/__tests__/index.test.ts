import { greet } from '../index.js';

describe('CLI logic', () => {
  it('should format greeting correctly', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});
