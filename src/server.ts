import express, { Application } from "express";
import * as swagger from "swagger-ui-express";
import cors from "cors";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import * as dotenv from "dotenv";
import { CronJobs } from "./cronJobs";
import { Config } from "./common/config";
import { ExampleRouter } from "./routers/ExampleRouter";
import swaggerDocs from "../swagger/swagger.json";
import { BackoffStrategy, retry } from "./utils/RetryUtils";
import { setup } from "./common/connections/SetupWallet";
import { providerManager } from "./utils/solana/RpcUtils";

dotenv.config();

const limitMs = Number(process.env.LIMIT_MS ?? 60 * 1000);
const limitRequest = Number(process.env.LIMIT_REQUEST ?? 100);

const limiter = rateLimit({
    windowMs: limitMs,
    limit: limitRequest,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

class Server {
    public app: Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.configSwagger();
    }

    public config(): void {
        this.app.set("port", process.env.PORT || 8000);
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(compression());
        this.app.use(cors());
        this.app.use(limiter);
        this.app.set("trust proxy", 2);

        const myStream = {
            write: (text: any) => {
                console.log(text);
            },
        };
        this.app.use(morgan(":remote-addr :method :url :status :response-time ms - :res[content-length]", { stream: myStream }));
    }

    public routes(): void {
        this.app.get("/ping", async (req, res) => {
            res.send("Hello World!");
        });
        this.app.use("/example", new ExampleRouter().router);
    }

    private configSwagger(): void {
        this.app.use("/api-docs", swagger.serve, swagger.setup(swaggerDocs));
    }

    public start(): void {
        this.app.listen(this.app.get("port"), () => {
            console.log(`API is running at ${Config.API_SCHEMES}://${Config.HOST}:${Config.PORT}/api-docs`);
        });
    }
}

async function startServer(): Promise<void> {
    await retry(setup, [], 3, 1, BackoffStrategy.linear);
    const server = new Server();
    server.start();
    await providerManager.init();
    await CronJobs.start();
}

startServer();
