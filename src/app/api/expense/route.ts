import clientPromise from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const POST = async (request: NextRequest) => {
    try {
        const expense = await request.json();

        const client = await clientPromise;
        const db = client.db("AbsFeedProduction");
        const expenseCollection = db.collection("expense");

        if (!expense) {
            return NextResponse.json({ message: "No Expense data not found" });
        }

        const result = await expenseCollection.insertOne({
            ...expense,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return NextResponse.json({ message: "Expense added successfully", expense: result });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};

export const GET = async () => {
    try {
        const client = await clientPromise;
        const db = client.db("AbsFeedProduction");
        const expenseCollection = db.collection("expense");

        const expenses = await expenseCollection.find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ expenses });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};
