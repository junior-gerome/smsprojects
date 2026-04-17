import { Routes } from '@angular/router';
import { ChatPageComponent } from './presentation/chat-page.component';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    component: ChatPageComponent,
    title: 'Chat | Kinetic SMS'
  }
];
