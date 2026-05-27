import type { Metadata } from 'next';
import { ProfilePage } from '@/modules/profile';

export const metadata: Metadata = {
  title: 'حساب کاربری — میت پلاس | Meat Plus',
  description:
    'مدیریت حساب کاربری، ویرایش اطلاعات، تغییر رمز عبور و مشاهده سفارشات در میت پلاس.',
};

export default function Page() {
  return <ProfilePage />;
}
