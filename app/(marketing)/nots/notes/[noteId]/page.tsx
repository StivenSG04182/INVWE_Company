"use client"

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface Note {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const noteId = params.noteId as string;

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/nots');
            return;
          }
          throw new Error('Failed to fetch note');
        }
        const data = await response.json();
        setNote(data);
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchNote();
    }
  }, [noteId, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <p>Loading note...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Note not found</p>
        <Button onClick={() => router.push('/nots')} className="mt-4">
          Back to Notes
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        onClick={() => router.push('/nots')}
        className="mb-6"
      >
        ← Back to Notes
      </Button>
      
      <article className="prose lg:prose-xl mx-auto">
        <h1>{note.title}</h1>
        <div className="text-sm text-gray-500 mb-6">
          {new Date(note.createdAt).toLocaleDateString()}
        </div>
        
        {note.imageUrl && (
          <div className="my-6">
            <Image 
              src={note.imageUrl} 
              alt={note.title} 
              className="w-full rounded-lg"
            />
          </div>
        )}
        
        <div dangerouslySetInnerHTML={{ __html: note.content }} />
      </article>
    </div>
  );
}