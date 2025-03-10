"use client"

import React from "react";
import { Card } from "@/components/ui/card";

export default function Page() {
    interface FAQitems {
        question: string;
        answer: string;
    }

    const faqData: FAQitems[] = [
        {question:"pregunta",answer:"respuesta"},
        {question:"",answer:""},
        {question:"",answer:""},
        {question:"",answer:""},
        {question:"",answer:""},
        {question:"",answer:""},
        {question:"",answer:""},
        {question:"",answer:""},
        {question:"",answer:""},
        {question:"",answer:""},
        {question:"",answer:""}
    ]
    return (
        <div className="text-left">
            <h2 className="text-5xl font-bold mt-10 mb-20">
                PREGUNTAS FRECUENTES
            </h2>
            <ul className="space-y-4">
                {faqData.map((faq, index) => (
                    <Card key={index} className="p-4 border rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-
                        2">{faq.question}</h3>
                        <p className="text-gray-600">{faq.answer}</p>
                    </Card>
                )
            </ul>

        </div>
    );
}