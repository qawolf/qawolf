import { signAccessToken } from "../server/services/access";

console.log(
  "test user token",
  signAccessToken(process.env.TEST_USER_ID, "1 day")
);
