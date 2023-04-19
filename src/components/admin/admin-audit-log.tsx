import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/utils/api";
import { toastMessage } from "~/utils/toast";
import type { contractor, users } from "@prisma/client";
import UsersTable from "./tables/users-table";
import AuditLogTable from "./tables/audit-log-table";

function AdminAuditLog() {
  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Audit Log</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <AuditLogTable />
      </div>
    </div>
  );
}

export default AdminAuditLog;
