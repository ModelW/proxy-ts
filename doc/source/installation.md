# Installation

You can install Model W Proxy in your project with the following command.

```shell
npm install @model-w/proxy
```

Then, configure the module in the `nuxt.config.ts` file. 
Here is a minimalistic example:

```typescript
export default defineNuxtConfig(
  {
    modules: [
        "@model-w/proxy"
    ],
    proxy: {
        apiURL: process.env.API_URL,
        backAlias: "back",
        cmsAlias: "cms"
    }
  }
)
```

The configuration options are the following:
- `apiURL` is the base URL of the API you would like to reach
- `backAlias` is the URL path prefix where requests should be making API calls (typically, something like `back` if your API resides under `http://example.org/back`)
- `cmsAlias` is the URL path prefix of the Wagtail CMS (typically, something like `cms`)

Once configuration is done, requests should be automatically proxied, independently of the client library used (fetch, axios...).
