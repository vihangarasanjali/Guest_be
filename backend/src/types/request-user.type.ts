export interface RequestUser {
  id: number;
  email: string;
  name: string;
  role: string; // 'ADMIN' | 'GUEST'
}
