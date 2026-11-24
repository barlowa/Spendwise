import {
  index,
  layout,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/login", "features/auth/login.tsx"),
  index("features/index.tsx"),

  layout("features/auth/layout.tsx", [
    route("auth/*", "features/auth/auth.$.tsx"),
    route("home", "features/home/index.tsx"),
    route("profile", "features/profile/index.tsx"),
    route("transactions", "features/transactions/index.tsx"),
  ]),
] satisfies RouteConfig;
