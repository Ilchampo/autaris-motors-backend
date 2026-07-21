import type { Request } from 'express';

export interface ControllerResult<T> {
    statusCode?: number;
    data: T;
}

export type ControllerFn<T> = (req: Request) => Promise<ControllerResult<T>>;
