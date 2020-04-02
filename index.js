const Koa = require("koa");
const bodyparser = require("koa-bodyparser");
const cors = require("koa-cors");

const routes = require("./routes");

const app = new Koa();
const port = process.env.PORT || 4000;

app.use(bodyparser());
app.use(cors());

routes.forEach((r) => app.use(r));
console.log(routes.length);

app.listen(port);
console.log("RESTful API server started on: " + port);
