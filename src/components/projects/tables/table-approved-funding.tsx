import type { approved_funding, funding_types } from "@prisma/client";
import { api } from "~/utils/api";
import { formatCurrency } from "~/utils/currency";

type TableProps = {
  approvedFunding?: approved_funding[];
};

function TableApprovedFunding({ approvedFunding }: TableProps) {
  const { data: fundingTypes } = api.funding_type.getAll.useQuery();

  const fiscalYears: number[] = [];
  const activeFundingTypeIds: number[] = [];

  // For each approved funding, add the fiscal year to the list of fiscal years,
  // and add the funding type to the list of active funding types
  approvedFunding?.forEach((approvedFunding) => {
    if (
      approvedFunding.appro_fiscal_year !== null &&
      !fiscalYears.includes(approvedFunding.appro_fiscal_year)
    )
      fiscalYears.push(approvedFunding.appro_fiscal_year);

    if (
      approvedFunding.appro_funding_type !== null &&
      !activeFundingTypeIds.includes(approvedFunding.appro_funding_type)
    )
      activeFundingTypeIds.push(approvedFunding.appro_funding_type);
  });

  return (
    <>
      <div className="mt-2 sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Approved Funding
          </h1>
        </div>
      </div>
      <div className="mt-2 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!approvedFunding ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : approvedFunding.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">
                    No approved funding to display.
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Funding Type
                      </th>
                      {fiscalYears.map((fiscalYear) => (
                        <th
                          key={fiscalYear}
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          FY&apos;{fiscalYear}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {fundingTypes &&
                      activeFundingTypeIds.map((activeFundingTypeId, idx) => (
                        <tr
                          key={activeFundingTypeId}
                          className={idx % 2 === 0 ? undefined : "bg-gray-50"}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                            {fundingTypes.find(
                              (fundingType) =>
                                fundingType.id === activeFundingTypeId
                            )?.funding_type ?? "N/A"}
                          </td>
                          {fiscalYears.map((fiscalYear) =>
                            approvedFunding.map(
                              (approvedFund, approvedFundIdx) =>
                                approvedFund.appro_fiscal_year === fiscalYear &&
                                approvedFund.appro_funding_type ===
                                  activeFundingTypeId ? (
                                  <td
                                    key={approvedFundIdx}
                                    className="px-3 py-4 text-sm text-gray-500"
                                  >
                                    {formatCurrency(
                                      Number(approvedFund.approved_amount)
                                    )}
                                  </td>
                                ) : null
                            )
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TableApprovedFunding;
