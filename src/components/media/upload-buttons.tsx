'use client'
import { useModal } from '@/providers/modal-provider'
import React from 'react'
import { Button } from '../ui/button'
import CustomModal from '../global/custom-modal'
import UploadMediaForm from '../forms/upload-media'

type Props = {
    subaccountId: string,
    agencyId?: string
}

const MediaUploadButton = ({subaccountId, agencyId}: Props) => {
    const {isOpen, setOpen, setClose} = useModal()

  return <Button onClick={() => {
    setOpen(
        <CustomModal
        title='Cargar medios'
        subheading='Sube un archivo a tu cubo'>
            <UploadMediaForm subaccountId={subaccountId} agencyId={agencyId}></UploadMediaForm>
        </CustomModal>
    )
  }}>Cargar
  </Button>
}

export default MediaUploadButton