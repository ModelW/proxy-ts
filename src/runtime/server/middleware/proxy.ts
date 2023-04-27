import { useRuntimeConfig } from "#imports";
import { createProxyMiddleware } from "http-proxy-middleware";
import { defineEventHandler } from "h3";

const config = useRuntimeConfig();
const proxy = createProxyMiddleware(
  // @ts-ignore
  (pathname, req) => shouldUseProxy(req.headers, req.method, pathname),
  config.public.proxy.options
);

export default defineEventHandler(
  (event) =>
    new Promise((resolve, reject) => {
      // @ts-ignore
      proxy(event.node.req, event.node.res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    })
);

/**
 * This function determines whether requests should go through the proxy,
 * according to whatever filters have been set up in the project.
 * Filters are checked in the order they are defined, and the first match
 * decides if the proxy is going to be used or not.
 * @param headers The request headers
 * @param method The request HTTP verb
 * @param path The request path
 */
function shouldUseProxy(
  headers: Record<string, any>,
  method: string,
  path: string
): boolean {
  const headersList = [];
  const filters = config.public.proxy.filters as any[];

  // If no filters are present, go through the proxy by default
  if (!filters || filters.length === 0) {
    return true;
  }

  for (const key of Object.keys(headers)) {
    headersList.push(`${key}: ${headers[key]}`);
  }

  for (const filter of filters) {
    if (
      filter.header &&
      !headersList.find((h) => isTesterMatching(filter.header, h))
    ) {
      continue;
    }

    if (filter.method && !isTesterMatching(filter.method, method)) {
      continue;
    }

    if (
      filter.path &&
      !isTesterMatching(filter.path, path, (testValue, actualValue) =>
        actualValue.startsWith(testValue)
      )
    ) {
      continue;
    }

    return filter.useProxy ?? true;
  }

  // If filters were specified, but none matched the current request, the proxy should be skipped
  return false;
}

function isTesterMatching(
  testValue: string | { regexp: string },
  actualValue: string,
  compareStrings = (testValue: string, actualValue: string) =>
    testValue === actualValue
): boolean {
  return typeof testValue === "string"
    ? compareStrings(testValue, actualValue)
    : new RegExp(testValue.regexp).test(actualValue);
}
