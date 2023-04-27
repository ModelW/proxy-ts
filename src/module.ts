import { defineNuxtModule, createResolver, addServerHandler } from "@nuxt/kit";
import { defu } from "defu";

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@model-w/proxy",
    configKey: "proxy",
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.proxy = defu(
      nuxt.options.runtimeConfig.public.proxy,
      options
    );

    // RegExp's have to be serialized, otherwise Nuxt is going to transform them into `{}`
    for (const filter of nuxt.options.runtimeConfig.public.proxy
      .filters as any[]) {
      for (const key of ["header", "method", "path"]) {
        if (filter[key] instanceof RegExp) {
          filter[key] = { regexp: filter[key].source };
        }
      }
    }

    const resolver = createResolver(import.meta.url);

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addServerHandler({
      handler: resolver.resolve("./runtime/server/middleware/proxy"),
    });
  },
});
