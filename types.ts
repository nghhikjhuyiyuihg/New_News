
export type Category = 'פוליטיקה' | 'ספורט' | 'טכנולוגיה' | 'תרבות' | 'כלכלה' | 'בריאות';

export interface Comment {
  id: string;
  userName: string;
  text: string;
  createdAt: number;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author: string;
  category: Category;
  imageUrl: string;
  createdAt: number;
  isBreaking?: boolean;
  breakingExpiry?: number;
  comments?: Comment[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'user';
}
