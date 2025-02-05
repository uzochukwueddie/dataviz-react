export interface IMenuItem {
  icon: string;
  class: string;
  label: string;
  route: string;
}

export interface ISQLPayload {
  promptQuery: string;
  sqlQuery: string;
}
