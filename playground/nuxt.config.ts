export default defineNuxtConfig({
  runtimeConfig: {},
  modules: ["../src/module"],
  proxy: {
    context: ["/back", "/cms"],
    options: {
      target: process.env.API_URL,
      changeOrigin: true,
    },
    filters: [
      {
        header: /x-reach-api:.+/,
      },
      {
        path: "/back",
      },
      {
        path: "/cms",
      },
      {
        path: /^\/cms\/pages\/[^/]+\/edit\/preview\/$/,
        useProxy: false,
      },
      {
        path: /^\/cms\/pages\/add\/[^/]+\/[^/]+\/[^/]+\/preview\/$/,
        method: /HEAD|OPTIONS|GET/,
        useProxy: false,
      },
    ],
  },
});
