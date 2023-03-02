## Proxy middleware

This proxy is designed to work together with the package from npm of ModelW called [axios](https://www.npmjs.com/package/@model-w/axios)
They are going to work together in the runtime and lifecycle of Nuxt3 application to make the redirections necessary to make available to render
Vue3 files inside Wagtail Django Framework

```bash
npm i @model-w/axios
```

## Installation
To set up this proxy we have to declare a middleware folder inside the server folder of nuxt and then inside,
declare the next structure.
```vue
import proxyEventHandler from "@model-w/proxy-ts"
import { createProxyMiddleware } from "http-proxy-middleware";

export default defineEventHandler(
    (event) => {
        const config = useRuntimeConfig();
        const proxy = createProxyMiddleware(
            ["/back", "/cms"],
            {
                target: config.apiURL,
                changeOrigin: true,
            }
        );
        proxyEventHandler(config, event, proxy)
    }
);


```

With all these set up it must be working and redirecting all the stuff necessary to render Vue templates.
