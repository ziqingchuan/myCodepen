export interface Case {
  id: string;
  title: string;
  code: string;
  create_time: string;
}

export interface CaseInput {
  title: string;
  code: string;
}
