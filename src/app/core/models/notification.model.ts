export type NotificationTone = 'primary' | 'success' | 'warning';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: NotificationTone;
}

export interface NotificationItemDefinition {
  id: string;
  titleKey: string;
  bodyKey: string;
  time: string;
  tone: NotificationTone;
}

export const APP_NOTIFICATIONS: NotificationItemDefinition[] = [
  {
    id: 'notif-1',
    titleKey: 'notifications.n1.title',
    bodyKey: 'notifications.n1.body',
    time: '2 min',
    tone: 'success'
  },
  {
    id: 'notif-2',
    titleKey: 'notifications.n2.title',
    bodyKey: 'notifications.n2.body',
    time: '18 min',
    tone: 'primary'
  },
  {
    id: 'notif-3',
    titleKey: 'notifications.n3.title',
    bodyKey: 'notifications.n3.body',
    time: '1 h',
    tone: 'warning'
  }
];
