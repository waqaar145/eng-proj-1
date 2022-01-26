let orderByArray = ['desc', 'asc'];

module.exports.getPaginationValues = ({ pageSize, pageNo, sort, pattern, ...otherParams }) => {
  let offset = 0,
    limit = 0,
    sortBy="desc"
    orderBy = "desc",
    q = "";

  if (isNaN(pageSize)) {
    limit = 10;
  } else {
    limit = +pageSize;
  }

  if (isNaN(pageSize)) {
    offset = 0;
  } else {
    offset = limit * (pageNo - 1);
  }

  if (orderByArray.indexOf(sort) > -1) {
    sortBy = sort;
  }

  if (/^[a-z0-9 ]+$/i.test(pattern)) {
    q = pattern
  }

  return {
    offset,
    limit,
    sort: sortBy,
    q,
    pageNo: +pageNo,
    ...otherParams
  };
};