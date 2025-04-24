import AgencyDetails from "@/components/forms/agency-details";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  console.log("=== Starting Page Execution ===");
  console.log("Search Params:", searchParams);

  // Verificar invitación y obtener agencyId
  console.log("=== Verifying Invitation ===");
  const agencyId = await verifyAndAcceptInvitation();
  console.log("Agency ID from invitation:", agencyId);

  // Obtener detalles del usuario
  console.log("=== Getting User Details ===");
  const user = await getAuthUserDetails();
  console.log("User details:", {
    id: user?.id,
    role: user?.role,
    email: user?.email,
    agencyId: user?.agencyId
  });

  if (agencyId) {
    console.log("=== Agency ID exists, checking user role ===");
    if (user?.role === "SUBACCOUNT_GUEST" || user?.role === "SUBACCOUNT_USER") {
      console.log("User is subaccount user/guest, redirecting to subaccount");
      return redirect("/subaccount");
    } else if (user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") {
      console.log("User is agency owner/admin, checking plan and state");
      if (searchParams.plan) {
        console.log("Plan parameter exists, redirecting to billing");
        return redirect(`/agency/${agencyId}/billing?plan=${searchParams.plan}`);
      }
      if (searchParams.state) {
        console.log("State parameter exists, processing state");
        const statePath = searchParams.state.split("___")[0];
        const stateAgencyId = searchParams.state.split("___")[1];
        console.log("State path:", statePath);
        console.log("State agency ID:", stateAgencyId);
        if (!stateAgencyId) {
          console.log("No state agency ID found, showing not authorized");
          return <div>Not authorized</div>;
        }
        console.log("Redirecting to state path with code");
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`
        );
      } else {
        console.log("No plan or state, redirecting to agency dashboard");
        return redirect(`/agency/${agencyId}`);
      }
    } else {
      console.log("User role not authorized:", user?.role);
      return <div>Not authorized</div>;
    }
  }

  // Si no hay agencyId, mostrar el formulario de creación de agencia
  console.log("=== No Agency ID, getting current user ===");
  const authUser = await currentUser();
  console.log("Auth user details:", {
    id: authUser?.id,
    email: authUser?.emailAddresses[0]?.emailAddress,
    hasEmail: !!authUser?.emailAddresses[0]
  });

  if (!authUser) {
    console.log("No authenticated user found, redirecting to sign in");
    return redirect("/sign-in");
  }

  console.log("=== Rendering Agency Creation Form ===");
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl">Crear un inventario</h1>
        <AgencyDetails
          data={{ companyEmail: authUser?.emailAddresses[0]?.emailAddress }}
        />
      </div>
    </div>
  );
};

export default Page;
