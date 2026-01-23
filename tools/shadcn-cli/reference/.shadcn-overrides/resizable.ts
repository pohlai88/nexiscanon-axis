/**
 * Resizable component overrides
 */

import type { ComponentOverride } from './types';

const override: ComponentOverride = {
  component: 'resizable',
  patches: [
    {
      id: 'resizable-panel-group-alias',
      description:
        'Add ResizablePanelGroupComponent wrapper for type consistency',
      reason: 'Provides consistent naming with other components',
      find: `export { ResizablePanelGroup, ResizablePanel, ResizableHandle }`,
      replace: `export { ResizablePanelGroup as ResizablePanelGroupComponent, ResizablePanelGroup, ResizablePanel, ResizableHandle }`,
    },
  ],
};

export default override;
