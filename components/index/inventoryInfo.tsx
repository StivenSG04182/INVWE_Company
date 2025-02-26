"use client";

import React from "react";

export default function InventoryInfo() {
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Inventario General</h2>
            <p className="text-gray-600 mb-4">Monitoreo en tiempo real de los productos almacenados.</p>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-200 p-4 rounded-md">
                    <h3 className="text-lg font-semibold">Total Productos</h3>
                    <p className="text-gray-700 text-xl font-bold">1,208</p>
                </div>

                <div className="bg-gray-200 p-4 rounded-md">
                    <h3 className="text-lg font-semibold">Total Contenedores</h3>
                    <p className="text-gray-700 text-xl font-bold">24</p>
                </div>
            </div>
        </div>
    );
}
