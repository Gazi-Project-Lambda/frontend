// src/app/components/notes/notes.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { NotesService, Note } from '../../services/notes.service';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    DragDropModule, 
    FormsModule,
    TranslateModule
  ], 
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  
  private authService = inject(AuthService);
  private notesService = inject(NotesService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder); 
  private cdr = inject(ChangeDetectorRef);
  public translate = inject(TranslateService);

  notes: Note[] = [];
  noteForm!: FormGroup; 
  showConfirmMessage: boolean = false;
  noteToDeleteId: number | null = null; 
  editingNoteId: number | null = null;
  searchQuery: string = '';
  currentLang: string = 'tr'; // Dil değişkeni eklendi

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
    }
  }

  ngOnInit(): void {
    // Mevcut dili al
    const savedLang = localStorage.getItem('app-language') || 'tr';
    this.translate.use(savedLang);
    this.currentLang = savedLang;

    this.loadNotes();
    this.noteForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  // Dil değiştirme fonksiyonu
  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('app-language', lang);
  }

  loadNotes(): void {
    this.notesService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ NotesComponent: Failed to load notes.', err);
        this.translate.get('ERRORS.LOAD_NOTES').subscribe((text: string) => {
          alert(text);
        });
        this.router.navigate(['/login']);
      }
    });
  }

  toggleNoteCompletion(note: Note): void {
    this.notesService.toggleComplete(note).subscribe({
      next: () => {
        const foundNote = this.notes.find(n => n.id === note.id);
        if (foundNote) {
          foundNote.isCompleted = !foundNote.isCompleted;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ NotesComponent: Failed to toggle note completion.', err);
        this.translate.get('ERRORS.TOGGLE_STATUS').subscribe((text: string) => {
          alert(text);
        });
      }
    });
  }

  onSubmitNote(): void {
    console.log('📄 NotesComponent: onSubmitNote triggered.');
    if (this.noteForm.invalid) {
      this.translate.get('VALIDATION.TITLE_CONTENT_REQUIRED').subscribe((text: string) => {
        alert(text);
      });
      return;
    }
    
    const { title, content } = this.noteForm.value;

    if (this.editingNoteId !== null) {
        const existing = this.notes.find(n => n.id === this.editingNoteId);
        if (existing) {
          const updatedNote = { ...existing, title, content };
          this.notesService.updateNote(updatedNote).subscribe({
             next: () => {
                console.log('👍 NotesComponent: Update successful. Reloading notes.');
                this.loadNotes();
                this.cancelEdit();
             },
             error: (err) => {
               console.error('❌ NotesComponent: Failed to update note.', err);
               this.translate.get('ERRORS.UPDATE_NOTE').subscribe((text: string) => {
                 alert(text);
               });
             }
          });
        }
    } else {
        this.notesService.addNote(title, content).subscribe({
          next: (addedNote) => {
            console.log('👍 NotesComponent: Add note successful. Reloading notes.', addedNote);
            this.loadNotes();
            this.noteForm.reset();
          },
          error: (err) => {
            console.error('❌ NotesComponent: Failed to add note.', err);
            this.translate.get('ERRORS.ADD_NOTE').subscribe((text: string) => {
              alert(text);
            });
          }
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
      const idToDelete = this.noteToDeleteId;
      this.notesService.deleteNote(idToDelete).subscribe({
        next: () => {
          console.log(`👍 NotesComponent: Deleted note id: ${idToDelete}. Reloading notes.`);
          this.noteToDeleteId = null;
          this.showConfirmMessage = false;
          this.loadNotes();
        },
        error: (err) => {
          console.error('❌ NotesComponent: Failed to delete note.', err);
          this.translate.get('ERRORS.DELETE_NOTE').subscribe((text: string) => {
            alert(text);
          });
          this.noteToDeleteId = null;
          this.showConfirmMessage = false;
        }
      });
    }
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