import React from 'react';
import { GraduationCap, MapPin, Edit2, Baby, Briefcase } from 'lucide-react';

export const lookingForOptions = [
  { id: 'meetups', label: 'Join local meetups', icon: '📍' },
  { id: 'friends', label: 'Find friends', icon: '👥' },
  { id: 'hobbies', label: 'Share hobbies & activities', icon: '🎨' },
  { id: 'socialize', label: 'Low-pressure socializing', icon: '💬' },
  { id: 'network', label: 'Professional networking', icon: '💼' },
];

export const interestOptions = [
  'Small Business Marketing', 'Group Singing', 'Poker', 'Acoustic Guitar',
  'Photography', 'Hiking', 'Cooking', 'Reading', 'Traveling', 'Yoga',
  'Painting', 'Dancing', 'Writing', 'Coding', 'Gardening', 'Other',
];

export const aboutMeOptions = [
  { id: 'graduate', label: 'Recent Graduate', icon: <GraduationCap size={20} /> },
  { id: 'student', label: 'Student', icon: '🎒' },
  { id: 'newInTown', label: 'New In Town', icon: <MapPin size={20} /> },
  { id: 'emptyNester', label: 'New Empty Nester', icon: '🏠' },
  { id: 'retired', label: 'Newly Retired', icon: <Edit2 size={20} /> },
  { id: 'parent', label: 'New Parent', icon: <Baby size={20} /> },
  { id: 'careerChange', label: 'Career Change', icon: <Briefcase size={20} /> },
];

export const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
