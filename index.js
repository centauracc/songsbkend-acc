const app = require("./app");
const PORT = process.env.PORT || 3000;

require("./utils/db");

const server = app.listen(PORT, () => {
  console.log(`Express server started on http://localhost:${PORT}`);
});
