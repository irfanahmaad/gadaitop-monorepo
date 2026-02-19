/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable dot-notation */
import { isEmpty, isObject, uniq } from 'lodash';
import {
  EntityMetadata,
  FindOperator,
  type FindOptionsRelations,
  type FindOptionsSelect,
  type FindOptionsWhere,
  type ObjectLiteral,
  type SelectQueryBuilder,
} from 'typeorm';


import {
  combineQueryString,
  deepDiveQueryFromColumnMetaData,
  traverseTree,
} from './query-parser';

export type QueryBuilderOptionsType<T> = {
  relation?: FindOptionsRelations<T>;
  select?: FindOptionsSelect<T>;
  where?: FindOptionsWhere<T>;
  orderBy?: {
    [K in keyof T]?: T[K] extends Record<string, any>
      ? QueryBuilderOptionsType<T[K]>['orderBy'] // Allow nested orderBy for object-like properties
      : 'ASC' | 'DESC'; // Allow ASC | DESC for flat properties
  };
  // PageOptionsDto fields (allow plain object spread from class instance)
  order?: string;
  page?: number;
  pageSize?: number;
  skip?: number;
  filter?: Record<string, string | number>;
  sortBy?: string;
  query?: string;
  getSkip?: () => number;
  getTake?: () => number | undefined;
};

export class DynamicQueryBuilder {
  constructor(private entityMeta: EntityMetadata) {}

  async buildDynamicQuery<Entity extends ObjectLiteral>(
    qb: SelectQueryBuilder<Entity>,
    options: QueryBuilderOptionsType<Entity>,
  ): Promise<[Entity[], number]> {
    const rootAlias = qb.alias;
    const columnSelected: string[] = [
      `${rootAlias}.id`,
      `${rootAlias}.createdAt`,
    ];

    // populate target selected columns
    const selectOpt = options.select;

    if (!isEmpty(selectOpt)) {
      const addSelects = (alias: string, selects: Record<string, any>) => {
        for (const select of Object.keys(selects)) {
          const nestedSelects = selects[select];

          if (typeof nestedSelects === 'object') {
            addSelects(select, nestedSelects);
          } else {
            columnSelected.push(`${alias}.${select}`);
          }
        }
      };

      addSelects(rootAlias, selectOpt);
    }

    // populate target selected relations
    const relationOpt = options.relation;

    if (!isEmpty(relationOpt)) {
      const joinRelations = (alias: string, relations: Record<string, any>) => {
        for (const relation of Object.keys(relations)) {
          const nestedRelations = relations[relation];

          if (typeof nestedRelations === 'object') {
            const relationMetadata =
              this.entityMeta.findRelationWithPropertyPath(relation);

            if (relationMetadata) {
              qb.leftJoinAndSelect(`${alias}.${relation}`, relation);
              joinRelations(relation, nestedRelations);
            }
          } else {
            qb.leftJoinAndSelect(`${alias}.${relation}`, relation);
          }
        }
      };

      joinRelations(rootAlias, relationOpt);
    }

    qb.select(uniq(columnSelected));

    const isWhere = options.where;

    if (!isEmpty(isWhere)) {
      const addWhere = (
        alias: string,
        where: Record<string, any>,
        operator = 'eq',
      ) => {
        for (const key of Object.keys(where)) {
          const value = where[key];
          const nestedAlias = `${alias}.${key}`;

          if (typeof value === 'object' && !Array.isArray(value)) {
            if (value instanceof FindOperator) {
              addWhere(
                nestedAlias,
                { [key]: value?.['_value'] },
                value?.['_type'],
              );
            } else {
              addWhere(nestedAlias, value, 'eq');
            }
          } else {
            let op = operator;

            if (Array.isArray(value)) {
              op = 'in';
            }

            const splittedAlias = alias.split('.');
            const penultimateIndex = splittedAlias.length - 2;
            const penultimateElement =
              splittedAlias.length > 2
                ? splittedAlias[penultimateIndex]
                : splittedAlias[0];

            const condition = this.translateCondition(
              penultimateElement,
              key,
              op,
            );
            const translatedValue = this.translateValue(operator, value);

            qb.andWhere(condition, { [key]: translatedValue });

            if (Array.isArray(value)) {
              qb.setParameter(`${key}`, translatedValue);
            }
          }
        }
      };

      addWhere(rootAlias, isWhere);
    }

    // populate where clause from query string + filter
    const isQueryExist = options.query ? JSON.parse(options.query) : {};

    const combinQSWithFilteringQueryBuilder = Object.assign(
      isQueryExist,
      combineQueryString(
        isQueryExist,
        deepDiveQueryFromColumnMetaData(this.entityMeta, options as any),
      ),
    );

    traverseTree(qb, combinQSWithFilteringQueryBuilder, undefined, qb.alias);

    const order = isEmpty(options.orderBy) ? null : options.orderBy;

    if (order) {
      const processOrder = (o: Record<string, any>, alias: string) => {
        Object.entries(o).forEach(([key, value]) => {
          if (isObject(value)) {
            processOrder(value, `${alias}.${key}`);
          } else {
            qb.addOrderBy(`${alias}.${key}`, value);
          }
        });
      };

      processOrder(order, rootAlias);
    }

    // Use gadaitop pagination helpers
    const take = options.getTake?.() ?? options.pageSize;
    const skip = options.getSkip?.() ?? (options.page - 1) * options.pageSize;

    if (take !== undefined) {
      qb.take(take);
    }
    qb.skip(skip);

    return qb.getManyAndCount();
  }

  translateCondition(alias: string, key: string, operator: string) {
    switch (operator) {
      case 'eq':
        return `${alias}.${key} = :${key}`;
      case 'not':
        return `${alias}.${key} != :${key}`;
      case 'gt':
        return `${alias}.${key} > :${key}`;
      case 'lt':
        return `${alias}.${key} < :${key}`;
      case 'gte':
        return `${alias}.${key} >= :${key}`;
      case 'lte':
        return `${alias}.${key} <= :${key}`;
      case 'in':
        return `${alias}.${key} IN (:...${key})`;
      case 'not_in':
        return `${alias}.${key} NOT IN (:...${key})`;
      case 'like':
      case 'ilike':
        return `${alias}.${key} LIKE :${key}`;
      case 'between':
        return `${alias}.${key} BETWEEN :${key}_start AND :${key}_end`;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  translateValue(operator: string, value: any) {
    if (operator === 'like') {
      return `%${value}%`;
    }

    return value;
  }
}
