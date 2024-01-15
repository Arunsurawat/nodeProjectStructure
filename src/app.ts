
import express from "express";
import dotenv from "dotenv";
import * as bodyParser from 'body-parser';
import hpp from "hpp";
import morgan from "morgan";
import helmet from "helmet";
import cors from 'cors';
import { logger } from "@utils/logger";
import { Routes } from "@interfaces/route.interface";
import connectDB from "@connections/db.connection";
import { errorHandler } from "@utils/errorHandler";
import { routeNotFound } from "@utils/routeNotFound";
import fileUpload from 'express-fileupload';

const allowedOrigins = process.env.allowedOrigins
const options: cors.CorsOptions = { origin: allowedOrigins };

dotenv.config();
class App {
    public app: express.Application;
    public port?: string | number;
    public env?: string;
    public dbURL?: string;
    public allowedOrigins: any;

    constructor(routes: Routes[]) {
        //ENV Variables
        this.port = process.env.PORT;
        this.env = process.env.ENV;
        this.dbURL = process.env.ATLAS_URI;

        this.app = express();
       
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.app.use(errorHandler);
        this.app.use(routeNotFound);
        this.app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/', safeFileNames: true, preserveExtension: true }));

    }


    public listen = async () => {
        try {
            await connectDB(this.dbURL);
            this.app.listen(this.port, () => {
                logger.info(`======= ENV: ${this.env} =======`);
                logger.info(`🚀 App listening on the port ${this.port}`);
            });
        } catch (error) {
            logger.error(error.message);
        }
    }

    private initializeRoutes(routes: Routes[]) {
        routes.forEach((route) => {
            this.app.use("/", route.router);
        });
    }

    private initializeMiddlewares() {

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use(cors(options));

        this.app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));

        this.app.use(hpp());
        this.app.use(helmet());
        
    }



}

export default App;

