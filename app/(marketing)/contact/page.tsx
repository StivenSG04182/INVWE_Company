"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {  X, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { useTheme } from "next-themes";

export default function Questionnaire() {
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        // Here you would typically send the data to your backend
    };

    // Social media links
    const socialLinks = [
        { icon: <X className="h-6 w-6" />, href: "https://twitter.com/invwe", label: "X" },
        { icon: <Phone className="h-6 w-6" />, href: "https://api.whatsapp.com/send?phone=573233453782", label: "Whatsapp" },
        { icon: <Instagram className="h-6 w-6" />, href: "https://instagram.com/invwe", label: "Instagram" },
        { icon: <Linkedin className="h-6 w-6" />, href: "https://linkedin.com/company/invwe", label: "LinkedIn" },
        { icon: <Mail className="h-6 w-6" />, href: "mailto:info@invwe.com", label: "Email" },
    ];

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="w-full max-w-4xl mx-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                <h1 className="text-2xl font-bold text-center mb-4">
                    Escríbenos
                </h1>
                <p className="text-center mb-6">
                    ¡Gracias por visitar nuestra página!
                    <br />
                    Si tienes alguna pregunta o necesitas más información, no dudes en
                    ponerte en contacto con nosotros.
                </p>
                
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Form Section */}
                    <div className="flex-1 space-y-4">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="flex block font-medium mb-1">Nombre</label>
                                    <Input 
                                        id="name"
                                        name="name"
                                        type="text" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="bg-white/70 dark:bg-gray-700/70 border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="flex block font-medium mb-1">Email</label>
                                    <Input 
                                        id="email"
                                        name="email"
                                        type="email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="bg-white/70 dark:bg-gray-700/70 border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="phone" className="flex block font-medium mb-1">Teléfono</label>
                                    <Input 
                                        id="phone"
                                        name="phone"
                                        type="tel" 
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="bg-white/70 dark:bg-gray-700/70 border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="message" className="flex block font-medium mb-1">Mensaje</label>
                                    <Textarea 
                                        id="message"
                                        name="message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="bg-white/70 dark:bg-gray-700/70 border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                                
                                <Button 
                                    type="submit" 
                                    className="w-full bg-custom-blue hover:bg-custom-blue/90 dark:bg-custom-gold dark:hover:bg-custom-gold/90 dark:text-black"
                                >
                                    Enviar Mensaje
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Contact Info Section */}
                    <div className="flex-1 bg-white/80 dark:bg-gray-700/80 backdrop-blur-lg p-8 rounded-xl shadow-md border border-gray-300 dark:border-gray-600">
                        <h2 className="text-xl font-bold mb-4">
                            ¡Hola! siempre puedes encontrarnos en nuestras redes sociales.
                        </h2>
                        
                        <div className="space-y-2 mb-6">
                            <div className="bg-white/70 dark:bg-gray-700/70 rounded-lg p-4 h-[300px] overflow-y-auto border border-gray-300 dark:border-gray-600 mb-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                    Los mensajes de WhatsApp aparecerán aquí
                                </div>
                                {/* Messages will be rendered here */}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Escribe tu mensaje..."
                                    className="bg-white/70 dark:bg-gray-700/70 border-gray-300 dark:border-gray-600"
                                />
                                <Button
                                    type="button"
                                    className="bg-green-500 hover:bg-green-600 text-white dark:text-white"
                                >
                                    Enviar
                                </Button>
                            </div>
                        </div>

                        {/* Social Media Icons */}
                        <div className="mt-8">
                            <h3 className="font-medium mb-4 text-center">Síguenos en redes sociales</h3>
                            <div className="flex flex-wrap justify-center gap-6">
                                {socialLinks.map((social, index) => (
                                    <a 
                                        key={index}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white dark:bg-gray-600 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-500 hover:scale-110 text-gray-800 dark:text-white"
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
