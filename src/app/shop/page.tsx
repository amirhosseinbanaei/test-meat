import type { Metadata } from 'next';
import { ShopPage } from '@/modules/shop';

export const metadata: Metadata = {
  title: 'فروشگاه — میت پلاس | Meat Plus',
  description:
    'خرید آنلاین محصولات پروتئینی: گوشت قرمز، مرغ، دریایی و شترمرغ با بهترین کیفیت از میت پلاس.',
};

export default function Page() {
  return <ShopPage />;
}
