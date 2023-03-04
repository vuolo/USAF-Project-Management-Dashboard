import type { clin_data_clin_type } from "@prisma/client";

export type view_clin = {
  id: number;
  clin_num: number;
  project_id: number;
  clin_type: clin_data_clin_type;
  clin_scope: string;
  ind_gov_est: number;
  clin_value: number;
};

// Field Types:
// #, Field, Schema, Table, Type, Character Set, Display Size, Precision, Scale
// 1,id,usaf-dash,clin_data,INT,binary,11,2,0
// 2,clin_num,usaf-dash,clin_data,INT,binary,11,4,0
// 3,project_id,usaf-dash,clin_data,INT,binary,11,3,0
// 4,clin_type,usaf-dash,clin_data,ENUM,utf8mb4,6,4,0
// 5,clin_scope,usaf-dash,clin_data,VARCHAR,utf8mb4,80,30,0
// 6,ind_gov_est,usaf-dash,clin_data,DECIMAL,binary,15,10,2
// 7,clin_value,usaf-dash,view_clin,DECIMAL,binary,37,8,2
