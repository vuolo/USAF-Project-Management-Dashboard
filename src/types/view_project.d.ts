import type {
  project_project_type,
  contract_award_contract_status,
} from "@prisma/client";

export type view_project = {
  id: number;
  project_name: string;
  project_type: project_project_type;
  contractor_id: number;
  contractor_name: string;
  contract_award_id: number;
  contract_num: string;
  contract_status: contract_award_contract_status;
  contract_value: number;
  ind_gov_est: number;
  branch_id: number;
  branch: string;
  requirement_type_id: number;
  requirement_type: string;
  summary: string;
  ccar_num: string;
  dependency_status: string;
  financial_status: string;
  schedule_status: string;
};

// Field Types:
// #, Field, Schema, Table, Type, Character Set, Display Size, Precision, Scale
// 1,id,usaf-dash,project,INT,binary,11,3,0
// 2,project_name,usaf-dash,project,VARCHAR,utf8mb4,80,18,0
// 3,project_type,usaf-dash,project,ENUM,utf8mb4,8,8,0
// 4,contractor_id,usaf-dash,contractor,INT UNSIGNED,binary,11,1,0
// 5,contractor_name,usaf-dash,contractor,VARCHAR,utf8mb4,50,9,0
// 6,contract_award_id,usaf-dash,contract_award,INT,binary,11,2,0
// 7,contract_num,usaf-dash,contract_award,VARCHAR,utf8mb4,80,16,0
// 8,contract_status,usaf-dash,contract_award,ENUM,utf8mb4,9,9,0
// 9,contract_value,usaf-dash,view_project,DECIMAL,binary,37,9,2
// 10,ind_gov_est,usaf-dash,view_project,DECIMAL,binary,37,10,2
// 11,branch_id,usaf-dash,branches,INT UNSIGNED,binary,11,1,0
// 12,branch,usaf-dash,branches,VARCHAR,utf8mb4,60,16,0
// 13,requirement_type_id,usaf-dash,requirement_types,INT UNSIGNED,binary,11,1,0
// 14,requirement_type,usaf-dash,requirement_types,VARCHAR,utf8mb4,50,9,0
// 15,summary,usaf-dash,project,TEXT,utf8mb4,65535,95,0
// 16,ccar_num,usaf-dash,project,VARCHAR,utf8mb4,60,15,0
// 17,dependency_status,usaf-dash,view_project,VARCHAR,utf8mb4,13,13,0
// 18,financial_status,usaf-dash,project,ENUM,utf8mb4,9,9,0
// 19,schedule_status,usaf-dash,project,ENUM,utf8mb4,13,13,0
