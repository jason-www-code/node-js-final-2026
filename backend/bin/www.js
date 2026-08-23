const app = require("../app");
const config = require("../config/index");
const { dataSource } = require("../db/data-source");

async function init() {
  try {
    await dataSource.initialize();
    console.log("資料庫連線成功 !");

    const port = config.getEnv("web.port");
    const domain = config.getEnv("db.host");

    app.listen(port, () => {
      console.log(`伺服器建立成功 ! 請使用 ${domain}:${port} 開啟`);
    });
  } catch (error) {
    console.error("資料庫連線失敗 !", error);
    process.exit(1);
  }
}

init();
