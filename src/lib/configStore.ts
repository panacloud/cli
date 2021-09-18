const Configstore = require("configstore");
const fs = require("fs");
import axios from "axios";
const { dotenv } = require("../index");

export const isLogin = async (): Promise<boolean> => {
  const config = new Configstore("panacloud");
  try {
    if (fs.existsSync(config.path)) {
      const tokenFile = JSON.parse(fs.readFileSync(config.path));
      const { data } = await axios.get(process.env.API_ENDPOINT!, {
        headers: { Authorization: `Bearer ${tokenFile.token}` },
      });
      if (data?.Message) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
