import clientPromise from "@/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
    try {
        const client = await clientPromise;
        const db = client.db("AbsFeedProduction");
        const productionCollection = db.collection("production");

        const count = await productionCollection.countDocuments();
        console.log(`[recent-production] Found ${count} documents in collection`);

        const recent_production = await productionCollection
            .find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        return NextResponse.json({ recent_production });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};
