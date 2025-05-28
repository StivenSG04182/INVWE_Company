import { db } from '@/lib/db'
import LaunchPadClient from './LaunchPadClient'

type PageProps = {
    params: { agencyId: string }
    searchParams: { code?: string }
}

export default async function LaunchPadPage({
    params,
    searchParams,
}: PageProps) {
    const agency = await db.agency.findUnique({
        where: { id: params.agencyId },
    })

    if (!agency) {
        return <p>Agencia no encontrada.</p>
    }

    return (
        <LaunchPadClient
            agencyDetails={agency}
            agencyId={params.agencyId}
            code={searchParams.code}
        />
    )
}
