import EasyPostClient from "@easypost/api";
import dotenv from "dotenv";

dotenv.config();

if(!process.env.EASYPOST_API_KEY){
    throw new Error("Easypost API Key Not Found!")
}

const easypost = new EasyPostClient(process.env.EASYPOST_API_KEY);

export default easypost;