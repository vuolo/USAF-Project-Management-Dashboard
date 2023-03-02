import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Slider from "rc-slider";
import { api } from "~/utils/api";
import { toastMessage } from "~/utils/toast";

function AdminFinancialSummaryBreakpoints() {
  const { data: breakpoints } = api.financial_summary.getBreakpoints.useQuery();
  const [redObligationBreakpoint, setRedObligationBreakpoint] =
    useState<number>();
  const [yellowObligationBreakpoint, setYellowObligationBreakpoint] =
    useState<number>();
  const [redExpenditureBreakpoint, setRedExpenditureBreakpoint] =
    useState<number>();
  const [yellowExpenditureBreakpoint, setYellowExpenditureBreakpoint] =
    useState<number>();

  useEffect(() => {
    setRedObligationBreakpoint(breakpoints?.obli_red_breakpoint);
    setYellowObligationBreakpoint(breakpoints?.obli_yellow_breakpoint);
    setRedExpenditureBreakpoint(breakpoints?.expen_red_breakpoint);
    setYellowExpenditureBreakpoint(breakpoints?.expen_yellow_breakpoint);
  }, [breakpoints]);

  const updateBreakpoints = api.financial_summary.updateBreakpoints.useMutation(
    {
      onError(error) {
        toast.error(
          toastMessage(
            "Error Updating Breakpoints",
            "Please try again later. If the problem persists, please contact support."
          )
        );
        console.error(error);
      },
      onSuccess() {
        toast.success(
          toastMessage(
            "Breakpoints Updated",
            "The breakpoints were updated successfully."
          )
        );
      },
    }
  );

  const submitBreakpoints = () => {
    if (
      typeof redObligationBreakpoint !== "number" ||
      typeof yellowObligationBreakpoint !== "number" ||
      typeof redExpenditureBreakpoint !== "number" ||
      typeof yellowExpenditureBreakpoint !== "number"
    ) {
      toast.error(
        toastMessage(
          "Error Updating Breakpoints",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    void updateBreakpoints.mutateAsync({
      obli_red_breakpoint: redObligationBreakpoint,
      obli_yellow_breakpoint: yellowObligationBreakpoint,
      expen_red_breakpoint: redExpenditureBreakpoint,
      expen_yellow_breakpoint: yellowExpenditureBreakpoint,
    });
  };

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Financial Summary Breakpoints</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">
          Update Financial Breakpoints
        </h1>

        {typeof redObligationBreakpoint !== "number" ||
        typeof yellowObligationBreakpoint !== "number" ||
        typeof redExpenditureBreakpoint !== "number" ||
        typeof yellowExpenditureBreakpoint !== "number" ? (
          <p className="italic">Loading...</p>
        ) : (
          <>
            <div className="mt-2">
              <h2 className="text-lg font-medium">Obligation Breakpoints</h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex flex-col items-center justify-center gap-2">
                  <label htmlFor="obligation-breakpoint-red">
                    &quot;Red&quot; Percentage
                  </label>
                  <input
                    onChange={(e) =>
                      setRedObligationBreakpoint(Number(e.target.value || 0))
                    }
                    type="number"
                    id="obligation-breakpoint-red"
                    name="obligation-breakpoint-red"
                    value={redObligationBreakpoint}
                    min={0}
                    max={100}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) =>
                      setRedObligationBreakpoint(value as number)
                    }
                    value={redObligationBreakpoint}
                    min={0}
                    max={100}
                    step={0.5}
                  />
                </div>
                <div className="mt-2 flex flex-col items-center justify-center gap-2">
                  <label htmlFor="obligation-breakpoint-yellow">
                    &quot;Yellow&quot; Percentage
                  </label>
                  <input
                    onChange={(e) =>
                      setYellowObligationBreakpoint(Number(e.target.value || 0))
                    }
                    type="number"
                    id="obligation-breakpoint-yellow"
                    name="obligation-breakpoint-yellow"
                    value={yellowObligationBreakpoint}
                    min={0}
                    max={100}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) =>
                      setYellowObligationBreakpoint(value as number)
                    }
                    value={yellowObligationBreakpoint}
                    min={0}
                    max={100}
                    step={0.5}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-lg font-medium">Expenditure Breakpoints</h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex flex-col items-center justify-center gap-2">
                  <label htmlFor="expenditure-breakpoint-red">
                    &quot;Red&quot; Percentage
                  </label>
                  <input
                    onChange={(e) =>
                      setRedExpenditureBreakpoint(Number(e.target.value || 0))
                    }
                    type="number"
                    id="expenditure-breakpoint-red"
                    name="expenditure-breakpoint-red"
                    value={redExpenditureBreakpoint}
                    min={0}
                    max={100}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) =>
                      setRedExpenditureBreakpoint(value as number)
                    }
                    value={redExpenditureBreakpoint}
                    min={0}
                    max={100}
                    step={0.5}
                  />
                </div>
                <div className="mt-2 flex flex-col items-center justify-center gap-2">
                  <label htmlFor="expenditure-breakpoint-yellow">
                    &quot;Yellow&quot; Percentage
                  </label>
                  <input
                    onChange={(e) =>
                      setYellowExpenditureBreakpoint(
                        Number(e.target.value || 0)
                      )
                    }
                    type="number"
                    id="expenditure-breakpoint-yellow"
                    name="expenditure-breakpoint-yellow"
                    value={yellowExpenditureBreakpoint}
                    min={0}
                    max={100}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) =>
                      setYellowExpenditureBreakpoint(value as number)
                    }
                    value={yellowExpenditureBreakpoint}
                    min={0}
                    max={100}
                    step={0.5}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={submitBreakpoints}
              className="mt-6 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
            >
              Update Breakpoints
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminFinancialSummaryBreakpoints;
