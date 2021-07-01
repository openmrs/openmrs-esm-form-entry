export interface ListResult<T> {
  results: Array<T>;
}

 export interface GetLocation {
  uuid: string;
  display: string;
}

export interface GetProvider {
  uuid: string;
  display: string;
}
