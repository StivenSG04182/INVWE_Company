"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const TextRevealCard = ({
    text,
    revealText,
    className,
    textAlign = "left",
}: {
    text: string
    revealText: string
    className?: string
    textAlign?: "left" | "center" | "right"
}) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className={cn(
                "relative w-full max-w-md overflow-hidden rounded-xl border bg-white p-8 shadow-lg",
                className,
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div initial={{ opacity: 1 }} animate={{ opacity: isHovered ? 0 : 1 }} transition={{ duration: 0.5 }}>
                <h2 className={`text-2xl font-bold text-500 text-${textAlign}`}>{text}</h2>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center bg-white"
            >
                <h2 className={`text-2xl font-bold text-500 text-${textAlign}`}>{revealText}</h2>
            </motion.div>
        </div>
    )
}

