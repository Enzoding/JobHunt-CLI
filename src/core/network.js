const PROXY_ENV_VARS = ['HTTPS_PROXY', 'HTTP_PROXY', 'https_proxy', 'http_proxy'];

function detectProxyEnv() {
  for (const key of PROXY_ENV_VARS) {
    if (process.env[key]) return { key, value: process.env[key] };
  }
  return null;
}

let _debugMode = false;
let _proxyInfo = null;
let _proxySupported = false;
let _proxyError = null;

export function setDebugMode(enabled) {
  _debugMode = enabled;
}

export function getNetworkInfo() {
  return {
    proxyEnabled: _proxyInfo !== null && _proxySupported,
    proxySupported: _proxySupported,
    proxyVar: _proxyInfo?.key ?? null,
    proxyUrl: _proxyInfo?.value ?? null,
    noProxy: process.env.NO_PROXY || process.env.no_proxy || null,
    initError: _proxyError,
  };
}

export async function initNetwork() {
  const detected = detectProxyEnv();
  if (!detected) {
    if (_debugMode) process.stderr.write('[network] no proxy environment variables detected, using direct connection\n');
    return;
  }
  _proxyInfo = detected;

  try {
    const { EnvHttpProxyAgent, setGlobalDispatcher } = await import('undici');
    const agent = new EnvHttpProxyAgent();
    setGlobalDispatcher(agent);
    _proxySupported = true;
    if (_debugMode) {
      const noProxy = process.env.NO_PROXY || process.env.no_proxy || '(none)';
      process.stderr.write(`[network] proxy enabled via ${detected.key}=${detected.value}\n`);
      process.stderr.write(`[network] NO_PROXY=${noProxy}\n`);
    }
  } catch (e) {
    _proxyError = e.message;
    if (_debugMode) {
      process.stderr.write(`[network] WARN: proxy env detected but undici unavailable: ${e.message}\n`);
      process.stderr.write('[network] falling back to direct connection (may fail behind proxy)\n');
      process.stderr.write('[network] suggestion: upgrade to Node.js >=21 or install undici dependency\n');
    }
  }
}

export function formatNetworkError(error, url) {
  const info = getNetworkInfo();
  const isConnectError =
    error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
    error?.cause?.code === 'ECONNREFUSED' ||
    error?.cause?.code === 'ENOTFOUND' ||
    error?.cause?.message?.includes('Connect Timeout') ||
    error?.message?.includes('fetch failed');

  if (!isConnectError) return null;

  const host = (() => {
    try {
      return url ? new URL(String(url)).host : '(unknown)';
    } catch {
      return String(url);
    }
  })();

  const lines = [`Network request failed: unable to connect to ${host}`];

  if (info.proxyEnabled) {
    lines.push(`Proxy in use: ${info.proxyVar}=${info.proxyUrl}`);
    if (info.noProxy) lines.push(`NO_PROXY=${info.noProxy}`);
    lines.push('Suggestion: verify proxy is reachable or check NO_PROXY settings');
  } else if (detectProxyEnv() && !info.proxySupported) {
    lines.push(`Proxy env detected: ${detectProxyEnv()?.key}=${detectProxyEnv()?.value}`);
    lines.push('Proxy support unavailable: undici module could not be loaded');
    if (info.initError) lines.push(`Error: ${info.initError}`);
    lines.push('Suggestion: upgrade to Node.js >=21 or run: npm install undici');
  } else {
    lines.push('Suggestion: check network connectivity or set HTTP_PROXY/HTTPS_PROXY if behind a proxy');
  }

  return lines.join('\n');
}

export { detectProxyEnv };
