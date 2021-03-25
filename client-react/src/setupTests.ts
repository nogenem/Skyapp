// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

class LocalStorageMock {
  store: Record<string, string | null>;
  length: number;

  constructor() {
    this.store = {};
    this.length = 0;
  }

  getItem = (key: string) => this.store[key] || null;

  setItem = (key: string, value: string | null) => {
    this.store[key] = value;
    this.length++;
  };

  removeItem = (key: string) => {
    delete this.store[key];
    this.length--;
  };

  clear = () => {
    this.store = {};
    this.length = 0;
  };

  key = (index: number) => {
    return Object.keys(this.store)[index] || null;
  };
}

global.localStorage = new LocalStorageMock();
