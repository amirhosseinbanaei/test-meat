import type { Metadata } from 'next';
import { CartPage } from '@/modules/cart';

export const metadata: Metadata = {
  title: 'سبد خرید — میت پلاس | Meat Plus',
  description: 'سبد خرید شما در میت پلاس. مشاهده و مدیریت اقلام انتخابی، اعمال کد تخفیف و ادامه جهت تسویه حساب.',
};

export default function Page() {
  return <CartPage />;
}
