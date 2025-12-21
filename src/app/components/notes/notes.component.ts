// src/app/components/notes/notes.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthService } from '../../services/auth.service';
import { NotesService, Note } from '../../services/notes.service';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule, FormsModule], 
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  
  private authService = inject(AuthService);
  private notesService = inject(NotesService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder); 

  notes: Note[] = [];
  noteForm!: FormGroup; 
  showConfirmMessage: boolean = false;
  noteToDeleteId: number | null = null; 
  editingNoteId: number | null = null;
  searchQuery: string = '';

  get displayNotes(): Note[] {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
        return this.notes;
    }
    const query = this.searchQuery.toLowerCase();
    return this.notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
    );
  }

  drop(event: CdkDragDrop<Note[]>): void {
    if (this.searchQuery.trim() === '') {
        moveItemInArray(this.notes, event.previousIndex, event.currentIndex);
        // Note: Real backend reordering requires updating 'order' fields in DB
    }
  }

  ngOnInit(): void {
    this.loadNotes();
    this.noteForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  loadNotes(): void {
    this.notesService.getNotes().subscribe(notes => {
      this.notes = notes;
    });
  }

  toggleNoteCompletion(note: Note): void {
    this.notesService.toggleComplete(note).subscribe(() => {
      // Refresh list or simple object update handled by reference
    });
  }

  onSubmitNote(): void {
    if (this.noteForm.invalid) {
      alert('Lütfen hem başlık hem de içerik giriniz.'); 
      return;
    }
    
    const { title, content } = this.noteForm.value;

    if (this.editingNoteId !== null) {
        // Find existing note object to preserve other fields like ID and Date
        const existing = this.notes.find(n => n.id === this.editingNoteId);
        if (existing) {
          const updatedNote = { ...existing, title, content, timestamp: new Date() };
          this.notesService.updateNote(updatedNote).subscribe(() => {
             this.loadNotes();
             this.cancelEdit();
          });
        }
    } else {
        this.notesService.addNote(title, content).subscribe(() => {
          this.loadNotes();
          this.noteForm.reset();
        });
    }
  }
  
  editNote(note: Note): void {
        this.editingNoteId = note.id;
        this.noteForm.setValue({
            title: note.title,
            content: note.content
        });
  }

  initiateDelete(id: number): void { 
    this.noteToDeleteId = id;
    this.showConfirmMessage = true;
  }

  cancelEdit(): void {
      this.editingNoteId = null;
      this.noteForm.reset();
  }

  confirmDelete(): void {
    if (this.noteToDeleteId !== null) {
      this.notesService.deleteNote(this.noteToDeleteId).subscribe(() => {
        this.loadNotes();
      });
    }
    this.showConfirmMessage = false;
    this.noteToDeleteId = null;
  }

  cancelDelete(): void {
    this.showConfirmMessage = false; 
    this.noteToDeleteId = null;
  }

  logout(): void {
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }
}