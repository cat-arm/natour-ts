import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import { CustomRequest } from "../app";
import { NewTourDto, TourDto } from "../dto/TourDto";

const tours: TourDto[] = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8"));

export const checkID = (req: CustomRequest, res: Response, next: NextFunction, val: string): void => {
  console.log(`Tour id is: ${val}`);

  // Convert val to a number and check validity
  if (parseInt(val, 10) > tours.length) {
    res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
    return;
  }

  next();
};

export const checkBody = (req: CustomRequest, res: Response, next: NextFunction): void => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
    return;
  }
  next();
};

export const getAllTours = (req: CustomRequest, res: Response): void => {
  console.log(req.requestTime);
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

export const getTour = (req: CustomRequest, res: Response): void => {
  console.log(req.params);
  const id = parseInt(req.params.id, 10);

  const tour = tours.find((el: TourDto) => el.id === id);

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

export const createTour = (req: CustomRequest, res: Response): void => {
  console.log(tours.length);
  const newId = tours.length > 0 ? tours[tours.length - 1].id + 1 : 1;
  console.log(newId);
  const newTour: NewTourDto = { id: newId, ...req.body };

  tours.push(newTour);

  try {
    fs.writeFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours));
    res.status(201).json({
      status: "success",
      data: { tour: newTour },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Error saving tour data",
    });
  }
};

export const updateTour = (req: CustomRequest, res: Response): void => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour here...>",
    },
  });
};

export const deleteTour = (req: Request, res: Response): void => {
  res.status(204).json({
    status: "success",
    data: null,
  });
};
