import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const mockStep = createStep({
  id: 'mock-step',
  execute: async () => {
    return { success: true };
  }
});

export const deploymentWorkflow = createWorkflow({
  name: 'deployment-workflow',
})
.then(mockStep)
.commit();
