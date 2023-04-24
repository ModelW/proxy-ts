export default defineNuxtConfig({
  runtimeConfig: {},
  modules: ["../src/module"],
  proxy: {
    apiURL: "http://localhost:8000",
    backAlias: "back",
    cmsAlias: "cms",
  },
});
