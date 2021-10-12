import { Response } from 'express';
import { Result } from 'express-validator';

import { User } from '~/models';
import { CustomError } from '~/utils/errors';
import handleErrors from '~/utils/handleErrors';

import { setupDB } from '../../test-setup';

interface IMockResponse extends Response {
  json: jest.Mock;
}

describe('handleErrors', () => {
  setupDB();

  it('should send an object with errors when passed a CustomError', () => {
    const resMock: IMockResponse = {
      status: function status() {
        return this;
      },
      json: jest.fn(),
    } as unknown as IMockResponse;
    const error = new CustomError({ global: 'test' });

    handleErrors(error, resMock);

    expect(resMock.json.mock.calls.length).toBe(1);
    const { errors } = resMock.json.mock.calls[0][0];
    expect(errors).toBeTruthy();
    expect(Object.keys(errors).length >= 1).toBe(true);
  });

  it("should send an object with errors when passed a validator's Result", () => {
    const resMock: IMockResponse = {
      status: function status() {
        return this;
      },
      json: jest.fn(),
    } as unknown as IMockResponse;
    const error = new Result(
      err => err,
      [{ param: 'foo', msg: 'bar', location: 'body', value: 'foo' }],
    );

    handleErrors(error, resMock);

    expect(resMock.json.mock.calls.length).toBe(1);
    const { errors } = resMock.json.mock.calls[0][0];
    expect(errors).toBeTruthy();
    expect(Object.keys(errors).length >= 1).toBe(true);
  });

  it('should send an object with errors when an invalid _id is used', async () => {
    const resMock: IMockResponse = {
      status: function status() {
        return this;
      },
      json: jest.fn(),
    } as unknown as IMockResponse;

    try {
      await User.findOne({ _id: '1234' });
    } catch (err) {
      handleErrors(err as Error, resMock);
    }

    expect(resMock.json.mock.calls.length).toBe(1);
    const { errors } = resMock.json.mock.calls[0][0];
    expect(errors).toBeTruthy();
    expect(errors.global).toBeTruthy();
  });

  it('should send an object with errors when an error occurs on Mongoose', async () => {
    const resMock: IMockResponse = {
      status: function status() {
        return this;
      },
      json: jest.fn(),
    } as unknown as IMockResponse;

    try {
      await User.create({});
    } catch (err) {
      handleErrors(err as Error, resMock);
    }

    expect(resMock.json.mock.calls.length).toBe(1);
    const { errors } = resMock.json.mock.calls[0][0];
    expect(errors).toBeTruthy();
    expect(errors.email).toBeTruthy();
  });

  it('should send an object with errors in other cases', async () => {
    const resMock: IMockResponse = {
      status: function status() {
        return this;
      },
      json: jest.fn(),
    } as unknown as IMockResponse;
    const error = new Error('test');

    handleErrors(error, resMock);

    expect(resMock.json.mock.calls.length).toBe(1);
    const { errors } = resMock.json.mock.calls[0][0];
    expect(errors).toBeTruthy();
    expect(errors.global).toBeTruthy();
  });
});
