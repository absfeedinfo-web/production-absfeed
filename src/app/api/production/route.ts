import clientPromise from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const POST = async (request: NextRequest) => {
    const client = await clientPromise;
    const db = client.db("AbsFeedProduction");
    const productionCollection = db.collection("production");

    try {
        const entry = await request.json();
        const result = await productionCollection.insertOne({
            ...entry,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return NextResponse.json({ message: "Products add successfully", result });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", status: 500 });
    }
};

export const GET = async () => {
    const client = await clientPromise;
    const db = client.db("AbsFeedProduction");
    const productionCollection = db.collection("production");

    try {
        const production = await productionCollection.find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ production });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", status: 500 });
    }
};
