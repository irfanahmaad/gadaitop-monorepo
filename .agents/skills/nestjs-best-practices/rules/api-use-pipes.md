---
title: Use Pipes for Input Transformation
impact: MEDIUM
impactDescription: Pipes ensure clean, validated data reaches your handlers
tags: api, pipes, validation, transformation
---

## Use Pipes for Input Transformation

Use a global `ValidationPipe` with DTOs (class-validator) for body and query validation. Use `ParseUUIDPipe` for UUID route params (e.g. `:id`). Use DTOs with `@Type()` and `@Transform()` for query parsing (e.g. pagination). Pipes and DTOs keep validation/transformation out of controllers.

**Incorrect (manual type parsing in handlers):**

```typescript
// Manual type parsing in handlers
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    // Manual validation in every handler
    const uuid = id.trim();
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID');
    }
    return this.usersService.findOne(uuid);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<User[]> {
    // Manual parsing and defaults
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.usersService.findAll(pageNum, limitNum);
  }
}

// Type coercion without validation
@Get()
async search(@Query('price') price: string): Promise<Product[]> {
  const priceNum = +price; // NaN if invalid, no error
  return this.productsService.findByPrice(priceNum);
}
```

**Correct (global ValidationPipe + DTOs + ParseUUIDPipe — align with apps/api):**

```typescript
// main.ts — global validation
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);

// UUID route params: use ParseUUIDPipe
@Controller({ path: 'companies', version: '1' })
export class CompanyController {
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CompanyDto> {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCompanyDto,
  ): Promise<CompanyDto> {
    return this.companyService.update(id, updateDto);
  }
}

// List endpoints: use shared PageOptionsDto (or similar) with @Query()
export class PageOptionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pageSize: number = 10;

  @IsOptional()
  @IsEnum(Order)
  order?: Order = Order.ASC;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  query?: string;

  getSkip(): number {
    return (this.page - 1) * this.pageSize;
  }
  getTake(): number | undefined {
    return this.pageSize === 0 ? undefined : this.pageSize;
  }
}

@Get()
async findAll(@Query() options: PageOptionsDto) {
  return this.companyService.findAll(options);
}

// Body DTOs with class-validator
export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

Use custom pipes only when you need business-specific transformation (e.g. `ParseDatePipe`, `ParseArrayPipe`) not covered by DTOs.

Reference: [NestJS Pipes](https://docs.nestjs.com/pipes)
