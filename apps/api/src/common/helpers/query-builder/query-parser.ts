/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable no-prototype-builtins */
import { camelCase, isEmpty, lowerCase, snakeCase } from 'lodash';
import {
  Brackets,
  type ColumnType,
  type EntityMetadata,
  type WhereExpressionBuilder,
} from 'typeorm';
import { type ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { type RelationMetadata } from 'typeorm/metadata/RelationMetadata';

import { type PageOptionsDto } from '../../dtos/page-options.dto';

export enum Operator {
  AND = 'AND',
  OR = 'OR',
}

export interface IFieldOptions {
  is?: string;
  not?: string;
  in?: string;
  not_in?: string;
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  not_contains?: string;
  starts_with?: string;
  not_starts_with?: string;
  ends_with?: string;
  not_ends_with?: string;
}

export type Field = Record<string, IFieldOptions>;

export type Where = {
  [K in Operator]?: Array<Where | Field>;
};

let globalParameterCount = 0;

function handleArguments(
  query: WhereExpressionBuilder,
  field: Field,
  andOr: 'andWhere' | 'orWhere',
  alias: string,
) {
  const whereArguments = Object.entries(field);
  whereArguments.map((whereArgument) => {
    const [fieldName, filters] = whereArgument;
    const ops = Object.entries(filters);

    ops.map((parameters, index) => {
      const [operation, value] = parameters;
      globalParameterCount += 1 + index;

      switch (operation) {
        case 'is': {
          query[andOr](
            `${alias}.${fieldName} = :isvalue${globalParameterCount}`,
            {
              ['isvalue' + globalParameterCount]: value,
            },
          );
          break;
        }

        case 'not': {
          query[andOr](
            `${alias}.${fieldName} != :notvalue${globalParameterCount}`,
            {
              ['notvalue' + globalParameterCount]: value,
            },
          );
          break;
        }

        case 'in': {
          query[andOr](
            `${alias}.${fieldName} IN (:...invalue${globalParameterCount})`,
            {
              ['invalue' + globalParameterCount]: value,
            },
          );
          break;
        }

        case 'not_in': {
          query[andOr](
            `${alias}.${fieldName} NOT IN :notinvalue${globalParameterCount}`,
            {
              ['notinvalue' + globalParameterCount]: value,
            },
          );
          break;
        }

        case 'lt': {
          query[andOr](
            `${alias}.${fieldName} < :ltvalue${globalParameterCount}`,
            {
              ['ltvalue' + globalParameterCount]: value,
            },
          );
          break;
        }

        case 'lte': {
          query[andOr](
            `${alias}.${fieldName} <= :ltevalue${globalParameterCount}`,
            {
              ['ltevalue' + globalParameterCount]: value,
            },
          );
          break;
        }

        case 'gt': {
          query[andOr](
            `${alias}.${fieldName} > :gtvalue${globalParameterCount}`,
            {
              ['gtvalue' + globalParameterCount]: value,
            },
          );
          break;
        }

        case 'gte': {
          query[andOr](
            `${alias}.${fieldName} >= :gtevalue${globalParameterCount}`,
            {
              ['gtevalue' + globalParameterCount]: value,
            },
          );
          break;
        }

        case 'contains': {
          query[andOr](
            `${alias}.${fieldName} ILIKE :convalue${globalParameterCount}`,
            {
              ['convalue' + globalParameterCount]: `%${value}%`,
            },
          );
          break;
        }

        case 'not_contains': {
          query[andOr](
            `${alias}.${fieldName} NOT ILIKE :notconvalue${globalParameterCount}`,
            {
              ['notconvalue' + globalParameterCount]: `%${value}%`,
            },
          );
          break;
        }

        case 'starts_with': {
          query[andOr](
            `${alias}.${fieldName} ~* :swvalue${globalParameterCount}`,
            {
              ['swvalue' + globalParameterCount]: `^[${value}]`,
            },
          );
          break;
        }

        case 'not_starts_with': {
          query[andOr](
            `${alias}.${fieldName} NOT ILIKE :nswvalue${globalParameterCount}`,
            {
              ['nswvalue' + globalParameterCount]: `${value}%`,
            },
          );
          break;
        }

        case 'ends_with': {
          query[andOr](
            `${alias}.${fieldName} ILIKE :ewvalue${globalParameterCount}`,
            {
              ['ewvalue' + globalParameterCount]: `%${value}`,
            },
          );
          break;
        }

        case 'not_ends_with': {
          query[andOr](
            `${alias}.${fieldName} ILIKE :newvalue${globalParameterCount}`,
            {
              ['newvalue' + globalParameterCount]: `%${value}`,
            },
          );
          break;
        }

        case 'array_contains': {
          {
            query[andOr](
              `array_to_string(${alias}.${fieldName}, ',') ILIKE :acvalue${globalParameterCount}`,
              {
                ['acvalue' + globalParameterCount]: `%${value}%`,
              },
            );
          }

          break;
        }

        case 'enum_contains': {
          {
            // Generic enum matching — pass value directly
            query[andOr](
              `${alias}.${fieldName} = :ecvalue${globalParameterCount}`,
              {
                ['ecvalue' + globalParameterCount]: value,
              },
            );
          }

          break;
        }

        case 'in_relation': {
          {
            query[andOr](`${fieldName} IN (:irvalue${globalParameterCount})`, {
              ['irvalue' + globalParameterCount]: value,
            });
          }

          break;
        }

        case 'is_date': {
          {
            // Use native Date instead of moment
            const dateValue = new Date(value as string);
            const startOfDay = new Date(dateValue);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateValue);
            endOfDay.setHours(23, 59, 59, 999);

            query[andOr](
              `${alias}.${fieldName} BETWEEN :idvalue1${globalParameterCount} AND :idvalue2${globalParameterCount}`,
              {
                ['idvalue1' + globalParameterCount]: startOfDay,
                ['idvalue2' + globalParameterCount]: endOfDay,
              },
            );
          }

          break;
        }

        case 'is_null': {
          {
            query[andOr](`${alias}.${fieldName} IS NULL`);
          }

          break;
        }

        case 'is_not_null': {
          {
            query[andOr](`${alias}.${fieldName} IS NOT NULL`);
          }

          break;
        }

        default: {
          break;
        }
      }
    });
  });

  return query;
}

