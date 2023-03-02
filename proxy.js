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
function getFromApi(path, req) {
    if (req.headers["x-reach-api"]) {
        return true;
    }
    let prefixes = ["cms", "back"].join("|");
    if (!path.match(new RegExp("^/(".concat(prefixes, ")(/|$)")))) {
        return false;
    }
    let isPreviewEdit = /^\/cms\/pages\/[^/]+\/edit\/preview\/$/.test(path);
    let isPreviewAdd = /^\/cms\/pages\/add\/[^/]+\/[^/]+\/[^/]+\/preview\/$/.test(path);
    let isPreview = isPreviewEdit || isPreviewAdd;
    return !(isPreview && ["HEAD", "OPTIONS", "GET"].includes(req.method));
}
function proxyEventHandler(config, event, proxy) {
    let dummyUrl = new URL(config.apiURL + event.path);
    let path = dummyUrl.pathname;
    return new Promise(function (resolve, reject) {
        if (getFromApi(path, event.node.req)) {
            // @ts-ignore
            proxy(event.node.req, event.node.res, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(undefined);
                }
            });
        }
        else {
            // Sending undefined is the only way for things to proceed smoothly
            // Sending null or anything else doesn't work
            resolve(undefined);
        }
    });
}
export default proxyEventHandler;
