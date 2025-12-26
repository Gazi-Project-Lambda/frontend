import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { NotesService, Note } from '../../services/notes.service';
import { ToastService } from '../../services/toast.service'; // Import

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
  private toastService = inject(ToastService); // Inject

  notes: Note[] = [];
  noteForm!: FormGroup; 
  showConfirmMessage: boolean = false;
  noteToDeleteId: number | null = null; 
  editingNoteId: number | null = null;
  searchQuery: string = '';
  currentLang: string = 'tr';

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
    const savedLang = localStorage.getItem('app-language') || 'tr';
    this.translate.use(savedLang);
    this.currentLang = savedLang;

    this.loadNotes();
    this.noteForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

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
          this.toastService.show(text, 'error'); // Toast
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
        // Toast based on new status
        if (note.isCompleted) {
           this.toastService.show('Note marked as completed', 'success');
        } else {
           this.toastService.show('Note marked as pending', 'info');
        }
      },
      error: (err) => {
        console.error('❌ NotesComponent: Failed to toggle note completion.', err);
        this.translate.get('ERRORS.TOGGLE_STATUS').subscribe((text: string) => {
          this.toastService.show(text, 'error'); // Toast
        });
      }
    });
  }

  onSubmitNote(): void {
    if (this.noteForm.invalid) {
      this.translate.get('VALIDATION.TITLE_CONTENT_REQUIRED').subscribe((text: string) => {
        this.toastService.show(text, 'error'); // Toast
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
                this.loadNotes();
                this.cancelEdit();
                this.toastService.show('Note updated successfully', 'success'); // Toast
             },
             error: (err) => {
               console.error('❌ NotesComponent: Failed to update note.', err);
               this.translate.get('ERRORS.UPDATE_NOTE').subscribe((text: string) => {
                 this.toastService.show(text, 'error'); // Toast
               });
             }
          });
        }
    } else {
        this.notesService.addNote(title, content).subscribe({
          next: (addedNote) => {
            this.loadNotes();
            this.noteForm.reset();
            this.toastService.show('Note created successfully', 'success'); // Toast
          },
          error: (err) => {
            console.error('❌ NotesComponent: Failed to add note.', err);
            this.translate.get('ERRORS.ADD_NOTE').subscribe((text: string) => {
              this.toastService.show(text, 'error'); // Toast
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
    this.toastService.show('Editing note...', 'info'); // Toast
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
          this.noteToDeleteId = null;
          this.showConfirmMessage = false;
          this.loadNotes();
          this.toastService.show('Note deleted successfully', 'success'); // Toast
        },
        error: (err) => {
          console.error('❌ NotesComponent: Failed to delete note.', err);
          this.translate.get('ERRORS.DELETE_NOTE').subscribe((text: string) => {
            this.toastService.show(text, 'error'); // Toast
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
    this.toastService.show('Logged out successfully', 'info'); // Toast
    this.router.navigate(['/login']); 
  }
}