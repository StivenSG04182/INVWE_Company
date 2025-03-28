import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export const runtime = 'nodejs';

// Configuración para permitir archivos de hasta 5MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener el formData con la imagen
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('companyId') as string;

    if (!file || !companyId) {
      return NextResponse.json({ error: 'Missing file or companyId' }, { status: 400 });
    }

    // Validar que el archivo es una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Conectar a MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Verificar que el usuario tiene permisos para esta empresa
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(companyId),
      $or: [
        { clerkUserId: userId },
        { createdBy: userId }
      ]
    });

    if (!company) {
      // Verificar si es un usuario asociado con permisos
      const userCompany = await db.collection('users_companies').findOne({
        companyId: companyId,
        userId: userId,
        status: 'approved'
      });

      if (!userCompany) {
        return NextResponse.json({ error: 'Not authorized to update this company' }, { status: 403 });
      }
    }

    // Crear directorio para logos si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos');
    await mkdir(uploadsDir, { recursive: true });

    // Generar nombre de archivo único
    const fileExtension = file.name.split('.').pop();
    const fileName = `${companyId}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Guardar el archivo
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    // Actualizar la referencia en la base de datos
    const logoUrl = `/uploads/logos/${fileName}`;
    await db.collection('companies').updateOne(
      { _id: new ObjectId(companyId) },
      { $set: { logoUrl: logoUrl } }
    );

    return NextResponse.json({ success: true, logoUrl });
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: error.message || 'Error uploading logo' },
      { status: 500 }
    );
  }
}