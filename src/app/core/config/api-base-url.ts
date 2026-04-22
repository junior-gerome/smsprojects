type MetaElementLike = {
  getAttribute(name: string): string | null;
};

type RuntimeDocumentLike = {
  querySelector(selector: string): MetaElementLike | null;
};

type RuntimeLocationLike = {
  origin: string;
  protocol: string;
  hostname: string;
};

type RuntimeConfigLike = {
  apiBaseUrl?: string;
};

type RuntimeLike = {
  __env?: RuntimeConfigLike;
  document?: RuntimeDocumentLike;
  location?: RuntimeLocationLike;
};

const DEFAULT_API_PORT = '8080';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function readMetaApiBaseUrl(runtime: RuntimeLike): string | null {
  const metaValue = runtime.document
    ?.querySelector('meta[name="api-base-url"]')
    ?.getAttribute('content')
    ?.trim();

  return metaValue ? normalizeUrl(metaValue) : null;
}

export function resolveApiBaseUrl(runtime: RuntimeLike = globalThis as RuntimeLike): string {
  const configuredUrl = runtime.__env?.apiBaseUrl?.trim() || readMetaApiBaseUrl(runtime);
  if (configuredUrl) {
    return normalizeUrl(configuredUrl);
  }

  const location = runtime.location;
  if (!location) {
    return `http://localhost:${DEFAULT_API_PORT}`;
  }

  if (LOCAL_HOSTNAMES.has(location.hostname)) {
    return `${location.protocol}//${location.hostname}:${DEFAULT_API_PORT}`;
  }

  return normalizeUrl(location.origin);
}
