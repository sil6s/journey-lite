export type ShopifyImage = {
  url: string;
  altText: string | null;
};

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  tags: string[];
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ShopifyVariant }[] };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost?: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          image?: ShopifyImage | null;
          price?: ShopifyMoney;
          product: { title: string; handle: string };
        };
      };
    }[];
  };
};

export type ProductsQuery = {
  products: { edges: { node: ShopifyProduct }[] };
};

export type CartCreateMutation = {
  cartCreate: { cart: ShopifyCart; userErrors: { message: string }[] };
};

export type CartLinesAddMutation = {
  cartLinesAdd: { cart: ShopifyCart; userErrors: { message: string }[] };
};

export type CartQuery = {
  cart: ShopifyCart | null;
};

export type CartLinesUpdateMutation = {
  cartLinesUpdate: { cart: ShopifyCart; userErrors: { message: string }[] };
};

export type CartLinesRemoveMutation = {
  cartLinesRemove: { cart: ShopifyCart; userErrors: { message: string }[] };
};
