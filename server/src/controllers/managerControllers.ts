import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });
    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({ message: "manager not found" });
    }
  } catch (error) {
    res.status(500).json({ message: `Error retrieving manager`, error });
  }
};

export const createManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const manager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });
    res.status(201).json(manager);

    // }
  } catch (error) {
    res.status(500).json({ message: `Error creating Manager`, error });
  }
};
export const updateManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phoneNumber } = req.body;
    const { cognitoId } = req.params;
    const updateManager = await prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });
    res.json(updateManager);
  } catch (error) {
    res.status(500).json({ message: `Error updating Manager`, error });
  }
};

export const getManagerProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId },
      include: { location: true },
    });
    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] = await prisma.$queryRaw`
        SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.locationId}`;
        const geoJson: any = wktToGeoJSON(coordinates[0].coordinates || "");
        const longitude = geoJson.coordinates[0];
        const latitude = geoJson.coordinates[1];

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude: longitude,
              latitude: latitude,
            },
          },
        };
      })
    );
    res.json(propertiesWithFormattedLocation);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error retrieving Managers Properties`, error });
  }
};
