import clientPromise from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    id: string;
}

export const PUT = async (request: NextRequest, { params }: { params: Params }) => {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ message: "id param is required" }, { status: 400 });
        }

        const updateData = await request.json();

        const client = await clientPromise;
        const db = client.db("AbsFeedProduction");
        const collection = db.collection("production");

        const result = await collection.updateOne(
            { id: id },
            { $set: { ...updateData, updatedAt: new Date() } },
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Document not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Update successful",
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};

export const DELETE = async (request: NextRequest, { params }: { params: Params }) => {
    try {
        const id = params.id;
        if (!id) {
            return NextResponse.json({ message: "id param is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("AbsFeedProduction");
        const collection = db.collection("production");

        await collection.deleteOne({ id });

        return NextResponse.json({ message: "Entry deleted successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};
