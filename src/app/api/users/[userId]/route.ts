import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params
        const values = await req.json()

        // Validar que todos los campos requeridos estén presentes
        const requiredFields = [
            'birthDate',
            'gender',
            'maritalStatus',
            'address',
            'phone',
            'position',
            'hireDate',
            'salary',
            'workSchedule',
            'socialSecurityNumber',
            'socialSecurityAffiliation',
        ]

        const missingFields = requiredFields.filter(field => !values[field])

        if (missingFields.length > 0) {
            return new NextResponse(
                `Faltan los siguientes campos requeridos: ${missingFields.join(', ')}`,
                { status: 400 }
            )
        }

        // Actualizar el usuario en la base de datos
        const updatedUser = await db.user.update({
            where: {
                id: userId,
            },
            data: {
                birthDate: new Date(values.birthDate),
                gender: values.gender,
                maritalStatus: values.maritalStatus,
                address: values.address,
                phone: values.phone,
                position: values.position,
                hireDate: new Date(values.hireDate),
                salary: values.salary,
                workSchedule: values.workSchedule,
                socialSecurityNumber: values.socialSecurityNumber,
                socialSecurityAffiliation: values.socialSecurityAffiliation,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('[USER_ID_PATCH]', error)
        return new NextResponse('Error interno del servidor', { status: 500 })
    }
}