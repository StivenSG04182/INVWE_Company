import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateSecurityCode } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const formData = await req.formData()
        const nombreEmpresa = formData.get('nombreEmpresa') as string
        const nit = formData.get('nit') as string
        const businessName = formData.get('businessName') as string
        const address = formData.get('address') as string
        const phone = formData.get('phone') as string
        const email = formData.get('email') as string
        const logoFile = formData.get('logoEmpresa') as File

        if (!nombreEmpresa || !nit || !businessName || !address || !phone || !email || !logoFile) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const { data: existingCompany, error: companyCheckError } = await supabase
            .from('companies')
            .select('id')
            .eq('nit', nit)
            .single()

        if (companyCheckError && companyCheckError.code !== 'PGRST116') {
            console.error("Error checking company:", companyCheckError)
            return new NextResponse("Error checking company", { status: 500 })
        }

        if (existingCompany) {
            return new NextResponse("Company with this NIT already exists", { status: 400 })
        }

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        const companiesCollection = db.collection("companies")
        const storesCollection = db.collection("stores")

        const mongoCompany = await companiesCollection.insertOne({
            _id: new ObjectId(),
            name: nombreEmpresa,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const mongoCompanyId = mongoCompany.insertedId.toString()

        const mongoStore = await storesCollection.insertOne({
            _id: new ObjectId(),
            companyId: mongoCompany.insertedId,
            name: "Tienda Principal",
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const bytes = await logoFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${fileName}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, buffer, {
                contentType: logoFile.type,
                upsert: true,
                metadata: {
                    userId: userId
                }
            })
        
        if (uploadError) {
            // Rollback MongoDB insertions
            await companiesCollection.deleteOne({ _id: mongoCompany.insertedId })
            await storesCollection.deleteOne({ _id: mongoStore.insertedId })
            console.error("Logo upload data:", uploadData)
            console.error("Logo upload error:", uploadError)
            return new NextResponse("Error uploading logo", { status: 500 })
        }

        const { data: publicUrlData } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath)

        // 3. Create company in Supabase with MongoDB reference
        const securityCode = generateSecurityCode(8)
        const companyId = uuidv4()

        const { error: createCompanyError } = await supabase
            .from('companies')
            .insert({
                id: companyId,
                name: nombreEmpresa,
                nit: nit,
                security_code: securityCode,
                business_name: businessName,
                tax_id: nit,
                address: address,
                phone: phone,
                email: email,
                dian_registered: false,
                logo_url: publicUrlData.publicUrl,
                mongodb_id: mongoCompanyId
            })

        if (createCompanyError) {
            // Rollback previous operations
            await companiesCollection.deleteOne({ _id: mongoCompany.insertedId })
            await storesCollection.deleteOne({ _id: mongoStore.insertedId })
            await supabase.storage.from('logos').remove([filePath])
            console.error("Create company error:", createCompanyError)
            return new NextResponse("Error creating company", { status: 500 })
        }

        // Create all related records in parallel
        const [userCompanyResult, subscriptionResult, storeResult] = await Promise.all([
            supabase.from('users_companies').insert({
                user_id: userId,
                company_id: companyId,
                role: 'ADMINISTRATOR',
                nombres_apellidos: nombreEmpresa,
                correo_electronico: email
            }),
            supabase.from('subscriptions').insert({
                company_id: companyId,
                user_id: userId,
                plan_name: 'Gratis',
                worker_limit: 10,
                invoice_limit: 1000,
                store_limit: 3,
                status: 'active'
            }),
            supabase.from('stores').insert({
                id: uuidv4(),
                company_id: companyId,
                name: "Tienda Principal",
                created_by: userId,
                mongodb_store_id: mongoStore.insertedId.toString()
            })
        ])

        if (userCompanyResult.error || subscriptionResult.error || storeResult.error) {
            // Rollback all operations
            await companiesCollection.deleteOne({ _id: mongoCompany.insertedId })
            await storesCollection.deleteOne({ _id: mongoStore.insertedId })
            await supabase.storage.from('logos').remove([filePath])
            await supabase.from('companies').delete().eq('id', companyId)
            console.error("Error creating related records:", {
                userCompany: userCompanyResult.error,
                subscription: subscriptionResult.error,
                store: storeResult.error
            })
            return new NextResponse("Error creating company records", { status: 500 })
        }

        return NextResponse.json({
            companyName: nombreEmpresa,
            storeId: mongoStore.insertedId.toString(),
            redirect: `/inventory/${encodeURIComponent(nombreEmpresa)}/dashboard/${mongoStore.insertedId.toString()}`
        }, { status: 201 })

    } catch (error) {
        console.error("CREATE_INVENTORY_ERROR:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}