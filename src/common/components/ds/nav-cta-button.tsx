import { Button } from "../ui/button";

export function NavCtaButton({
  label = "دسته بندی محصولات",
}: {
  label?: string;
}) {
  return (
    <Button variant="olive" size="md" aria-haspopup="menu">
      {label}
      {/* <AlignJustify className="size-3.5" strokeWidth={2.4} /> */}
    </Button>
  );
}
