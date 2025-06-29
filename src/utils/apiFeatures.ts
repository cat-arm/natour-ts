import { Query } from 'mongoose';

// Define a type for the query string ex ?duration[gte]=5&price[lt]=1000&page=2
interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: unknown // Obect with string key and unknown value -> We don't know the type of the value
}

// method for changing the query string to a query object in mongoose
// <T> is a generic type We have to assign type to T before using the class ex const features = new APIFeatures<Tour>(Tour.find(), req.query); -> T is Tour
class APIFeatures<T> {
  query: Query<T[], T>; // Query<T[], T> is a type that represents a query on a collection of documents of type T ex T = User → Query<User[], User>
  queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // method for filtering the query with the query string ex [gte] to $gte
  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // method for sorting the query with the query string ex /api/tours?sort=price,duration then this.queryString.sort = price,duration
  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // method for limiting the fields with the query string ex /api/tours?fields=name,duration then this.queryString.fields = name,duration
  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // method for paginating the query with the query string ex /api/tours?page=2&limit=10 then this.queryString.page = 2 and this.queryString.limit = 10
  paginate(): this {
    const page = this.queryString.page ? parseInt(this.queryString.page, 10) : 1;
    const limit = this.queryString.limit ? parseInt(this.queryString.limit, 10) : 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures; 