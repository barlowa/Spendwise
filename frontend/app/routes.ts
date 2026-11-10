import {
  index,
  layout,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/login", "routes/login.tsx"),

  layout("routes/auth/layout.tsx", [
    index("routes/index.tsx"),
    route("auth/*", "routes/auth/auth.$.tsx"),
    route("home", "routes/home.tsx"),
    route("profile", "routes/profile.tsx"),
    route("my-transactions", "routes/transactions.tsx"),
  ]),
] satisfies RouteConfig;
