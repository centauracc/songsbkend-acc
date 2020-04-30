const request = require("supertest");
const app = require("./app");
const SongDb = require("./models/song.model");
const { teardownMongoose } = require("./tests/mongoose");

let songList;

describe("Songs", () => {
  afterAll(async () => await teardownMongoose());

  beforeEach(async () => {
    songList = [
      {
        id: 1,
        name: "Truly Madly Deeply",
        artist: "Savage Garden",
      },
      {
        id: 2,
        name: "My Heart Will Go On",
        artist: "Celine Dion",
      },
    ];
    await SongDb.create(songList);
  });

  afterEach(async () => {
    await SongDb.deleteMany();
  });

  test("GET /songs should display all songs", async () => {
    const expectedSongList = [
      {
        id: 1,
        name: "Truly Madly Deeply",
        artist: "Savage Garden",
      },
      {
        id: 2,
        name: "My Heart Will Go On",
        artist: "Celine Dion",
      },
    ];
    const { body: actualSongList } = await request(app)
      .get("/songs")
      .expect(200);
    expect(actualSongList).toMatchObject(expectedSongList);
  });

  test("GET /songs/1 should display the song with id 1", async () => {
    const expectedSong = {
      id: 1,
      name: "Truly Madly Deeply",
      artist: "Savage Garden",
    };
    const { body: actualSong } = await request(app).get("/songs/1").expect(200);
    expect(actualSong).toMatchObject(expectedSong);
  });

  test("POST /songs should require JSON content to be passed in", async () => {
    const newNonJsonSong = "notJson";
    await request(app).post("/songs").send(newNonJsonSong).expect(400);
  });

  test("POST /songs should reject the song if its name is less than 3 characters", async () => {
    const newSong = {
      name: "Ba",
      artist: "Janet Jackson",
    };
    await request(app).post("/songs").send(newSong).expect(400);
  });

  test("POST /songs should add a new song", async () => {
    const newSong = {
      name: "Black Or White",
      artist: "Michael Jackson",
    };
    const { body: actualSong } = await request(app)
      .post("/songs")
      .send(newSong)
      .expect(201);
    expect(actualSong).toMatchObject(newSong);
  });

  test("PUT /songs/1 should require JSON content to be passed in", async () => {
    const updatedNonJsonSong = "notJson";
    await request(app).put("/songs/1").send(updatedNonJsonSong).expect(400);
  });

  test("PUT /songs/1 should amend the details of the song with id 2", async () => {
    const updatedSong = {
      id: 2,
      name: "Love Takes Time",
      artist: "Mariah Carey",
    };
    const { body: actualSong } = await request(app)
      .put("/songs/2")
      .send(updatedSong)
      .expect(200);
    expect(actualSong).toMatchObject(updatedSong);
  });

  test("DELETE /songs/2 should remove the song with id 2", async () => {
    const deletedSong = {
      name: "My Heart Will Go On",
      artist: "Celine Dion",
    };
    const { body: actualSong } = await request(app)
      .delete("/songs/2")
      .send(deletedSong)
      .expect(200);
    expect(actualSong).toMatchObject(deletedSong);
  });
});
