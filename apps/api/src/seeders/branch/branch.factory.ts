import { Factory } from '@concepta/typeorm-seeding';

import { BranchEntity } from '../../modules/branch/entities/branch.entity';

export class BranchFactory extends Factory<BranchEntity> {
  protected async entity(): Promise<BranchEntity> {
    const branch = new BranchEntity();

    return Promise.resolve(branch);
  }
}
