export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  birthDate: Date;
  isActive: boolean;
  passwordHash: string;
}