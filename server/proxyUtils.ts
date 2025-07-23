import { AttackMethod, Proxy, ProxyProtocol } from "./lib";

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_PROTOCOL: ProxyProtocol = "http";

const COMMON_PORTS: { [port: number]: ProxyProtocol } = {
  80: "http",
  443: "https",
  1080: "socks5",
  1081: "socks4",
  8080: "http",
  8443: "https",
};

/**
 * Parses a proxy string into a Proxy object.
 * Supports formats:
 * - `protocol://user:password@host:port`
 * - `protocol://host:port`
 * - `host:port`
 * - `host`
 */
export function parseProxy(proxyString: string): Proxy | null {
  if (!proxyString) {
    return null;
  }

  const hasProtocol = proxyString.includes('://');
  // Prepend a default protocol if none is present to satisfy the URL constructor.
  const parseUrl = hasProtocol ? proxyString : `http://${proxyString}`;

  try {
    const url = new URL(parseUrl);
    const proxy: Partial<Proxy> = {
      // Only use the protocol from the URL if it was originally present.
      protocol: hasProtocol ? url.protocol.replace(':', '') : undefined,
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : undefined,
      username: url.username || undefined,
      password: url.password || undefined,
    };
    // The normalizeProxy function will fill in the blanks.
    return normalizeProxy(proxy as Proxy);
  } catch (e) {
    console.error(`Failed to parse proxy string: ${proxyString}`, e);
    return null;
  }
}

const METHODS: { [key in AttackMethod]: ProxyProtocol[] } = {
  http_flood: ["http", "https", "socks4", "socks5"],
  http_bypass: ["http", "https", "socks4", "socks5"],
  http_slowloris: ["http", "https", "socks4", "socks5"],
  tcp_flood: ["socks4", "socks5"],
  minecraft_ping: ["http", "https", "socks4", "socks5"],
};

/**
 * Attempts to infer the protocol based on the port.
 */
function inferProtocol(port: number | undefined): ProxyProtocol {
  if (port !== undefined && COMMON_PORTS[port]) {
    return COMMON_PORTS[port];
  }
  return DEFAULT_PROTOCOL;
}

/**
 * Ensures a proxy object is safe and normalized by adding default values if missing.
 */
function normalizeProxy(proxy: Proxy): Proxy {
  const normalizedPort = proxy.port || DEFAULT_HTTP_PORT;
  const normalizedProtocol = proxy.protocol || inferProtocol(normalizedPort);

  return {
    ...proxy,
    port: normalizedPort,
    protocol: normalizedProtocol,
  };
}

/**
 * Filters proxies based on the attack method and ensures safe parsing of proxies.
 */
export function filterProxies(proxies: Proxy[], method: AttackMethod): Proxy[] {
  return proxies
    .map(normalizeProxy)
    .filter((proxy) => METHODS[method].includes(proxy.protocol));
}