export function traverseTree(
  query: WhereExpressionBuilder,
  where: Where,
  upperOperator = Operator.AND,
  alias: string,
) {
  function buildNewBrackets(w: Where, operator: Operator, als: string) {
    return new Brackets((qb) =>
      w[operator]?.map((queryArray) => {
        traverseTree(qb, queryArray, operator, als);
      }),
    );
  }

  for (const key of Object.keys(where)) {
    if (key === Operator.OR) {
      query = query.orWhere(buildNewBrackets(where, Operator.OR, alias));
    } else if (key === Operator.AND) {
      query = query.andWhere(buildNewBrackets(where, Operator.AND, alias));
    } else {
      // Field
      query = handleArguments(
        query,
        where as Field,
        upperOperator === Operator.AND ? 'andWhere' : 'orWhere',
        where[key]?.alias ? where[key]?.alias : alias,
      );
    }
  }

  return query;
}

// combining between query and options
export function combineQueryString(query = {}, options = {}) {
  const combinedObject = {};

  for (const key in query) {
    if (query.hasOwnProperty(key)) {
      combinedObject[key] = query[key];
    }
  }

  for (const key in options) {
    if (isEmpty(query)) {
      combinedObject[key] = options[key];
    } else {
      if (options.hasOwnProperty(key)) {
        if (combinedObject.hasOwnProperty(key)) {
          if (!Array.isArray(combinedObject[key])) {
            combinedObject[key] = [combinedObject[key]];
          }

          combinedObject[key].push(...options[key]);
        } else {
          combinedObject[Object.keys(combinedObject)[0]]?.push({
            AND: options[key],
          });
        }
      }
    }
  }

  return combinedObject;
}

