import Script from 'next/script'

interface StructuredDataProps {
  organizationData?: any
  breadcrumbData?: any
  productData?: any
  websiteData?: any
}

export function StructuredData({ 
  organizationData, 
  breadcrumbData, 
  productData, 
  websiteData 
}: StructuredDataProps) {
  const defaultOrganizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aprylo",
    "description": "Premium fashion store offering designer clothing for men, women, and children",
    "url": "https://vbcart.com", // Replace with your actual domain
    "logo": "https://vbcart.com/logos/vb_logo.png", // Replace with your actual domain
    "image": "https://vbcart.com/logos/vb_logo.png", // Replace with your actual domain
    "sameAs": [
      "https://www.facebook.com/vbcart", // Replace with your actual social media
      "https://www.instagram.com/vbcart",
      "https://www.twitter.com/vbcart"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-XXX-XXX-XXXX", // Replace with your actual phone
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Street Address", // Replace with your actual address
      "addressLocality": "Your City",
      "addressRegion": "Your State",
      "postalCode": "Your Zip",
      "addressCountry": "US"
    }
  }

  const defaultWebsiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Aprylo",
    "url": "https://vbcart.com", // Replace with your actual domain
    "description": "Premium fashion store offering designer clothing for men, women, and children",
    "publisher": {
      "@type": "Organization",
      "name": "Aprylo"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://vbcart.com/search?q={search_term_string}", // Replace with your actual domain
      "query-input": "required name=search_term_string"
    }
  }

  const ecommerceData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Aprylo",
    "description": "Premium fashion store offering designer clothing for men, women, and children",
    "url": "https://vbcart.com", // Replace with your actual domain
    "image": "https://vbcart.com/logos/vb_logo.png", // Replace with your actual domain
    "priceRange": "$$",
    "paymentAccepted": "Credit Card, Debit Card, PayPal, Razorpay",
    "currenciesAccepted": "USD, INR",
    "openingHours": "Mo-Su 00:00-23:59",
    "servesCuisine": "Fashion",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Fashion Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Men's Fashion",
            "category": "Clothing"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Women's Fashion",
            "category": "Clothing"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Children's Fashion",
            "category": "Clothing"
          }
        }
      ]
    }
  }

  return (
    <>
      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData || defaultOrganizationData),
        }}
      />

      {/* Website Schema */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData || defaultWebsiteData),
        }}
      />

      {/* Ecommerce Store Schema */}
      <Script
        id="store-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ecommerceData),
        }}
      />

      {/* Breadcrumb Schema */}
      {breadcrumbData && (
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData),
          }}
        />
      )}

      {/* Product Schema */}
      {productData && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productData),
          }}
        />
      )}
    </>
  )
}
