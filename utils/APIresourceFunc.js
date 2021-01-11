class APIresourceFunc {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  AdvancedFilter() {
    // Excluding some keys from the search query
    const queryObject = { ...this.queryString };
    const removeFields = ['page', 'sort', 'limit', 'fields'];
    removeFields.forEach(field => delete queryObject[field]);

    //Advanced filtering
    let regStr = JSON.stringify(queryObject);
    regStr = regStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(regStr));

    return this;
  }

  sort() {
    //Sort the query
    if (this.queryString.sort) {
      //sort(filed1, field2..)
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-date_created');
    }
    return this;
  }

  fieldSort() {
    // User specified fields
    if (this.queryString.fields) {
      const byFields = this.queryString.sort.split(',').join('');
      this.query = this.query.sort(byFields);
    } else {
      this.query = this.query.sort('-__v');
    }

    return this;
  }

  paginate() {
    //Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skipPage = (page - 1) * limit;

    // page=2&limit=20
    this.query = this.query.skip(skipPage).limit(limit);

    return this;
  }
}
module.exports = APIresourceFunc;
