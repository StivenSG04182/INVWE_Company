import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Interfaz para las preguntas frecuentes
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// GET - Obtener todas las preguntas frecuentes
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('faq')
      .select('*');
    
    if (error) {
      return NextResponse.json(
        { error: "Error al obtener las preguntas frecuentes", details: error }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: err }, 
      { status: 500 }
    );
  }
}

// POST - Crear una nueva pregunta frecuente
export async function POST(req: Request) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const body = await req.json();
    const { question, answer } = body;
    
    // Validar datos
    if (!question || !answer) {
      return NextResponse.json(
        { error: "La pregunta y la respuesta son obligatorias" }, 
        { status: 400 }
      );
    }
    
    // Generar ID único para la nueva pregunta frecuente
    const id = uuidv4();
    
    // Insertar en Supabase
    const { data, error } = await supabase
      .from('faq')
      .insert([{ id, question, answer }])
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: "Error al crear la pregunta frecuente", details: error }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: err }, 
      { status: 500 }
    );
  }
}

// PATCH - Actualizar una pregunta frecuente existente
export async function PATCH(req: Request) {
  try {
    // Obtener datos y parámetros
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
    }
    
    const body = await req.json();
    const { question, answer } = body;
    
    if (!question && !answer) {
      return NextResponse.json(
        { error: "Se debe proporcionar al menos una actualización" }, 
        { status: 400 }
      );
    }
    
    // Preparar datos para actualizar
    const updateData: Partial<FAQItem> = {};
    if (question) updateData.question = question;
    if (answer) updateData.answer = answer;
    
    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('faq')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { error: "Pregunta frecuente no encontrada o error al actualizar", details: error }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: err }, 
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una pregunta frecuente
export async function DELETE(req: Request) {
  try {
    // Obtener el ID a eliminar
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
    }
    
    // Eliminar de Supabase
    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(
        { error: "Pregunta frecuente no encontrada o error al eliminar", details: error }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Pregunta frecuente eliminada correctamente" });
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: err }, 
      { status: 500 }
    );
  }
}