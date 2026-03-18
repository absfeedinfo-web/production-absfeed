import clientPromise from "@/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
    try {
        const client = await clientPromise;
        const db = client.db("AbsFeedProduction");
        const expenseCollection = db.collection("expense");
        const productionCollection = db.collection("production");

        const prodCount = await productionCollection.countDocuments();
        const expCount = await expenseCollection.countDocuments();
        console.log(`[stats] production count: ${prodCount}, expense count: ${expCount}`);

        const productionResult = await productionCollection
            .aggregate([
                {
                    $group: {
                        _id: null,
                        total_bags: { $sum: "$bags" },
                        total_weight: { $sum: "$totalKgs" },
                        total_production_value: { $sum: "$totalValue" },
                    },
                },
            ])
            .toArray();

        const expenseResult = await expenseCollection
            .aggregate([
                {
                    $group: {
                        _id: null,
                        total_expense: { $sum: "$amount" },
                    },
                },
            ])
            .toArray();

        const stats = {
            total_bags: productionResult[0]?.total_bags || 0,
            total_weight: productionResult[0]?.total_weight || 0,
            total_production_value: productionResult[0]?.total_production_value || 0,
            total_expense: expenseResult[0]?.total_expense || 0,
        };
        return NextResponse.json({ stats });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};
