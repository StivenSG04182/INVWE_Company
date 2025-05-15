'use client'

import { useContext } from 'react'
import { ModalContext } from '@/providers/modal-provider'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import React from 'react'

type Props = {
    title: string
    subheading: string 
    children: React.ReactNode
    defaultOpen?: boolean
}

const CustomModal = ({title, subheading, children, defaultOpen}: Props) => {
    const context = useContext(ModalContext)
    const isOpen = context?.isOpen
    const setClose = context?.setClose
    
    return <Dialog
      open={isOpen || defaultOpen}
      onOpenChange={setClose}
    >
      <DialogContent className='md:max-h-[700px] md:h=fit h-screen bg-card'>
          <DialogHeader className='pt-8 text-left'>
              <DialogTitle className='text-2xl font-bold'>
              {title}
              </DialogTitle>
              <DialogDescription>
                  {subheading}
              </DialogDescription>
              {children}
          </DialogHeader>
      </DialogContent>
    </Dialog>
}

export default CustomModal