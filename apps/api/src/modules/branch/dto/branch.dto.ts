import { BranchEntity } from '../entities/branch.entity';

export class BranchDto extends BranchEntity {
  constructor(branch: BranchEntity) {
    super();
    Object.assign(this, branch);
  }
}
