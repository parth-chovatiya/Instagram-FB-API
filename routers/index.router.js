const KoaRouter = require("koa-router");
const router = new KoaRouter({ prefix: "/api/v1" });

const instraRouter = require("./instra.router");

// store all routes
const ROUTERS = [instraRouter];

ROUTERS.forEach((route) => {
  router.use(route.routes()).use(route.allowedMethods());
});

module.exports = router;
