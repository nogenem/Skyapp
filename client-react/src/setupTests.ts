// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { ReactNode } from 'react';
import * as reactI18next from 'react-i18next';

// this mock makes sure any components using the translate hook can use it without a warning being shown
jest.doMock('react-i18next', () => ({
  ...reactI18next,
  Trans: ({ children }: { children: ReactNode }) => children,
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        language: 'en-US',
      },
    };
  },
}));

const oldLocation = window.location;
delete (window as Partial<Window>).location;
window.location = { ...oldLocation, reload: jest.fn() };

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
