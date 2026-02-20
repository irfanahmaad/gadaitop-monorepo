import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

interface PostgresError {
  code?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
  dataType?: string;
  schema?: string;
}

/**
 * Global exception filter that catches TypeORM QueryFailedError
 * and returns user-friendly HTTP responses instead of 500 errors.
 *
 * Covers all major PostgreSQL error classes:
 * - Class 22: Data Exception
 * - Class 23: Integrity Constraint Violation
 * - Class 25: Invalid Transaction State
 * - Class 40: Transaction Rollback
 * - Class 42: Syntax Error or Access Rule Violation
 * - Class 53: Insufficient Resources
 * - Class 54: Program Limit Exceeded
 * - Class 55: Object Not In Prerequisite State
 * - Class 57: Operator Intervention
 * - Class 58: System Error
 *
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedErrorFilter.name);

  catch(exception: QueryFailedError & PostgresError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const pgCode = exception.code;
    const detail = exception.detail;
    const constraint = exception.constraint;
    const table = exception.table;
    const column = exception.column;

    const { statusCode, message } = this.resolveError(pgCode, detail, constraint, table, column, exception);

    // Log based on severity
    if (statusCode >= 500) {
      this.logger.error(
        `DB error [${pgCode}] table="${table}": ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `DB constraint [${pgCode}] table="${table}" constraint="${constraint}": ${message}`,
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: this.getHttpErrorLabel(statusCode),
    });
  }

  private resolveError(
    pgCode: string | undefined,
    detail: string | undefined,
    constraint: string | undefined,
    table: string | undefined,
    column: string | undefined,
    exception: QueryFailedError,
  ): { statusCode: number; message: string } {
    switch (pgCode) {
      // ─── Class 22: Data Exception ────────────────────────────────
      case '22001': // string_data_right_truncation
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Value too long for column${column ? ` "${column}"` : ''}`,
        };
      case '22003': // numeric_value_out_of_range
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Numeric value out of range${column ? ` for column "${column}"` : ''}`,
        };
      case '22007': // invalid_datetime_format
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid date/time format',
        };
      case '22008': // datetime_field_overflow
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Date/time value out of range',
        };
      case '22012': // division_by_zero
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Division by zero',
        };
      case '22P02': // invalid_text_representation
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid input syntax — check that IDs and enum values are in the correct format',
        };
      case '22P03': // invalid_binary_representation
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid binary data format',
        };
      case '22026': // string_data_length_mismatch
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `String length mismatch${column ? ` for column "${column}"` : ''}`,
        };

      // ─── Class 23: Integrity Constraint Violation ────────────────
      case '23000': // integrity_constraint_violation (generic)
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `Integrity constraint violation${constraint ? ` (${constraint})` : ''}`,
        };
      case '23001': // restrict_violation
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `Cannot delete or update — referenced by other records${constraint ? ` (${constraint})` : ''}`,
        };
      case '23502': { // not_null_violation
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Required field${column ? ` "${column}"` : ''} cannot be null`,
        };
      }
      case '23503': { // foreign_key_violation
        const fkMatch = detail?.match(/Key \((.+?)\)=\((.+?)\)/);
        if (detail?.includes('is not present in table')) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: fkMatch
              ? `Referenced record with ${fkMatch[1]} "${fkMatch[2]}" does not exist`
              : `Foreign key reference does not exist${constraint ? ` (${constraint})` : ''}`,
          };
        }
        if (detail?.includes('is still referenced from table')) {
          const refMatch = detail?.match(/is still referenced from table "(.+?)"/);
          return {
            statusCode: HttpStatus.CONFLICT,
            message: refMatch
              ? `Cannot delete — still referenced by records in "${refMatch[1]}"`
              : `Cannot delete — still referenced by other records${constraint ? ` (${constraint})` : ''}`,
          };
        }
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: fkMatch
            ? `Foreign key violation: ${fkMatch[1]} "${fkMatch[2]}"`
            : `Foreign key constraint violation${constraint ? ` (${constraint})` : ''}`,
        };
      }
      case '23505': { // unique_violation
        const match = detail?.match(/Key \((.+?)\)=\((.+?)\) already exists/);
        return {
          statusCode: HttpStatus.CONFLICT,
          message: match
            ? `A record with ${match[1]} "${match[2]}" already exists`
            : `Duplicate value violates unique constraint${constraint ? ` (${constraint})` : ''}`,
        };
      }
      case '23514': // check_violation
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Value violates check constraint${constraint ? ` "${constraint}"` : ''}`,
        };
      case '23P01': // exclusion_violation
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `Conflicting value violates exclusion constraint${constraint ? ` (${constraint})` : ''}`,
        };

      // ─── Class 25: Invalid Transaction State ─────────────────────
      case '25001': // active_sql_transaction
      case '25002': // branch_transaction_already_active
      case '25006': // read_only_sql_transaction
      case '25007': // schema_and_data_statement_mixing_not_supported
      case '25008': // held_cursor_requires_same_isolation_level
      case '25P01': // no_active_sql_transaction
      case '25P02': // in_failed_sql_transaction
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A transaction error occurred. Please try again.',
        };

      // ─── Class 40: Transaction Rollback ──────────────────────────
      case '40001': // serialization_failure
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Transaction conflict — please retry your request',
        };
      case '40P01': // deadlock_detected
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Deadlock detected — please retry your request',
        };
      case '40003': // statement_completion_unknown
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Transaction outcome unknown. Please verify and retry.',
        };

      // ─── Class 42: Syntax / Access Rule Violation ────────────────
      case '42501': // insufficient_privilege
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Insufficient database privileges for this operation',
        };
      case '42601': // syntax_error
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A query syntax error occurred',
        };
      case '42602': // invalid_name
      case '42622': // name_too_long
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid or too-long identifier name',
        };
      case '42703': // undefined_column
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Column does not exist${column ? `: "${column}"` : ''}`,
        };
      case '42P01': // undefined_table
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Table does not exist${table ? `: "${table}"` : ''}`,
        };
      case '42P07': // duplicate_table
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `Table already exists${table ? `: "${table}"` : ''}`,
        };
      case '42710': // duplicate_object
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Database object already exists',
        };
      case '42702': // ambiguous_column
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ambiguous column reference in query',
        };
      case '42846': // cannot_coerce
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cannot convert data type — check that values match the expected type',
        };
      case '42883': // undefined_function
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database function does not exist',
        };
      case '42P18': // indeterminate_datatype
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Could not determine data type of parameter',
        };

      // ─── Class 53: Insufficient Resources ────────────────────────
      case '53000': // insufficient_resources
      case '53100': // disk_full
      case '53200': // out_of_memory
      case '53300': // too_many_connections
        return {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'The server is temporarily under heavy load. Please try again later.',
        };

      // ─── Class 54: Program Limit Exceeded ────────────────────────
      case '54000': // program_limit_exceeded
      case '54001': // statement_too_complex
      case '54011': // too_many_columns
      case '54023': // too_many_arguments
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Request too complex — try reducing the query scope or number of parameters',
        };

      // ─── Class 55: Object Not In Prerequisite State ──────────────
      case '55000': // object_not_in_prerequisite_state
      case '55006': // object_in_use
      case '55P03': // lock_not_available
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'The resource is currently locked or in use. Please try again.',
        };

      // ─── Class 57: Operator Intervention ─────────────────────────
      case '57000': // operator_intervention
      case '57014': // query_canceled
      case '57P01': // admin_shutdown
      case '57P02': // crash_shutdown
      case '57P03': // cannot_connect_now
        return {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'The database is temporarily unavailable. Please try again later.',
        };

      // ─── Class 58: System Error ──────────────────────────────────
      case '58000': // system_error
      case '58030': // io_error
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An internal system error occurred. Please try again or contact support.',
        };

      // ─── Default / Unknown ──────────────────────────────────────
      default: {
        this.logger.error(
          `Unhandled QueryFailedError [code=${pgCode}] table="${table}": ${exception.message}`,
          exception.stack,
        );
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred. Please try again or contact support.',
        };
      }
    }
  }

  private getHttpErrorLabel(statusCode: number): string {
    const labels: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };
    return labels[statusCode] ?? 'Error';
  }
}
