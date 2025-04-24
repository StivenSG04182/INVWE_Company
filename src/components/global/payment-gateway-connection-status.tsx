import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'loading'

type Props = {
  status: ConnectionStatus
  onReconnect?: () => void
  onDisconnect?: () => void
  lastConnected?: string
}

const PaymentGatewayConnectionStatus = ({
  status,
  onReconnect,
  onDisconnect,
  lastConnected
}: Props) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'loading':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'disconnected':
        return 'Desconectado'
      case 'error':
        return 'Error de conexión'
      case 'loading':
        return 'Conectando...'
      default:
        return ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={status === 'connected' ? 'success' : 'secondary'}>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </Badge>

      {status === 'connected' && onDisconnect && (
        <Button variant="outline" size="sm" onClick={onDisconnect}>
          Desconectar
        </Button>
      )}

      {status === 'disconnected' && onReconnect && (
        <Button variant="outline" size="sm" onClick={onReconnect}>
          Reconectar
        </Button>
      )}

      {lastConnected && status === 'connected' && (
        <span className="text-xs text-muted-foreground">
          Última conexión: {new Date(lastConnected).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}

export default PaymentGatewayConnectionStatus 