import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo, STATUS } from 'angular-in-memory-web-api';
import { Note } from './notes.service';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const users = [
      { id: 1, username: 'admin', email: 'admin@example.com', password: 'password123' },
      { id: 2, username: 'daniel', email: 'daniel@example.com', password: 'SecurePass123!' }
    ];

    const notes: Note[] = [
      { id: 1, title: 'Welcome', content: 'Welcome to Notesy! This is data from the Mock API.', timestamp: new Date(), isCompleted: false },
      { id: 2, title: 'Tasks', content: 'Finish the Angular Project.', timestamp: new Date(), isCompleted: true }
    ];

    // Important: 'login' key must exist here to be intercepted as a valid URL
    return { users, notes, login: [] }; 
  }

  genId(collection: any[]): number {
    return collection.length > 0 ? Math.max(...collection.map(item => item.id)) + 1 : 11;
  }

  // Intercept POST requests
  post(reqInfo: RequestInfo) {
    // 1. Check if the request is for 'login'
    if (reqInfo.collectionName === 'login') {
      
      console.log('🛑 MOCK API: Login Request Intercepted');
      
      // 2. Extract Body
      const body = reqInfo.utils.getJsonBody(reqInfo.req);
      console.log('📩 MOCK API: Received Credentials:', body);

      // 3. Get User Database
      const db = reqInfo.utils.getDb() as any;
      const users = db.users;

      // 4. Check Credentials
      const user = users.find((u: any) => {
        // Check email OR username
        const isEmailMatch = u.email === body.email;
        const isUserMatch = u.username === body.username || u.username === body.email; // Handle case where user types email in username field
        const isPassMatch = u.password === body.password;
        
        return (isEmailMatch || isUserMatch) && isPassMatch;
      });

      if (user) {
        console.log('mV MOCK API: Login SUCCESS for user:', user.username);
        return reqInfo.utils.createResponse$(() => ({
          body: {
            authToken: 'fake-jwt-token-' + Math.random(),
            refreshToken: 'fake-refresh-token-' + Math.random(),
            user: { id: user.id, username: user.username, email: user.email }
          },
          status: STATUS.OK
        }));
      } else {
        console.error('❌ MOCK API: Login FAILED. User not found or wrong password.');
        return reqInfo.utils.createResponse$(() => ({
          body: { error: 'Invalid credentials' },
          status: STATUS.UNAUTHORIZED
        }));
      }
    }
    
    // Default behavior for other requests (like adding notes)
    return undefined;
  }
}