import { User } from '../types';

export const USERS: User[] = [
  {
    id: 'user1',
    username: 'alice_student',
    password: 'study123',
    role: 'user',
    name: 'Alice Johnson'
  },
  {
    id: 'user2',
    username: 'aditi',
    password: 'aditi123',
    role: 'user',
    name: 'Aditi Dhiman'
  },
  {
    id: 'user3',
    username: 'neeraj',
    password: 'neeraj123',
    role: 'user', 
    name: 'Neeraj Kumar'
  },
  {
    id: 'user4',
    username: 'govt_student',
    password: 'student101',
    role: 'user',
    name: 'Govt Student'
  },
  {
    id: 'admin1',
    username: 'admin',
    password: 'NKBadminpass',
    role: 'admin',
    name: 'Administrator'
  }
];