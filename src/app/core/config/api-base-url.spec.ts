import { resolveApiBaseUrl } from './api-base-url';

describe('resolveApiBaseUrl', () => {
  it('uses the runtime override when it is provided', () => {
    const apiBaseUrl = resolveApiBaseUrl({
      __env: {
        apiBaseUrl: 'https://api.example.com/'
      }
    });

    expect(apiBaseUrl).toBe('https://api.example.com');
  });

  it('uses the meta tag value when runtime override is absent', () => {
    const apiBaseUrl = resolveApiBaseUrl({
      document: {
        querySelector: (selector: string) =>
          selector === 'meta[name="api-base-url"]'
            ? {
                getAttribute: (name: string) => (name === 'content' ? 'https://meta.example.com/api/' : null)
              }
            : null
      }
    });

    expect(apiBaseUrl).toBe('https://meta.example.com/api');
  });

  it('falls back to the local backend port during local development', () => {
    const apiBaseUrl = resolveApiBaseUrl({
      location: {
        origin: 'http://localhost:4200',
        protocol: 'http:',
        hostname: 'localhost'
      }
    });

    expect(apiBaseUrl).toBe('http://localhost:8080');
  });

  it('uses the current origin for deployed environments', () => {
    const apiBaseUrl = resolveApiBaseUrl({
      location: {
        origin: 'https://sms.example.com',
        protocol: 'https:',
        hostname: 'sms.example.com'
      }
    });

    expect(apiBaseUrl).toBe('https://sms.example.com');
  });
});
