/**
 * Carousel component overrides
 */

import type { ComponentOverride } from './types';

const override: ComponentOverride = {
  component: 'carousel',
  patches: [
    {
      id: 'use-carousel-export',
      description: 'Export useCarousel hook',
      reason: 'Allow external components to access carousel state',
      find: `export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}`,
      replace: `export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}`,
    },
  ],
};

export default override;
