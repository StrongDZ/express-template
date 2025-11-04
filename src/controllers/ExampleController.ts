import { Request, Response } from "express";
import { sendRes } from "../utils/ResUtils";
import { BadRequest } from "../common/errors/BadRequest";
import { HttpError } from "../common/errors/HttpError";

export class ExampleController {
    constructor() {
        this.getExample = this.getExample.bind(this);
    }

    public async getExample(req: Request, res: Response) {
        try {
            res.send("Hello World!");
        } catch (error: any) {
            if (error instanceof HttpError) {
                sendRes(res, error);
            } else {
                sendRes(res, new BadRequest(error instanceof Error ? error.message : String(error)));
            }
        }
    }
}
