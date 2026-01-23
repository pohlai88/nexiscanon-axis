/**
 * Item component overrides
 */

import type { ComponentOverride } from './types';

const override: ComponentOverride = {
  component: 'item',
  patches: [
    {
      id: 'item-xs-size',
      description: 'Add xs size variant for compact items',
      reason: 'Used for smaller item displays in dropdown menus',
      find: `sm: "gap-2.5 px-3 py-2.5",
      },`,
      replace: `sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 [[data-slot=dropdown-menu-content]_&]:p-0",
      },`,
    },
  ],
};

export default override;
