import clientPromise from "@/utils/db";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const client = await clientPromise;
    const db = client.db("AbsFeedProduction");
    const materialCollection = db.collection("materials");

    const newMaterial = await request.json();

    if (!newMaterial) {
      return NextResponse.json({ message: "Please fill all required field" });
    }

    const result = await materialCollection.insertOne(newMaterial);
    return NextResponse.json({ message: "Material add successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

export const GET = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("AbsFeedProduction");
    const materialCollection = db.collection("materials");

    const materials = await materialCollection.find({}).toArray();

    return NextResponse.json(materials);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
