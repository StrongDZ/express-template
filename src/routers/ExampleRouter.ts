import { Router } from "express";
import { ExampleController } from "../controllers/ExampleController";

export class ExampleRouter {
    router: Router;
    exampleController: ExampleController;

    constructor() {
        this.exampleController = new ExampleController();
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.get("/", this.exampleController.getExample);
    }
}
