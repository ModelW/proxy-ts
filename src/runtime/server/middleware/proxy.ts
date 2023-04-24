import { useRuntimeConfig } from "#imports";
import { createProxyMiddleware } from "http-proxy-middleware";
import { defineEventHandler } from "h3";

/**
 * This function decides if a request should be proxied to the API or not. Which
 * is:
 *
 * - When the request has the X-Reach-API header (aka the front-end is trying to
 *   directly reach the API)
 * - When the request is directed at /back
 * - When the request is directed at /cms
 * - Unless it's a forbidden pattern (aka a Wagtail preview page, which we want
 *   to render on Nuxt side like a regular CMS page, even though it's within the
 *   admin)
 * - Unless (lol) it's a POST request, in which case we want it to go through
 *   the proxy because that's how Wagtail communicates the content of its
 *   previews
 *
 * An optimization in production is to configure the load balancer to always
 * send requests targeting /back to the API.
 */
const config = useRuntimeConfig();

function getFromApi(path: string, req: any) {
  if (req.headers["x-reach-api"]) {
    return true;
  }

  const prefixes = [config.backAlias, config.cmsAlias].join("|");

  if (!path.match(new RegExp(`^/(${prefixes})(/|$)`))) {
    return false;
  }

  const previewEditRegex = new RegExp(
    `^/${config.cmsAlias}/pages/[^/]+/edit/preview/$`
  );
  const previewAddRegex = new RegExp(
    `^/${config.cmsAlias}/pages/add/[^/]+/[^/]+/[^/]+/preview/$`
  );

  const isPreviewEdit = previewEditRegex.test(path);
  const isPreviewAdd = previewAddRegex.test(path);
  const isPreview = isPreviewEdit || isPreviewAdd;

  return !(isPreview && ["HEAD", "OPTIONS", "GET"].includes(req.method));
}

const proxy = createProxyMiddleware(
  ["/" + config.public.proxy.backAlias, "/" + config.public.proxy.cmsAlias],
  {
    target: config.public.proxy.apiURL,
    changeOrigin: true,
  }
);

export default defineEventHandler(
  (event) =>
    new Promise((resolve, reject) => {
      const dummyUrl = new URL("http://localhost" + event.path);
      const path = dummyUrl.pathname;

      if (getFromApi(path, event.node.req)) {
        // @ts-ignore
        proxy(event.node.req, event.node.res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(undefined);
          }
        });
      } else {
        // Sending undefined is the only way for things to proceed smoothly
        // Sending null or anything else doesn't work
        resolve(undefined);
      }
    })
);
