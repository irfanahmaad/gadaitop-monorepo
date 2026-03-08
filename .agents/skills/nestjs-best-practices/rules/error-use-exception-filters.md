---
title: Use Exception Filters for Error Handling
impact: HIGH
impactDescription: Consistent, centralized error handling
tags: error-handling, exception-filters, consistency
---

## Use Exception Filters for Error Handling

Do not catch exceptions and manually format error responses in controllers. Throw NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.) and let the framework handle the response. Use a global exception filter for specific error types (e.g. TypeORM `QueryFailedError`) to map database/ORM errors to consistent, user-friendly HTTP responses.

**Incorrect (manual error handling in controllers):**

```typescript
// Manual error handling in controllers
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.usersService.findById(id);
      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          message: 'User not found',
        });
      }
      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }
}
```

**Correct (throw HTTP exceptions + global filter for DB errors — align with apps/api):**

```typescript
// Controllers: throw built-in HTTP exceptions
@Controller('companies')
export class CompanyController {
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CompanyDto> {
    const company = await this.companyService.findOne(id);
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return company;
  }
}
```

**Global filter for TypeORM QueryFailedError:** Map PostgreSQL error codes to HTTP status and a clear message so 500s become 400/409 where appropriate.

```typescript
// common/filters/query-failed-error.filter.ts
@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
  catch(exception: QueryFailedError & { code?: string; detail?: string; ... }, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const { statusCode, message } = this.resolveError(exception.code, exception.detail, ...);
    response.status(statusCode).json({ statusCode, message, error: '...' });
  }
  private resolveError(code?: string, detail?: string, ...): { statusCode: number; message: string } {
    // Map PG codes: 23505 → 409 Conflict, 23502 → 400 Bad Request, 23503 → 400/409, etc.
  }
}

// main.ts
app.useGlobalFilters(new QueryFailedErrorFilter());
```

NestJS already turns thrown `HttpException` into JSON responses; the filter is for non-HTTP errors (e.g. DB) that would otherwise become 500.

Reference: [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
