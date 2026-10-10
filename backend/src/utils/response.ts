import type { Response } from "express";

interface ResponseOptions<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}
export const sendResponse = <T>(res: Response, options: ResponseOptions<T>) => {
  return res.status(options.statusCode)
    .json({
      success: options.success,
      message: options.message,
      data: options.data ?? null
    });
};