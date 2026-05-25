// Public surface of the `product` feature module.
// App code imports from here, never from module internals.
export { ProductPage } from './components/product-page';
export { getProductBySlug, getAllSlugs } from './data/product-content';
