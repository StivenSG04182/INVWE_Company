import Link from "next/link"
import { CuboidIcon as Cube } from "lucide-react"

export function Footer() {
    const footerLinks = [
        {
            title: "Product",
            links: [
                { name: "Features", href: "/features" },
                { name: "Pricing", href: "/pricing" },
                { name: "Documentation", href: "/docs" },
            ],
        },
        {
            title: "Company",
            links: [
                { name: "About", href: "/about" },
                { name: "Blog", href: "/blog" },
                { name: "Contact", href: "/contact" },
            ],
        },
        {
            title: "Legal",
            links: [
                { name: "Privacy", href: "/privacy" },
                { name: "Terms", href: "/terms" },
            ],
        },
    ];

    return (
        <footer className="border-t py-12">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12">
                    <div>
                        <Link href="/" className="flex items-center space-x-2">
                            <Cube className="h-8 w-8 text-primary" />
                            <span className="text-xl font-bold">INVWE</span>
                        </Link>
                        <p className="text-muted-foreground mt-4">
                            Next-generation inventory management platform for modern businesses.
                        </p>
                    </div>
                    {footerLinks.map((column, index) => (
                        <div key={index}>
                            <h3 className="font-semibold mb-4">{column.title}</h3>
                            <ul className="space-y-2">
                                {column.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link 
                                            href={link.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} INVWE. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

