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
    username: 'bob_learner',
    password: 'learn456',
    role: 'user',
    name: 'Bob Smith'
  },
  {
    id: 'user3',
    username: 'carol_scholar',
    password: 'scholar789',
    role: 'user', 
    name: 'Carol Davis'
  },
  {
    id: 'user4',
    username: 'david_student',
    password: 'student101',
    role: 'user',
    name: 'David Wilson'
  },
  {
    id: 'admin1',
    username: 'admin',
    password: 'NKBadminpass',
    role: 'admin',
    name: 'Administrator'
  }
];