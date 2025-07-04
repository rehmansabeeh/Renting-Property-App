import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });
    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error) {
    res.status(500).json({ message: `Error retrieving tenant`, error });
  }
};

export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const tenant = await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });
    res.status(201).json(tenant);

    // }
  } catch (error) {
    res.status(500).json({ message: `Error creating tenant`, error });
  }
};

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phoneNumber } = req.body;
    const { cognitoId } = req.params;
    const updateTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });
    res.json(updateTenant);

    // }
  } catch (error) {
    res.status(500).json({ message: `Error updating tenant`, error });
  }
};

export const getCurrentResidences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const properties = await prisma.property.findMany({
      where: { tenants: { some: { cognitoId } } },
      include: { location: true },
    });
    const residencesWithFormattedLocation = await Promise.all(
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
    res.json(residencesWithFormattedLocation);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error retrieving Managers Properties`, error });
  }
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    const propertyIdNumber = Number(propertyId);
    const existingFavorite = tenant?.favorites || [];

    if (!existingFavorite.some((fav) => fav.id === propertyIdNumber)) {
      const updatedTenant = await prisma.tenant.update({
        where: { cognitoId },
        data: {
          favorites: {
            connect: { id: propertyIdNumber },
          },
        },
        include: {
          favorites: true,
        },
      });
      res.json(updatedTenant);
    } else {
      res.status(409).json({ message: "Property already in favorites" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error adding Favorite Properties`, error });
  }
};

export const removeFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const propertyIdNumber = Number(propertyId);

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          disconnect: { id: propertyIdNumber },
        },
      },
      include: {
        favorites: true,
      },
    });

    res.json(updatedTenant);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error removing Favorite Properties`, error });
  }
};
