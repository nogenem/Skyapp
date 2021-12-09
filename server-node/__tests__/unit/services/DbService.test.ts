import { openConnection, getConnection, closeConnection } from '~t/test-setup';

describe('DbService', () => {
  afterEach(async () => {
    await closeConnection();
  });

  it('should be able to connect to the database', async () => {
    const connection = await openConnection();

    expect(connection.readyState).toBe(1);
  });

  it('should be able to get the database connection', async () => {
    const connection = await openConnection();

    expect(getConnection()).toBe(connection);
  });

  it('should be able to close the database connection', async () => {
    let connection = await openConnection();

    expect(connection.readyState).toBe(1);

    connection = await closeConnection();

    expect(connection.readyState).toBe(0);
  });
});
