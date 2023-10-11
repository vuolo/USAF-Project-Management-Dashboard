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

  const [scheduleDaysYellow, setScheduleDaysYellow] = useState<number>();
  const [scheduleDaysRed, setScheduleDaysRed] = useState<number>();
  const [dependencyDaysGreen, setDependencyDaysGreen] = useState<number>();
  const [dependencyDaysRed, setDependencyDaysRed] = useState<number>();

  useEffect(() => {
    setRedObligationBreakpoint(breakpoints?.obli_red_breakpoint);
    setYellowObligationBreakpoint(breakpoints?.obli_yellow_breakpoint);
    setRedExpenditureBreakpoint(breakpoints?.expen_red_breakpoint);
    setYellowExpenditureBreakpoint(breakpoints?.expen_yellow_breakpoint);

    setScheduleDaysYellow(breakpoints?.schedule_days_yellow);
    setScheduleDaysRed(breakpoints?.schedule_days_red);
    setDependencyDaysGreen(breakpoints?.dependency_days_green);
    setDependencyDaysRed(breakpoints?.dependency_days_red);
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
    // Validation for all fields
    if (
      typeof redObligationBreakpoint !== "number" ||
      typeof yellowObligationBreakpoint !== "number" ||
      typeof redExpenditureBreakpoint !== "number" ||
      typeof yellowExpenditureBreakpoint !== "number" ||
      typeof scheduleDaysYellow !== "number" ||
      typeof scheduleDaysRed !== "number" ||
      typeof dependencyDaysGreen !== "number" ||
      typeof dependencyDaysRed !== "number"
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
      schedule_days_yellow: scheduleDaysYellow,
      schedule_days_red: scheduleDaysRed,
      dependency_days_green: dependencyDaysGreen,
      dependency_days_red: dependencyDaysRed,
    });
  };

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Financial Summary Breakpoints</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pb-2 pt-4 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">
          Update Financial Breakpoints
        </h1>

        {typeof redObligationBreakpoint !== "number" ||
        typeof yellowObligationBreakpoint !== "number" ||
        typeof redExpenditureBreakpoint !== "number" ||
        typeof yellowExpenditureBreakpoint !== "number" ||
        typeof scheduleDaysYellow !== "number" ||
        typeof scheduleDaysRed !== "number" ||
        typeof dependencyDaysGreen !== "number" ||
        typeof dependencyDaysRed !== "number" ? (
          <p className="italic">Loading...</p>
        ) : (
          <>
            {/* Obligation Breakpoints */}
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

            {/* Expenditure Breakpoints */}
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

            {/* Dependency Days */}
            <div className="mt-2">
              <h2 className="text-lg font-medium">
                Dependency Summary: # of Days
              </h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex flex-col items-center justify-center gap-2">
                  <label htmlFor="dependency-days-green">
                    &quot;Green&quot; Days
                  </label>
                  <input
                    onChange={(e) =>
                      setDependencyDaysGreen(Number(e.target.value || 0))
                    }
                    type="number"
                    id="dependency-days-green"
                    name="dependency-days-green"
                    value={dependencyDaysGreen}
                    min={0}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) =>
                      setDependencyDaysGreen(value as number)
                    }
                    value={dependencyDaysGreen}
                    min={0}
                    max={365}
                    step={1}
                  />
                </div>
                <div className="mt-2 flex flex-col items-center justify-center gap-2">
                  <label htmlFor="dependency-days-red">
                    &quot;Red&quot; Days
                  </label>
                  <input
                    onChange={(e) =>
                      setDependencyDaysRed(Number(e.target.value || 0))
                    }
                    type="number"
                    id="dependency-days-red"
                    name="dependency-days-red"
                    value={dependencyDaysRed}
                    min={0}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => setDependencyDaysRed(value as number)}
                    value={dependencyDaysRed}
                    min={0}
                    max={365}
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* Schedule Days */}
            <div className="mt-2">
              <h2 className="text-lg font-medium">
                Schedule Summary: # of Days
              </h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex flex-col items-center justify-center gap-2">
                  <label htmlFor="schedule-days-yellow">
                    &quot;Yellow&quot; Days
                  </label>
                  <input
                    onChange={(e) =>
                      setScheduleDaysYellow(Number(e.target.value || 0))
                    }
                    type="number"
                    id="schedule-days-yellow"
                    name="schedule-days-yellow"
                    value={scheduleDaysYellow}
                    min={0}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => setScheduleDaysYellow(value as number)}
                    value={scheduleDaysYellow}
                    min={0}
                    max={365}
                    step={1}
                  />
                </div>
                <div className="mt-2 flex flex-col items-center justify-center gap-2">
                  <label htmlFor="schedule-days-red">
                    &quot;Red&quot; Days
                  </label>
                  <input
                    onChange={(e) =>
                      setScheduleDaysRed(Number(e.target.value || 0))
                    }
                    type="number"
                    id="schedule-days-red"
                    name="schedule-days-red"
                    value={scheduleDaysRed}
                    min={0}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => setScheduleDaysRed(value as number)}
                    value={scheduleDaysRed}
                    min={0}
                    max={365}
                    step={1}
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
