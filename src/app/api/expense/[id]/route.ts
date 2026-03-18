import clientPromise from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    id: string;
}

export const DELETE = async (request: NextRequest, { params }: { params: Params }) => {
    try {
        const id = params.id;
        if (!id) {
            return NextResponse.json({ message: "id param is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("AbsFeedProduction");
        const expenseCollection = db.collection("expense");

        await expenseCollection.deleteOne({ id });

        return NextResponse.json({ message: "Expense history deleted successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};
