import {
  Auth0Server,
  registerAuth0Instance,
} from "@auth0/auth0-react-router/server";

export const auth0 = new Auth0Server({});
registerAuth0Instance(auth0);
