const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const router = require("./routers/index.router");

const app = new Koa();
app.use(bodyParser());

app.use(async (ctx, next) => {
  ctx.body = "API running";
  await next();
});

router.get("/", (ctx) => {
  ctx.body = "Hello World...";
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server is running at port: ", PORT);
});
