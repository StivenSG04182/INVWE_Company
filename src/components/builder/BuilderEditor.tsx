'use client'

import { BuilderComponent, builder } from '@builder.io/react'

// Only initialize if API key is available
if (process.env.NEXT_PUBLIC_BUILDER_API_KEY) {
  builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY)
}

type Props = {
    model: string
    contentId: string
}

export default function BuilderEditor({ model, contentId }: Props) {
    return (
        <BuilderComponent model={model} content={contentId as any} />
    )
}