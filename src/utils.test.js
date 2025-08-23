// Basic utility tests
describe('Basic Project Tests', () => {
  test('Math operations work correctly', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
  });

  test('String operations work correctly', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
    expect('test'.length).toBe(4);
  });

  test('Array operations work correctly', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});
