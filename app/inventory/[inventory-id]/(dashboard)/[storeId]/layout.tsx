import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: { storeId: string };
}

const DashboardLayout = async ({ children, params }: DashboardLayoutProps) => {
    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    }

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const storesCollection = db.collection("stores");

        // Verify if the store exists and belongs to the user
        const store = await storesCollection.findOne({
            _id: new ObjectId(params.storeId),
            userId
        });

        if (!store) {
            redirect("/select_inventory");
        }

        return (
            <>
                <div>Navbar for store: {store.name}</div>
                {children}
            </>
        );
    } catch (error) {
        console.error("Database Error:", error);
        return <div>Something went wrong. Please try again later.</div>;
    }
};

export default DashboardLayout;