import { Routes } from '@angular/router';

// 1. Gerekli component'leri import edin
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NotesComponent } from './components/notes/notes.component';

// 2. Auth Guard'ı import edin
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Login Rotası (Korunmasız)
    { path: 'login', component: LoginComponent },

    // Register Rotası (Korunmasız)
    { path: 'register', component: RegisterComponent },

    // NOTLAR ROTASI: KORUNMALI ROTA!
    // 'canActivate' dizisine authGuard'ı ekleyerek bu rotayı koruyoruz.
    {
        path: 'notes',
        component: NotesComponent,
        canActivate: [authGuard]
    },
    
    // Varsayılan yol: Uygulama başladığında '/login' sayfasına yönlendir.
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];