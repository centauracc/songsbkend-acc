const User = require("./models/user.model");
const userData = require("./data/testUserData");
const request = require("supertest");
const app = require("./app");
const teardownMongoose = require("./tests/mongoose");

const jwt = require("jsonwebtoken");
jest.mock("jsonwebtoken");

describe("users.route", () => {
  let signedInAgent;

  afterAll(async () => await teardownMongoose());

  beforeEach(async () => {
    await User.create(userData);
    signedInAgent = request.agent(app);
    await signedInAgent.post("/users/login").send(userData[0]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await User.deleteMany();
  });

  describe("/users", () => {
    test("POST /users should return new user", async () => {
      const expectedUser = {
        username: "newUser",
        password: "12345678",
      };
      const { body: actualUser } = await request(app)
        .post("/users")
        .send(expectedUser)
        .expect(200);
      expect(actualUser.username).toEqual(expectedUser.username.toLowerCase());
      expect(actualUser.password).not.toBe(expectedUser.password);
    });

    test("GET /users/:username should return user info when login as correct user", async () => {
      const userIndex = 0;
      const { password, ...expectedUserInfo } = userData[userIndex];
      const expectedUsername = userData[userIndex].username;

      jwt.verify.mockReturnValueOnce({
        username: expectedUsername,
      });

      // const { body: actualUser } = await request(app)
      //   .get(`/users/${expectedUsername}`)
      //   .set("Cookie", "token=valid-token")
      //   .expect(200);
      const { body: actualUser } = await signedInAgent
        .get(`/users/${expectedUsername}`)
        .set("Cookie", "token=valid-token")
        .expect(200);
      // expect(jwt.verify).toBeCalledTimes(1);
      expect(actualUser).toMatchObject(expectedUserInfo);
    });

    test("GET /users/:username should return 401 when token is invalid", async () => {
      const expectedUsername = userData[0].username;

      jwt.verify.mockImplementationOnce(() => {
        throw new Error("token not valid");
      });

      const { body: error } = await signedInAgent
        .get(`/users/${expectedUsername}`)
        .set("Cookie", "token=invalid-token")
        .expect(401);
      expect(jwt.verify).toBeCalledTimes(1);
    });

    test("GET /users/:username should return 403 when viewing profile of anyone except yourself", async () => {
      const userIndex = 0;
      const { password, ...expectedUserInfo } = userData[userIndex];
      const expectedUsername = userData[userIndex].username;

      const anotherUsername = userData[1].username;

      jwt.verify.mockReturnValueOnce({
        username: expectedUsername,
      });

      const { body: text } = await signedInAgent
        .get(`/users/${anotherUsername}`)
        .set("Cookie", "token=valid-token")
        .expect(403);
      expect(text).toEqual({
        message: "You are not authorised to view others",
      });
    });

    test("GET /users/:username should return 404 when viewing profile of non-existent user", async () => {
      const userIndex = 0;
      const { password, ...expectedUserInfo } = userData[userIndex];
      const expectedUsername = userData[userIndex].username;

      const anotherUsername = "iDoNotExist";

      jwt.verify.mockReturnValueOnce({
        username: expectedUsername,
      });

      const { body: text } = await signedInAgent
        .get(`/users/${anotherUsername}`)
        .set("Cookie", "token=valid-token")
        .expect(404);
      expect(text).toEqual({
        message: "User does not exist",
      });
    });

    test("POST /users/login should allow user to sign in if password is correct", async () => {
      const expectedUser = userData[0];

      const { text } = await request(app)
        .post("/users/login")
        .send(expectedUser)
        .expect(200);
      expect(text).toEqual("You are now logged in!");
    });

    test("POST /users/login should not allow user to sign in if password is incorrect", async () => {
      const expectedUser = {
        username: userData[0].username,
        password: "abcd1234",
      };

      const { body } = await request(app)
        .post("/users/login")
        .send(expectedUser)
        .expect(404);
      expect(body).toEqual({ message: "Invalid password!" });
    });

    test("POST /users/login should not allow user to sign in if username is not found", async () => {
      const expectedUser = {
        username: "dick",
        password: userData[0].password,
      };

      const { body } = await request(app)
        .post("/users/login")
        .send(expectedUser)
        .expect(404);
      expect(body).toEqual({ message: "User not found!" });
    });

    test("POST /users/logout should allow user to sign out and clear cookie", async () => {
      // const response = await request(app).post("/users/logout").expect(200);
      const response = await signedInAgent.post("/users/logout").expect(200);
      expect(response.text).toBe("You are now logged out");
      expect(response.headers["set-cookie"][0]).toMatch(/^token=;/);
    });
  });
});
