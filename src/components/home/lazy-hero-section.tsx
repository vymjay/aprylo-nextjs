'use client';

import { LazyHero } from '@/components/common/universal-lazy';

export default function LazyHeroSection() {
  return (
    <LazyHero
      importFunc={() => import('./hero-section')}
    />
  );
}
