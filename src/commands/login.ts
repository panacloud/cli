import { Command, flags } from "@oclif/command";
import { isLogin } from "../lib/configStore";
import { startSpinner, stopSpinner } from "../lib/spinner";
const express = require("express");
const open = require("open");
const ConfigStore = require("configstore");
const { dotenv } = require("../index");

export default class Login extends Command {
  static description = "Login into your Panacloud Portal Account";
  async run() {
    const loginSpinner = startSpinner(
      "Logging into you Panacloud Panacloud Portal Account..."
    );

    // Check if user is logged in or not
    const login = await isLogin();
    if (login) {
      stopSpinner(loginSpinner, "You are already logged in", true);
      process.exit(1);
    }

    const app = express();
    const port = process.env.PORT;

    const config = new ConfigStore("panacloud", {
      id: "",
      token: "",
    });

    app.use(express.json());

    app.use((req: any, res: any, next: any) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      next();
    });

    const ExpressServer = async () => {
      const server = await app.listen(port);

      app.post("/oauth", (req: any, res: any) => {
        const { id, token } = req.body;
        config.set("id", id);
        config.set("token", token);
        res.send(`Credentials Received`);
        stopSpinner(loginSpinner, "Logged in", false);
        server.close();
      });
    };

    await ExpressServer();

    await open(`https://beta.panacloud.com/authenticate`);
  }
}
