import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; // <-- Import catchError and tap
import { environment } from '../../environments/environment';

export interface Note {
  id: number;
  title: string;
  content: string;
  timestamp: Date;
  isCompleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private http = inject(HttpClient);
  // Use the local proxy path
  private apiUrl = `${environment.apiUrl}/notes`;

  constructor() { }

  // GET: Fetch all notes
  getNotes(): Observable<Note[]> {
    console.log('🚀 NotesService: Fetching all notes...');
    return this.http.get<Note[]>(this.apiUrl).pipe(
      tap(notes => console.log(`✅ NotesService: Received ${notes.length} notes.`)),
      catchError(error => {
        console.error('🔥 NotesService: Error fetching notes:', error);
        return throwError(() => error);
      })
    );
  }

  // POST: Add a new note
  addNote(title: string, content: string): Observable<Note> {
    const newNote = { title, content } as Note; 
    console.log('🚀 NotesService: Sending addNote request...', newNote); // <-- ADDED LOG
    
    return this.http.post<Note>(this.apiUrl, newNote).pipe(
      tap(response => console.log('✅ NotesService: Note added successfully:', response)), // <-- ADDED LOG
      catchError(error => {
        console.error('🔥 NotesService: Error adding note:', error); // <-- ADDED LOG
        return throwError(() => error);
      })
    );
  }

  // PUT: Update an existing note
  updateNote(note: Note): Observable<any> {
    const url = `${this.apiUrl}/${note.id}`;
    console.log('🚀 NotesService: Sending updateNote request...', note); // <-- ADDED LOG
    
    return this.http.put(url, note).pipe(
      tap(response => console.log('✅ NotesService: Note updated successfully.', response)), // <-- ADDED LOG
      catchError(error => {
        console.error('🔥 NotesService: Error updating note:', error); // <-- ADDED LOG
        return throwError(() => error);
      })
    );
  }

  // Helper for toggling completion
  toggleComplete(note: Note): Observable<any> {
    const updatedNote = { ...note, isCompleted: !note.isCompleted };
    const url = `${this.apiUrl}/${updatedNote.id}`;
    console.log('🚀 NotesService: Sending toggleComplete request...', updatedNote); // <-- ADDED LOG
    
    return this.http.put(url, updatedNote).pipe(
      tap(response => console.log('✅ NotesService: Toggle complete successful.', response)), // <-- ADDED LOG
      catchError(error => {
        console.error('🔥 NotesService: Error toggling note completion:', error); // <-- ADDED LOG
        return throwError(() => error);
      })
    );
  }

  // DELETE: Delete a note
  deleteNote(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`🚀 NotesService: Sending deleteNote request for id: ${id}`); // <-- ADDED LOG
    
    return this.http.delete(url).pipe(
      tap(response => console.log('✅ NotesService: Note deleted successfully.', response)), // <-- ADDED LOG
      catchError(error => {
        console.error('🔥 NotesService: Error deleting note:', error); // <-- ADDED LOG
        return throwError(() => error);
      })
    );
  }
}