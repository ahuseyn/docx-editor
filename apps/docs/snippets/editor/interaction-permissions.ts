import type { Config } from 'superdoc';

export const permissionOptions = {
  interaction: {
    comments: { level: 'resolve' },
    trackedChanges: { allowDecisions: true },
  },
  permissionResolver: ({ permission }) => {
    switch (permission) {
      case 'COMMENTS_DELETE_OTHER':
      case 'REJECT_OTHER':
        return false;
      default:
        return undefined;
    }
  },
} satisfies Pick<Config, 'interaction' | 'permissionResolver'>;
