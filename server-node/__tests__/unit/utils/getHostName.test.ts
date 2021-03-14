import getHostName from '~/utils/getHostName';

describe('getHostName', () => {
  it('should return the host when passed `x-forwarded-proto` and `x-forwarded-host` headers', () => {
    const headers = {
      'x-forwarded-proto': 'http',
      'x-forwarded-host': 'www.test.com',
    };
    const host = getHostName(headers);

    expect(host).toBe('http://www.test.com');
  });

  it('should return the host when passed `referer` header', async () => {
    const headers = {
      referer: 'http://www.test.com/test',
    };
    const host = getHostName(headers);

    expect(host).toBe('http://www.test.com');
  });

  it('should return the `host` header with `http` at the start', async () => {
    const headers = {
      host: 'www.test.com',
    };
    const host = getHostName(headers);

    expect(host).toBe('http://www.test.com');
  });

  it('should return the `host` header with `https` at the start', async () => {
    const headers = {
      host: 'https://www.test.com',
    };
    const host = getHostName(headers);

    expect(host).toBe('https://www.test.com');
  });
});
