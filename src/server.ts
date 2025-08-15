import { Elysia } from "elysia";
import { sessionRoutes } from "./routes/session"
import { pickRoutes } from "./routes/pick";
import { authRoutes } from "./routes/auth";


const app = new Elysia();

app.get("/", () => "Hello Elysia").listen(3000);

app.use(sessionRoutes);
app.use(pickRoutes);
app.use(authRoutes);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
