'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

// Clave para almacenar los productos en localStorage
const PRODUCTS_STORAGE_KEY = 'invwe-products'

export interface Product {
    id: number
    name: string
    type: string
    stock: number
    price: number
    description: string
    imagen?: string
    code?: string
    total?: string
    color?: string
    subtext?: string
    subtextColor?: string
}

interface ProductContextType {
    products: Product[]
    addProduct: (product: Omit<Product, 'id'>) => void
    updateProduct: (id: number, product: Partial<Product>) => void
    deleteProduct: (id: number) => void
    getFilteredProducts: (searchTerm: string) => Product[]
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export const useProducts = () => {
    const context = useContext(ProductContext)
    if (!context) {
        throw new Error('useProducts debe ser usado dentro de un ProductProvider')
    }
    return context
}

interface ProductProviderProps {
    children: ReactNode
    initialProducts?: Product[]
}

// Productos iniciales por defecto
const defaultProducts = [
    {
        id: 1,
        name: "Banano",
        type: "fruta",
        stock: 200,
        price: 100,
        description: "es un banano",
        imagen: "https://via.placeholder.com/150",
        code: "A3",
        total: "561",
        color: "yellow"
    },
    {
        id: 2,
        name: "Manzana",
        type: "fruta",
        stock: 50,
        price: 102,
        description: "es una manzana",
        imagen: "https://via.placeholder.com/150",
        code: "C1",
        total: "677",
        color: "orange",
        subtext: "About to expire"
    },
    {
        id: 3,
        name: "frutos secos",
        type: "pasabocas",
        stock: 100,
        price: 300,
        description: "Diversa variedad de frutos secos",
        imagen: "https://via.placeholder.com/150",
        code: "B5",
        total: "320",
        color: "red"
    }
]

export const ProductProvider: React.FC<ProductProviderProps> = ({ 
    children, 
    initialProducts = defaultProducts
}) => {
    // Inicializar el estado con los productos almacenados en localStorage o los iniciales
    const [products, setProducts] = useState<Product[]>(() => {
        // Verificar si estamos en el cliente antes de acceder a localStorage
        if (typeof window !== 'undefined') {
            try {
                const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY)
                return storedProducts ? JSON.parse(storedProducts) : initialProducts
            } catch (error) {
                console.error('Error al cargar productos desde localStorage:', error)
                return initialProducts
            }
        }
        return initialProducts
    })

    // Actualizar localStorage cuando cambian los productos
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
            } catch (error) {
                console.error('Error al guardar productos en localStorage:', error)
            }
        }
    }, [products])

    const addProduct = (product: Omit<Product, 'id'>) => {
        const newProduct = {
            ...product,
            id: Math.max(...products.map(p => p.id), 0) + 1,
            // Asignar valores por defecto para los campos de área si no se proporcionan
            code: product.code || `P${Math.floor(Math.random() * 100)}`,
            total: product.total || String(product.stock + 100),
            color: product.color || "green"
        }
        setProducts([...products, newProduct])
    }

    const updateProduct = (id: number, updatedProduct: Partial<Product>) => {
        setProducts(products.map(product => 
            product.id === id ? { ...product, ...updatedProduct } : product
        ))
    }

    const deleteProduct = (id: number) => {
        setProducts(products.filter(product => product.id !== id))
    }

    const getFilteredProducts = (searchTerm: string) => {
        if (!searchTerm) return products
        
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    return (
        <ProductContext.Provider value={{
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            getFilteredProducts
        }}>
            {children}
        </ProductContext.Provider>
    )
}