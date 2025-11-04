import { Response } from "express";
import { HttpError } from "../common/errors/HttpError";

export function sendRes(res: Response, err: HttpError | Error | null, data: any = {}): void {
    if (err instanceof HttpError) {
        res.status(err.httpCode).json({ message: err.message });
    } else if (err instanceof Error) {
        res.status(500).json({ message: err.message });
    } else {
        res.status(200).json(data);
    }
}
