"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface Note {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export default function NotsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes');
        if (!response.ok) throw new Error('Failed to fetch notes');
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        <Link href="/dashboard/notes">
          <Button>Manage Notes</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <p>Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No notes available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Link href={`/nots/${note.id}`} key={note.id}>
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                {note.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <Image
                      src={note.imageUrl} 
                      alt={note.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{note.title}</CardTitle>
                  <CardDescription>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{note.content}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">Read More</Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}