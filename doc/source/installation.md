# Installation

You can install Model W Proxy in your project with the following command.

```shell
npm install @model-w/proxy
```

Then, configure the module in the `nuxt.config.ts` file.
Here is a minimalistic example:

```typescript
export default defineNuxtConfig({
  modules: ["@model-w/proxy"],
  proxy: {
    options: {
      target: process.env.API_URL,
    },
    forwardHost: true,
    filters: [
      {
        header: /x-reach-api:.+/,
      },
      {
        path: /^\/proxy-me-please\/but-not-this-specific-path/,
        useProxy: false,
      },
      {
        path: "/proxy-me-please",
      },
    ],
  },
});
```

This module uses [`http-proxy-middleware`](https://github.com/chimurai/http-proxy-middleware/) under the hood.

The `options` configuration point are passed directly to the underlying `createProxyMiddleware()` call.
Note that because Nuxt serializes and deserializes configuration options, setting functions will have no effect.
Therefore, specifying `onProxyReq()` or any other function supported by `http-proxy-middleware` will have no effect.

The `forwardHost` option automatically sets the `x-forwarded-host` header.

The `filters` configuration allows for deciding what to proxy, and what not to proxy.
Each filter can specify one or more of these options:
- `header`: tested against all headers of the request, in the usual `x-some-option: some-value` form
- `method`: filters requests using a specific HTTP verb (`GET`, `POST`...)
- `path`: filters requests depending on their path
- `useProxy`: `true` by default; when set to `false`, the filter will exclude requests from being proxied

Requests match a filter only if they match all of its options independently.
Every outbound request is tested against each filter in the order they are defined; the first matching filter is used to determine whether the request should be proxied or not, and the rest are skipped.
If no filters were matched, the request will not be proxied.
