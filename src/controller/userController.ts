import { CustomRequest } from "../app";
import { Response } from "express";

export const getAllUsers = (req: CustomRequest, res: Response) => {
  res.status(500).json({
    status: "fail",
    message: "This route is not yet defined!",
  });
};

export const getUser = (req: CustomRequest, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

export const createUser = (req: CustomRequest, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

export const updateUser = (req: CustomRequest, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

export const deleteUser = (req: CustomRequest, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
