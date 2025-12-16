import { Injectable } from '@angular/core';

@Injectable({
  // servisi tüm uygulamada (root) erişilebilir yapar
  providedIn: 'root'
})
export class AuthService {
  // Kullanıcının oturum durumunu tutan değişken.Başlangıçta false (giriş yapılmamış)
  private loggedInStatus = false;

  constructor() { }

  // Kullanıcının giriş yapıp yapmadığını döndürür
  isLoggedIn(): boolean {
    return this.loggedInStatus;
  }

  // Durumu true yapar (simülasyon için bu şekilde yazdım)
  // Gerçek uygulamada API çağrısı ve JWT/token kaydı burada olacak
  login(): void {
    this.loggedInStatus = true;
    console.log('Kullanıcı Giriş Yaptı (Simülasyon).');
  }

  // Çıkış: Durumu false yapar
  logout(): void {
    this.loggedInStatus = false;
    console.log('Kullanıcı Çıkış Yaptı (Simülasyon).');
  }
}