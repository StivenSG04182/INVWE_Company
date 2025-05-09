import BlurPage from '@/components/global/blur-page'
import { db } from '@/lib/db'
import { connectToDatabase } from '@/lib/mongodb'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

type Props = {
  params: { subaccountId: string }
}

interface Notification {
  id: string;
  notification: string;
  createdAt: Date;
  User: {
    name: string;
    avatarUrl: string;
  };
}

const ActivityPage = async ({ params }: Props) => {
  // Obtener la subcuenta para verificar la agencia asociada
  const subaccount = await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
    select: {
      agencyId: true,
    },
  })

  if (!subaccount) {
    return (
      <BlurPage>
        <div className="flex flex-col gap-4 p-4">
          <h1 className="text-4xl font-bold">Actividad Reciente</h1>
          <p className="text-muted-foreground">No se encontró la subcuenta</p>
        </div>
      </BlurPage>
    )
  }

  // Conectar a MongoDB
  const { db: mongodb } = await connectToDatabase()

  // Obtener notificaciones relacionadas con esta subcuenta
  const notificationsData = await mongodb
    .collection('notifications')
    .find({ subaccountId: params.subaccountId })
    .sort({ createdAt: -1 })
    .toArray()

  // Obtener información de usuarios para cada notificación
  const filteredNotifications: Notification[] = await Promise.all(
    notificationsData.map(async (notification) => {
      // Obtener usuario de Prisma (ya que los usuarios se manejan en Prisma)
      const user = await db.user.findUnique({
        where: { id: notification.userId },
        select: { name: true, avatarUrl: true },
      })

      return {
        id: notification._id.toString(),
        notification: notification.notification,
        createdAt: notification.createdAt,
        User: {
          name: user?.name || 'Usuario desconocido',
          avatarUrl: user?.avatarUrl || '',
        },
      }
    })
  )

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-4xl font-bold">Actividad Reciente</h1>
        <p className="text-muted-foreground">
          Visualiza la actividad reciente en esta subcuenta
        </p>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Registro de Actividades</CardTitle>
            <CardDescription>
              Historial de acciones realizadas por los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotifications && filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex gap-4 items-start border-b pb-4 mb-4"
                  >
                    <Avatar>
                      <AvatarImage src={notification.User.avatarUrl} />
                      <AvatarFallback>
                        {notification.User.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{notification.notification}</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No hay actividades registradas para esta subcuenta
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </BlurPage>
  )
}

export default ActivityPage