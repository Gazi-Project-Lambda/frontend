import { Routes } from '@angular/router';

// 1. Gerekli component'leri import edin (Mevcut olanlara Notes ekleniyor)
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NotesComponent } from './components/notes/notes.component'; // <--- EKLENDİ

// 2. Auth Guard'ı import edin
import { authGuard } from './guards/auth.guard'; // <--- EKLENDİ

export const routes: Routes = [
    // Login Rotası (Korunmasız)
    { path: 'login', component: LoginComponent },

    // Register Rotası (Korunmasız)
    { path: 'register', component: RegisterComponent },

    // NOTLAR ROTASI: KORUNMALI ROTA! <--- EKLENDİ
    // 'canActivate' dizisine authGuard'ı ekleyerek bu rotayı koruyoruz.
    {
        path: 'notes',
        component: NotesComponent,
        canActivate: [authGuard] // <--- BU SATIR, ROTAYI KORUR
    },
    
    // Varsayılan yol: Uygulama başladığında '/login' sayfasına yönlendir.
    { path: '', redirectTo: 'login', pathMatch: 'full' }

    // Not: Tüm tanımlanmamış yolları da login'e yönlendirebiliriz:
    // { path: '**', redirectTo: 'login' }
];