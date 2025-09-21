import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Reusable SEO meta component for setting page metadata
 * Usage:
 * <Meta title="Home | FOODY" description="Order delicious food fast at IIT & IISER Tirupati" canonical={url} />
 */
export default function Meta({ title, description, canonical, noindex = false, children }) {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {children}
    </Helmet>
  );
}