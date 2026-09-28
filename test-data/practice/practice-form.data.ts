import { randomString } from '../../helpers/random-data.helper.js';

export interface PracticeFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: 'male' | 'female';
  days: Array<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'>;
  country: string;
  colors: string[];
}

export function buildPracticeFormData(overrides?: Partial<PracticeFormData>): PracticeFormData {
  // 10 digit numeric phone
  const randomPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();

  const defaults: PracticeFormData = {
    name: randomString(6, 'User'),
    email: `u${randomString(5)}@test.com`,
    phone: randomPhone,
    address: `${randomString(5)} Street, Suite ${Math.floor(Math.random() * 100)}`,
    gender: 'male',
    days: ['monday', 'wednesday', 'friday'],
    country: 'canada',
    colors: ['blue', 'green'],
  };

  return {
    ...defaults,
    ...(overrides ? overrides : {}),
  };
}
