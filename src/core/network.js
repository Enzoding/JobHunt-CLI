import net from 'node:net';

const PROXY_ENV_VARS = ['HTTPS_PROXY', 'HTTP_PROXY', 'https_proxy', 'http_proxy'];
const PROXY_MODE_ENV_VAR = 'JOBHUNT_PROXY';
const PROXY_PROBE_TIMEOUT_MS = 800;
const DIRECT_PROXY_VALUES = new Set(['0', 'false', 'off', 'direct', 'none', 'no']);
const ALWAYS_PROXY_VALUES = new Set(['1', 'true', 'on', 'always', 'proxy', 'strict', 'force']);

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
let _proxyMode = 'auto';
let _proxyReachable = null;
let _proxyProbeError = null;
let _proxyBypassed = false;
let _fetchContextInstalled = false;
let _directDispatcher = null;

export function setDebugMode(enabled) {
  _debugMode = enabled;
}

export function getNetworkInfo() {
  return {
    proxyEnabled: _proxyInfo !== null && _proxySupported,
    proxySupported: _proxySupported,
    proxyVar: _proxyInfo?.key ?? null,
    proxyUrl: _proxyInfo?.value ?? null,
    proxyMode: _proxyMode,
    proxyReachable: _proxyReachable,
    proxyProbeError: _proxyProbeError,
    proxyBypassed: _proxyBypassed,
    noProxy: process.env.NO_PROXY || process.env.no_proxy || null,
    initError: _proxyError,
  };
}

function normalizeProxyMode(value) {
  const normalized = String(value || 'auto').trim().toLowerCase();
  if (DIRECT_PROXY_VALUES.has(normalized)) return 'direct';
  if (ALWAYS_PROXY_VALUES.has(normalized)) return 'always';
  return 'auto';
}

function getProxyMode() {
  return normalizeProxyMode(process.env[PROXY_MODE_ENV_VAR]);
}

function proxyEndpoint(proxyUrl) {
  try {
    const parsed = new URL(proxyUrl);
    if (!parsed.hostname) return null;
    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
    return {
      host: parsed.hostname,
      port: Number(port),
    };
  } catch {
    return null;
  }
}

function probeTcp({ host, port }, timeoutMs = PROXY_PROBE_TIMEOUT_MS) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port });
    let settled = false;

    function finish(ok, error = '') {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, error });
    }

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false, `timed out after ${timeoutMs}ms`));
    socket.once('error', error => finish(false, error.message));
  });
}

function installFetchErrorContext() {
  if (_fetchContextInstalled || typeof globalThis.fetch !== 'function') return;
  const nativeFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async function fetchWithRequestContext(input, init) {
    try {
      return await nativeFetch(input, init);
    } catch (error) {
      attachRequestUrl(error, input);
      if (_proxyMode === 'auto' && _proxySupported && _directDispatcher && isConnectError(error) && !init?.dispatcher) {
        if (_debugMode) {
          process.stderr.write('[network] proxy request failed; retrying once with direct connection\n');
        }
        try {
          return await nativeFetch(input, { ...init, dispatcher: _directDispatcher });
        } catch (directError) {
          attachRequestUrl(directError, input);
          directError.proxyError = error;
          throw directError;
        }
      }
      throw error;
    }
  };
  _fetchContextInstalled = true;
}

function attachRequestUrl(error, input) {
  if (error.requestUrl) return;
  if (typeof input === 'string' || input instanceof URL) {
    error.requestUrl = String(input);
  } else if (input?.url) {
    error.requestUrl = input.url;
  }
}

function isConnectError(error) {
  return (
    error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
    error?.cause?.code === 'ECONNREFUSED' ||
    error?.cause?.code === 'ENOTFOUND' ||
    error?.cause?.message?.includes('Connect Timeout') ||
    error?.message?.includes('fetch failed')
  );
}

export async function initNetwork() {
  installFetchErrorContext();
  _proxyMode = getProxyMode();
  const detected = detectProxyEnv();
  if (_proxyMode === 'direct') {
    if (_debugMode && detected) {
      process.stderr.write(`[network] proxy env detected via ${detected.key}, ignored because ${PROXY_MODE_ENV_VAR}=direct\n`);
    } else if (_debugMode) {
      process.stderr.write('[network] direct mode enabled, using direct connection\n');
    }
    return;
  }
  if (!detected) {
    if (_debugMode) process.stderr.write('[network] no proxy environment variables detected, using direct connection\n');
    return;
  }
  _proxyInfo = detected;

  if (_proxyMode === 'auto') {
    const endpoint = proxyEndpoint(detected.value);
    if (endpoint) {
      const probe = await probeTcp(endpoint);
      _proxyReachable = probe.ok;
      _proxyProbeError = probe.error || null;
      if (!probe.ok) {
        _proxyBypassed = true;
        if (_debugMode) {
          process.stderr.write(`[network] proxy env detected via ${detected.key}=${detected.value}\n`);
          process.stderr.write(`[network] proxy endpoint ${endpoint.host}:${endpoint.port} is unreachable: ${probe.error}\n`);
          process.stderr.write('[network] auto mode will use direct connection; set JOBHUNT_PROXY=always to force proxy\n');
        }
        return;
      }
    }
  }

  try {
    const { Agent, EnvHttpProxyAgent, setGlobalDispatcher } = await import('undici');
    const agent = new EnvHttpProxyAgent();
    _directDispatcher = new Agent();
    setGlobalDispatcher(agent);
    _proxySupported = true;
    if (_debugMode) {
      const noProxy = process.env.NO_PROXY || process.env.no_proxy || '(none)';
      process.stderr.write(`[network] proxy enabled via ${detected.key}=${detected.value} (${PROXY_MODE_ENV_VAR}=${_proxyMode})\n`);
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
  if (!isConnectError(error)) return null;

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
    if (error.proxyError) lines.push('Proxy request failed first; direct fallback also failed');
    if (info.noProxy) lines.push(`NO_PROXY=${info.noProxy}`);
    lines.push(`Suggestion: verify proxy is reachable, check NO_PROXY settings, or run with ${PROXY_MODE_ENV_VAR}=direct if direct access works`);
  } else if (info.proxyBypassed) {
    lines.push(`Proxy env detected but bypassed: ${info.proxyVar}=${info.proxyUrl}`);
    if (info.proxyProbeError) lines.push(`Proxy probe failed: ${info.proxyProbeError}`);
    lines.push(`Suggestion: start the proxy, fix the proxy URL, or set ${PROXY_MODE_ENV_VAR}=always if this host must use the proxy`);
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
