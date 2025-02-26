import { Button } from "@/components/ui/button"

export function CTA() {
    return (
        <section className="py-24 relative">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready for take-off?</h2>
                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Join thousands of businesses that trust StockVision for their inventory management.
                </p>
                <Button size="lg">Start Free Trial</Button>
            </div>
        </section>
    )
}

