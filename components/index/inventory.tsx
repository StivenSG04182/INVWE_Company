"use client";

import React from "react";
import InventoryInfo from "./inventoryInfo";
import ThreeScene from "./ThreeScene";

export default function Inventory() {
    return (
        <section id="inventory" className="relative w-full h-screen overflow-hidden">
            <ThreeScene />

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-300">
                    <InventoryInfo />
                </div>
            </div>
        </section>
    );
}
