export type Search = {
  id: number;
  url: string;
};

export type Listing = {
  id?: number;
  kslId: string;
  title: string;
  price: number;
  location: string;
};

export type Report = {
  createdOn: Date;
  rows: any[];
};
