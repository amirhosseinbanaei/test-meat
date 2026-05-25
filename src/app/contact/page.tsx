import type { Metadata } from 'next';
import { ContactPage } from '@/modules/contact';

export const metadata: Metadata = {
  title: 'تماس با ما — میت پلاس | Meat Plus',
  description:
    'با میت پلاس تماس بگیرید. آدرس: تهران، صادقیه. تلفن: ۰۲۱-۴۴۴۲۵۸۷۴. ایمیل: info@meatplus.ir',
};

export default function Page() {
  return <ContactPage />;
}
