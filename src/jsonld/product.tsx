import React, { FC } from 'react';
import Head from 'next/head';

import markup from '../utils/markup';
import formatIfArray from '../utils/formatIfArray';

type ReviewRating = {
  bestRating?: string;
  ratingValue: string;
  worstRating?: string;
};

type Review = {
  author: string;
  datePublished?: string;
  reviewBody?: string;
  name?: string;
  reviewRating: ReviewRating;
};

type AggregateOffer = {
  lowPrice: string;
  priceCurrency: string;
  highPrice?: string;
  offerCount?: string;
};

type Offer = {
  price: string;
  priceCurrency: string;
  priceValidUntil?: string;
  itemCondition?: string;
  availability?: string;
  seller: {
    name: string;
  };
};

type Offers = AggregateOffer | Offer;

type AggregateRating = {
  ratingValue: string;
  reviewCount: string;
};

export interface ProductJsonLdProps {
  productName: string;
  images?: string[];
  description?: string;
  brand?: string;
  reviews: Review[];
  aggregateRating: AggregateRating;
  offers: Offers;
  sku?: string;
  gtin8?: string;
  gtin13?: string;
  gtin14?: string;
  mpn?: string;
}

const buildBrand = (brand: string) => `
  "brand": {
      "@type": "Thing",
      "name": "${brand}"
    },
`;

const buildReviewRating = (rating: ReviewRating) =>
  rating
    ? `"reviewRating": {
          "@type": "Rating",
          ${rating.bestRating ? `"bestRating": "${rating.bestRating}",` : ''}
          ${rating.worstRating ? `"worstRating": "${rating.worstRating}",` : ''}
          "ratingValue": "${rating.ratingValue}"
        },`
    : '';

const buildReviews = (reviews: Review[]) => `
"review": [
  ${reviews.map(
    review => `{
      "@type": "Review",
      ${
        review.datePublished
          ? `"datePublished": "${review.datePublished}",`
          : ''
      }
      ${review.reviewBody ? `"reviewBody": "${review.reviewBody}",` : ''}
      ${review.name ? `"name": "${review.name}",` : ''}
      ${buildReviewRating(review.reviewRating)}
      "author": "${review.author}"
  }`,
  )}],`;

const buildAggregateRating = (aggregateRating: AggregateRating) => `
  "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "${aggregateRating.ratingValue}",
      "reviewCount": "${aggregateRating.reviewCount}"
    },
`;

// TODO: Docs for offers itemCondition & availability
// TODO: Seller type, make dynamic
const buildOffer = (offer: Offer) => `
  "offers": {
    "@type": "Offer",
    "priceCurrency": "${offer.priceCurrency}",
    ${
      offer.priceValidUntil
        ? `"priceValidUntil": "${offer.priceValidUntil}",`
        : ''
    }
    ${offer.itemCondition ? `"itemCondition": "${offer.itemCondition}",` : ''}
    ${offer.availability ? `"availability": "${offer.availability}",` : ''}
    ${
      offer.seller
        ? `
      "seller": {
      "@type": "Organization",
      "name": "${offer.seller.name}"
    },
    `
        : ''
    }
    "price": "${offer.price}"
  },
`;

const buildAggregateOffer = (aggregateOffer: AggregateOffer) => `
  "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "${aggregateOffer.lowPrice}",
      "priceCurrency": "${aggregateOffer.priceCurrency}",
      ${
        aggregateOffer.offerCount
          ? `"offerCount": "${aggregateOffer.offerCount}",`
          : ''
      }
      ${
        aggregateOffer.highPrice
          ? `"highPrice": "${aggregateOffer.highPrice}",`
          : ''
      }
    },
`;

function isAggregateOffer(offers: Offers): offers is AggregateOffer {
  return (offers as AggregateOffer).lowPrice !== undefined;
}

const buildOffers = (offers: Offers) =>
  isAggregateOffer(offers) ? buildAggregateOffer(offers) : buildOffer(offers);

const ProductJsonLd: FC<ProductJsonLdProps> = ({
  productName,
  images = [],
  description,
  sku,
  gtin8,
  gtin13,
  gtin14,
  mpn,
  brand,
  reviews = [],
  aggregateRating,
  offers,
}) => {
  const jslonld = `{
    "@context": "http://schema.org/",
    "@type": "Product",
    "image":${formatIfArray(images)},
    ${description ? `"description": "${description}",` : ''}
    ${mpn ? `"mpn": "${mpn}",` : ''}
    ${sku ? `"sku": "${sku}",` : ''}
    ${gtin8 ? `"gtin8": "${gtin8}",` : ''}
    ${gtin13 ? `"gtin13": "${gtin13}",` : ''}
    ${gtin14 ? `"gtin14": "${gtin14}",` : ''}
    ${brand ? buildBrand(brand) : ''}
    ${reviews.length ? buildReviews(reviews) : ''}
    ${aggregateRating ? buildAggregateRating(aggregateRating) : ''}
    ${offers ? buildOffers(offers) : ''}
    "name": "${productName}"
  }`;

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={markup(jslonld)}
        key="jsonld-product"
      />
    </Head>
  );
};

export default ProductJsonLd;
