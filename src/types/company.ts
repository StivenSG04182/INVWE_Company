export interface Company {
  _id: string;
  name: string;
  logo?: string;
  stores?: Array<{_id: string, name: string}>;
}