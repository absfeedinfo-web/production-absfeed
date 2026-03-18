import clientPromise from "@/utils/db";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const client = await clientPromise;
    const db = client.db("AbsFeedProduction");
    const productCollection = db.collection("products");

    const newProduct = await request.json();

    if (!newProduct) {
      return NextResponse.json({ message: "Please fill all required field" });
    }

    const result = await productCollection.insertOne(newProduct);
    return NextResponse.json({ message: "Product add successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

export const GET = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("AbsFeedProduction");
    const productCollection = db.collection("products");

    const products = await productCollection.find({}).toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
