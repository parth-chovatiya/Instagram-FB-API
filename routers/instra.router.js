const KoaRouter = require("koa-router");
const { fetchId } = require("../controllers/instra.controller");

const router = new KoaRouter();

router.get("/fetchId", fetchId);

module.exports = router;
