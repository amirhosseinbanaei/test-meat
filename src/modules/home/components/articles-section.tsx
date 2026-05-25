import {
  AllProductsButton,
  ArticleCard,
  Container,
  SectionTitle,
} from "@/common/components/ds";
import { articles } from "../data/home-content";

/**
 * Section 09 — "مقالات". Four article cards in a responsive grid (1 / 2 / 4
 * columns), preceded by a header row carrying the "view all" CTA on the
 * start side and the title on the end side.
 */
export function ArticlesSection() {
  return (
    <section className="pt-14" aria-label="مقالات">
      <Container>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SectionTitle className="font-khodkar text-5xl">مقالات</SectionTitle>
          <AllProductsButton label="همه مقالات" />
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {articles.map((article) => (
            <ArticleCard
              key={article.title}
              image={article.image}
              imageAlt={article.title}
              day={article.day}
              month={article.month}
              title={article.title}
              body={article.body}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
