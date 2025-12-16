import { Injectable } from '@angular/core';

// Not yapısı için bir interface tanımlayalım
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
  private notes: Note[] = [
    { id: 1, title: 'Hoş Geldiniz', content: 'Notesy Uygulamasına hoş geldiniz! Burası ilk notunuz.', timestamp: new Date(), isCompleted: false },
    { id: 2, title: 'Yapılacaklar', content: 'Angular Guard sistemini tamamla, Notes servisini entegre et.', timestamp: new Date(), isCompleted: true }
  ];
  private nextId = 3;

  constructor() { }

  // Tüm notları döndürür
  getNotes(): Note[] {
    return this.notes;
  }

  // Yeni not ekler
  addNote(title: string, content: string): void {
    const newNote: Note = {
      id: this.nextId++,
      title,
      content,
      timestamp: new Date(),
      isCompleted: false
    };
    this.notes.push(newNote);
    console.log('Yeni not eklendi:', newNote);
  }

  toggleComplete(id: number): void {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.isCompleted = !note.isCompleted; // Mevcut durumun tersine çevir
            console.log(`Not #${id} durumu: ${note.isCompleted ? 'Tamamlandı' : 'Beklemede'}`);
        }
    }

updateNote(id: number, newTitle: string, newContent: string): boolean {
    const note = this.notes.find(n => n.id === id);
    if (note) {
        note.title = newTitle;
        note.content = newContent;
        // Güncelleme zamanını da değiştirebiliriz
        note.timestamp = new Date();
        console.log(`Not #${id} başarıyla güncellendi.`);
        return true;
    }
    console.warn(`Güncellenecek not #${id} bulunamadı.`);
    return false;
}

 deleteNote(id: number): void { // <--- EKLENDİ
    // Belirtilen id'ye sahip olmayan notları filtreleyerek listeyi günceller
    const initialLength = this.notes.length;
    this.notes = this.notes.filter(note => note.id !== id);
    
    if (this.notes.length < initialLength) {
        console.log(`Not #${id} başarıyla silindi.`);
    } else {
        console.warn(`Not #${id} bulunamadı.`);
    }
  }
}