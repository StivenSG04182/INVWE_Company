import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";

interface SetupLayoutProps {
    children: React.ReactNode;
}

const SetupLayout = async ({ children }: SetupLayoutProps) => {
    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    }

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const storesCollection = db.collection("stores");

        // Find store for the current user
        const store = await storesCollection.findOne({ userId });

        if (store) {
            redirect(`/inventory/${store._id}`);
        }

        // If no store is found, let the user continue to create one
        return <>{children}</>;
    } catch (error) {
        console.error("Database Error:", error);
        return <div>Something went wrong. Please try again later.</div>;
    }
};

export default SetupLayout;