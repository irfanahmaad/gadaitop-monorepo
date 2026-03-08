---
title: Use Repository Pattern for Data Access
impact: HIGH
impactDescription: Decouples business logic from database
tags: architecture, repository, data-access
---

## Use Repository Pattern for Data Access

Prefer injecting TypeORM's `Repository<T>` in services via `@InjectRepository(Entity)`. For complex or reusable query logic, extract to a custom repository or query helper so services stay focused on business rules. This keeps data access testable and avoids bloating services with raw query building.

**Incorrect (complex queries in services):**

```typescript
// Complex queries in services
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
  ) {}

  async findActiveWithOrders(minOrders: number): Promise<User[]> {
    // Complex query logic mixed with business logic
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'order')
      .where('user.isActive = :active', { active: true })
      .andWhere('user.deletedAt IS NULL')
      .groupBy('user.id')
      .having('COUNT(order.id) >= :min', { min: minOrders })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  // Service becomes bloated with query logic
}
```

**Correct (inject Repository in service; optional custom repo for complex queries):**

```typescript
// Standard: inject TypeORM Repository in the service (align with apps/api)
@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity) private readonly repo: Repository<CompanyEntity>,
  ) {}

  async findOne(uuid: string): Promise<CompanyEntity | null> {
    return this.repo.findOne({ where: { uuid } });
  }

  async findAll(options: PageOptionsDto) {
    const { getSkip, getTake } = options;
    const [data, count] = await this.repo.findAndCount({
      skip: getSkip(),
      take: getTake(),
      order: { createdAt: 'DESC' },
    });
    return { data, meta: new PageMetaDto({ count, pageOptions: options }) };
  }

  async create(dto: CreateCompanyDto): Promise<CompanyEntity> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }
}
```

For complex queries, either keep a query builder in the service or extract to a dedicated repository/helper:

```typescript
// Optional: custom repository when queries are complex or reused
@Injectable()
export class UserQueryRepository {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findActiveWithMinOrders(minOrders: number): Promise<User[]> {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'order')
      .where('user.isActive = :active', { active: true })
      .andWhere('user.deletedAt IS NULL')
      .groupBy('user.id')
      .having('COUNT(order.id) >= :min', { min: minOrders })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private userQueryRepo: UserQueryRepository,
  ) {}

  async getActiveUsersWithOrders(): Promise<User[]> {
    return this.userQueryRepo.findActiveWithMinOrders(1);
  }
}
```

Reference: [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
