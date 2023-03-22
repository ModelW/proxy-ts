## Proxy middleware

This proxy is designed to work together with the package from npm of ModelW called [axios](https://www.npmjs.com/package/@model-w/axios)
They are going to work together in the runtime and lifecycle of Nuxt3 application to make the redirections necessary to make available to render
Vue3 files inside Wagtail Django Framework

```bash
npm i @model-w/proxy
```

## Installation
To set up this proxy we need to add the proxy to the `nuxt.config.ts` inside the module array:

```typescript
    module: ["@model-w/proxy"]
```

With all these set up it must be working and redirecting all the stuff necessary to render Vue templates.
