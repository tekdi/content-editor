import type { CategoryDefinition, ShellManageConfig } from '../types';
import { postJson } from './http';

const READ_PATH = 'action/object/category/definition/v1/read?fields=objectMetadata,forms,name,label';

export async function readShellCategoryDefinition(config: ShellManageConfig): Promise<CategoryDefinition> {
  const result = await postJson<{ objectCategoryDefinition: CategoryDefinition }>(config, READ_PATH, {
    request: {
      objectCategoryDefinition: {
        objectType: 'Collection',
        name: 'Shell',
        channel: config.channel,
      },
    },
  });
  return result.objectCategoryDefinition;
}
