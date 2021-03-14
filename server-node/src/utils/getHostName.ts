interface IHeader {
  [x: string]: string | string[] | undefined;
}

export default (headers: IHeader): string => {
  if (headers['x-forwarded-host'])
    return `${headers['x-forwarded-proto']}://${headers['x-forwarded-host']}`;

  if (headers.referer) {
    const host = headers.referer as string;
    const url = new URL(host);
    return url.origin;
  }

  let { host } = headers;
  host = (host || '') as string;
  if (!host.startsWith('http')) host = `http://${host}`;
  return host;
};
