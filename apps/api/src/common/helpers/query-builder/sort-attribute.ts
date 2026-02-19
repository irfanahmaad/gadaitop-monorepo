export const sortAttribute = (
  sortBy: string,
  sortShape?: any,
): Record<string, any> | null => {
  if (!sortBy) {
    return null;
  }

  let sortKey = sortBy;
  let sortOrder = 'ASC';

  if (sortBy.includes('-')) {
    sortKey = sortBy.split('-')[1];
    sortOrder = 'DESC';
  }

  function changeDeepestKey(object: any) {
    const key = Object.keys(object)[0];

    if (object[key] === true) {
      object[key] = sortOrder;
    } else {
      changeDeepestKey(object[key]);
    }
  }

  if (sortShape) {
    if (sortShape[sortKey]) {
      changeDeepestKey(sortShape[sortKey]);

      return sortShape[sortKey];
    }

    return null;
  }

  return { [sortKey]: sortOrder };
};
