'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
/* import { Hero } from '@/components/Hero' */
import { ServicesSection } from '@/components/sections/ServicesSection'
import { BenefitsSection } from '@/components/sections/BenefitsSection'
import { ProductShowcase } from '@/components/sections/ProductShowcase'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

export default function Home() {
    useEffect(() => {
        // GSAP animations
        gsap.fromTo('.hero-title',
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
        )

        gsap.fromTo('.hero-buttons',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' }
        )

        // Scroll-triggered animations
        gsap.utils.toArray('.animate-on-scroll').forEach((element: any) => {
            gsap.fromTo(element,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            )
        })
    }, [])

    return (
        <div className="min-h-screen">
            {/* <Hero /> */}
            <ServicesSection />
            <BenefitsSection />
            <ProductShowcase />
            <TestimonialsSection />
        </div>
    )
}