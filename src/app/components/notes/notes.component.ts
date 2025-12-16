import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Formlar için gerekli importlar
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 

// Servisleri import ediyoruz
import { AuthService } from '../../services/auth.service';
import { NotesService, Note } from '../../services/notes.service';

@Component({
  selector: 'app-notes',
  standalone: true,
  // ReactiveFormsModule'ü imports dizisine ekliyoruz
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  
  // Enjekte edilen servisler (Dependency Injection)
  private authService = inject(AuthService);
  private notesService = inject(NotesService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder); 

  notes: Note[] = [];
  noteForm!: FormGroup; 
  showConfirmMessage: boolean = false; // Onay kutusunu göster/gizle
  noteToDeleteId: number | null = null; 
  editingNoteId: number | null = null;

  toggleNoteCompletion(id: number): void {
        this.notesService.toggleComplete(id);
        this.loadNotes(); // Listeyi güncel görünüm için yenile
    }

  ngOnInit(): void {
    // 1. Notları yükleme
    this.loadNotes();

    // 2. Not ekleme formunu oluşturma
    this.noteForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  loadNotes(): void {
    this.notes = this.notesService.getNotes();
  }

  // Formdan çağrılan metod (onSubmitNote)
  onSubmitNote(): void {
    if (this.noteForm.invalid) {
      // Alert yerine daha sonra Toastr veya benzeri bir bildirim kullanabilirsiniz.
      alert('Lütfen hem başlık hem de içerik giriniz.'); 
      return;
    }
    
    const { title, content } = this.noteForm.value;

    if (this.editingNoteId !== null) {
            // DÜZENLEME MODU: Notu güncelle
            this.notesService.updateNote(this.editingNoteId, title, content);
            this.editingNoteId = null; // Düzenleme modundan çık
        } else {
            // EKLEME MODU: Yeni not ekle
            this.notesService.addNote(title, content);
        }

    this.loadNotes();
    this.noteForm.reset();
  }
  
  editNote(note: Note): void { // <--- EKLENDİ
        this.editingNoteId = note.id;
        
        // Formu mevcut notun verileriyle doldur
        this.noteForm.setValue({
            title: note.title,
            content: note.content
        });
        
        // Form alanlarına odaklan (isteğe bağlı)
        // Eğer Form alanı scroll dışında kaldıysa, kullanıcıyı oraya yönlendirir.
    }

    initiateDelete(id: number): void { 
    this.noteToDeleteId = id;
    this.showConfirmMessage = true;
  }
// YENİ  Düzenleme modundan çıkar
    cancelEdit(): void { // <--- EKLENDİ
        this.editingNoteId = null;
        this.noteForm.reset();
    }
  // 2. ADIM: Kullanıcı "Evet, Sil" dediğinde çalışır
  confirmDelete(): void {
    if (this.noteToDeleteId !== null) {
      this.notesService.deleteNote(this.noteToDeleteId);
      this.loadNotes(); // Listeyi yenilemek için
    }
    this.showConfirmMessage = false; // Popup'ı kapat
    this.noteToDeleteId = null;
  }

  // 3. ADIM: Kullanıcı "Hayır" dediğinde çalışır
  cancelDelete(): void {
    this.showConfirmMessage = false; // Popup'ı kapat
    this.noteToDeleteId = null;
  }

  // Çıkış (Logout) Metodu
  logout(): void {
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }
}