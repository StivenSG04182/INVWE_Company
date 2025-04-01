import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

const templateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    files: { type: Object, required: true },
    stack: { type: [String], required: true },
    dependencies: { type: Object, required: true },
    vercelConfig: { type: Object },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema)

templateSchema.pre('save', function (next) {
    if (!this.name || !this.files || !this.stack) {
        throw new Error('Faltan campos requeridos: nombre, archivos o stack tecnológico')
    }
    next()
})

async function connectDB() {
    if (mongoose.connections[0].readyState) return
    await mongoose.connect(process.env.MONGODB_URI!)
}

export async function POST(request: Request) {
    try {
        await connectDB()
        const body = await request.json()

        const newTemplate = new Template({
            name: body.name,
            files: body.files,
            stack: body.stack,
            dependencies: body.dependencies,
            vercelConfig: body.vercelConfig
        })

        const savedTemplate = await newTemplate.save()
        return NextResponse.json({
            id: savedTemplate._id,
            name: savedTemplate.name,
            stack: savedTemplate.stack,
            createdAt: savedTemplate.createdAt
        })

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Error al guardar plantilla' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        await connectDB()
        const templates = await Template.find().sort({ createdAt: -1 })
        return NextResponse.json(templates)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Error al obtener plantillas' },
            { status: 500 }
        )
    }
}