export function deepDiveQueryFromColumnMetaData(
  entityMetadata: EntityMetadata,
  options: PageOptionsDto,
): Record<string, any> | { AND: Array<Record<string, any>> } {
  const createdQuery: { AND: Array<Record<string, any>> } = {
    AND: [],
  };

  const defineQueryByColumnType = ({
    type = 'varchar',
    colName = '',
    colVal: colValue = '',
    isArray = false,
    alias = '',
  }: {
    type: ColumnType;
    colName: string;
    colVal: any;
    isArray: boolean;
    alias?: string;
  }) => {
    switch (type) {
      case 'string':
      case 'varchar':
        createdQuery.AND.push({
          [snakeCase(colName)]: {
            contains: colValue,
            ...(alias ? { alias } : {}),
          },
        });
        break;

      case 'array':
      case 'simple-array':
        createdQuery.AND.push({
          [snakeCase(colName)]: {
            array_contains: colValue,
            ...(alias ? { alias } : {}),
          },
        });
        break;

      case 'enum':
      case 'simple-enum':
        createdQuery.AND.push({
          [snakeCase(colName)]: {
            enum_contains: colValue,
            ...(alias ? { alias } : {}),
          },
        });
        break;

      case 'text':
        if (isArray) {
          createdQuery.AND.push({
            [snakeCase(colName)]: {
              array_contains: [colValue],
              ...(alias ? { alias } : {}),
            },
          });
        } else {
          createdQuery.AND.push({
            [snakeCase(colName)]: {
              contains: colValue,
              ...(alias ? { alias } : {}),
            },
          });
        }

        break;

      case 'date':
      case 'timestamp':
        createdQuery.AND.push({
          [snakeCase(colName)]: {
            is_date: colValue,
            ...(alias ? { alias } : {}),
          },
        });
        break;

      case 'numeric':
      case 'number':
      case 'int':
      case 'integer':
      case 'smallint':
        if (isArray) {
          createdQuery.AND.push({
            [snakeCase(colName)]: {
              in: colValue.split(',').map(Number),
              ...(alias ? { alias } : {}),
            },
          });
        } else {
          createdQuery.AND.push({
            [snakeCase(colName)]: {
              is: colValue,
              ...(alias ? { alias } : {}),
            },
          });
        }

        break;

      case 'uuid':
        createdQuery.AND.push({
          [snakeCase(colName) + '::text']: {
            is: colValue,
            ...(alias ? { alias } : {}),
          },
        });
        break;

      default:
        createdQuery.AND.push({
          [snakeCase(colName)]: {
            contains: colValue,
            ...(alias ? { alias } : {}),
          },
        });
        break;
    }
  };

  const findTargetColumnMetadata = (
    emd: EntityMetadata,
    relationshipChain: string,
  ): ColumnMetadata | undefined => {
    const relations = relationshipChain.split('_');
    let currentEntityMetadata: EntityMetadata | undefined = emd;

    while (relations.length > 0 && currentEntityMetadata) {
      const columnName = relations.shift(); // Assuming the part is the column name

      const relation = currentEntityMetadata.relations.find(
        (rel: RelationMetadata) => rel.propertyName === columnName,
      );

      if (relation) {
        currentEntityMetadata = relation.inverseEntityMetadata;
      } else {
        const columnMetadata = currentEntityMetadata.columns.find(
          (column: ColumnMetadata) => column.propertyName === columnName,
        );

        return columnMetadata ? columnMetadata : undefined;
      }
    }

    return undefined;
  };

  if (!isEmpty(options.filter)) {
    Object.keys(options.filter).map((key) => {
      const columnName = key;
      const columnValue = options.filter?.[key];

      const isColumn = entityMetadata.columns.find(
        (x) => x.propertyName === columnName && !x.relationMetadata,
      );

      // SINGLE FIELD
      if (isColumn) {
        defineQueryByColumnType({
          type: isColumn.type,
          colName: columnName,
          colVal: columnValue,
          isArray: isColumn.isArray,
        });
      }

      // IN RELATIONS
      const hasRelations = entityMetadata.relations;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (hasRelations) {
        const isManyToOneColumns = hasRelations.filter((x) => x.isManyToOne);

        //  For filtering injected referenced column in entity (e.g.: columnNameId)
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!isColumn && isManyToOneColumns) {
          const column = isManyToOneColumns
            .map((x) => x.joinColumns[0])
            .find((x) => x.givenDatabaseName === snakeCase(columnName));

          if (column) {
            defineQueryByColumnType({
              type: 'int',
              colName: columnName,
              colVal: columnValue,
              isArray: false,
            });
          }
        }
      }

      // For filter another field in relation (e.g: filter columnName in entity from another entity)
      if (columnName.includes('_')) {
        const foundColumnMetaData = findTargetColumnMetadata(
          entityMetadata,
          columnName,
        );

        if (Boolean(columnValue) && foundColumnMetaData) {
          const splittedColumns = columnName.split('_');
          const targetRelColumnName: string = splittedColumns.at(-1) ?? ''; // assign fieldName from last index from array

          splittedColumns.pop(); // remove last index of splitted column for aliasing list columnNameA.columnNameB

          let type = foundColumnMetaData.type;

          if (typeof foundColumnMetaData.type === 'function') {
            type = lowerCase(foundColumnMetaData.type.name) as ColumnType;
          }

          defineQueryByColumnType({
            type,
            colName: targetRelColumnName,
            colVal: columnValue,
            isArray:
              foundColumnMetaData.isArray ||
              (columnValue as string).includes(','),
            alias: splittedColumns.join('.'),
          });
        }
      }
    });
  }

  return createdQuery.AND.length > 0 ? createdQuery : {};
}
