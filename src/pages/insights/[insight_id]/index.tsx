import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { classNames } from "~/utils/misc";
import { toastMessage } from "~/utils/toast";
import {
  ArchiveBoxIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import SimpleLayout, { type NavItem } from "~/components/layouts/simple-layout";
import Dropdown from "~/components/ui/dropdown";
import Button from "~/components/ui/button";
import Input from "~/components/ui/input";
import { api } from "~/utils/api";
import type { $Enums, insight } from "@prisma/client";
import TextSkeleton from "~/components/ui/skeletons/text-skeleton";
import Breadcrumbs from "~/components/breadcrumbs";
import SlideOver from "~/components/ui/modals/slide-over";
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Building2Icon,
  CogIcon,
  DoorOpenIcon,
  FileTextIcon,
  FlagTriangleRightIcon,
  Loader2Icon,
  LocateFixedIcon,
  MapPinIcon,
  MicroscopeIcon,
  PlusIcon,
  RefreshCcwDotIcon,
  SearchCodeIcon,
  Settings2,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import {
  type FieldValues,
  useForm,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import {
  IUpdateInsightOptions,
  type IUpdateInsight,
  ContractAwardDayTimelineStatuses,
} from "~/validation/insight";
import { useSession } from "next-auth/react";
import Modal from "~/components/ui/modals/modal";
import DatePicker from "react-datepicker";

// Project filters
import MultiSelectBox from "~/components/ui/multi-select-box";
import type { view_project } from "~/types/view_project";

const INITIAL_BREADCRUMB: NavItem = {
  id: "insights",
  name: "Insights",
  href: "/insights",
  current: false,
};

const ANALYSIS_TYPE_OPTIONS = {
  AT_CAD: {
    name: "Contract Award Days",
    description: "This analysis type will...", // TODO: add description
  },
};

export default function Insight() {
  const user = useSession().data?.db_user;
  const router = useRouter();
  const [isShowingOptions, setIsShowingOptions] = useState(false);

  // Get Insight (executes on page load)
  const [insight, setInsight] = useState<insight>();
  const getInsight = api.insight.getInsight.useQuery(
    {
      id: parseInt(router.query.insight_id as string),
    },
    {
      enabled: !!router.query.insight_id,
      onSuccess: (data) => {
        const incomingInsight = data.result;

        // Prevent changes if the incoming insight is different from JSON of current state's insight
        if (JSON.stringify(incomingInsight) === JSON.stringify(insight)) return;

        // Check if insight.options is an object and has no keys (empty object)
        if (
          !incomingInsight.options ||
          (typeof incomingInsight.options === "object" &&
            Object.keys(incomingInsight.options as object).length === 0)
        ) {
          setIsShowingOptions(true);
          incomingInsight.options = null;
        }

        if (incomingInsight.options) {
          setIsShowingOptions(false);

          // Update UI: Analysis Type
          if (
            (
              incomingInsight.options as {
                analysis_type: string;
              }
            ).analysis_type === "AT_CAD"
          )
            insightOptionsForm.setValue(
              "analysis_type",
              (incomingInsight.options as { analysis_type: "" | "AT_CAD" })
                .analysis_type
            );

          // Update UI: Timeline Status
          if (
            (
              incomingInsight.options as {
                timeline_status: string;
              }
            ).timeline_status
          )
            insightOptionsForm.setValue(
              "timeline_status",
              (
                incomingInsight.options as {
                  timeline_status: ContractAwardDayTimelineStatuses;
                }
              ).timeline_status
            );

          // Update UI: Configure Parameters
          // ~ Start Date
          if (
            (
              incomingInsight.options as {
                startDate: string;
              }
            ).startDate
          )
            insightOptionsForm.setValue(
              "options.startDate",
              new Date(
                (incomingInsight.options as { startDate: string }).startDate
              )
            );
          // ~ End Date
          if (
            (
              incomingInsight.options as {
                endDate: string;
              }
            ).endDate
          )
            insightOptionsForm.setValue(
              "options.endDate",
              new Date((incomingInsight.options as { endDate: string }).endDate)
            );
          // ~ Contract Status
          if (
            (
              incomingInsight.options as {
                contract_status: string[];
              }
            ).contract_status
          )
            insightOptionsForm.setValue(
              "options.contract_status",
              (
                incomingInsight.options as {
                  contract_status: $Enums.contract_award_contract_status[];
                }
              ).contract_status
            );
          // ~ Additional Parameters (Contract Value, Max Days Delayed)
          if (
            (
              incomingInsight.options as {
                threshold: {
                  minContractValue: number;
                  maxDaysDelayed: number;
                };
              }
            ).threshold
          ) {
            insightOptionsForm.setValue(
              "options.threshold.minContractValue",
              (
                incomingInsight.options as {
                  threshold: {
                    minContractValue: number;
                    maxDaysDelayed: number;
                  };
                }
              ).threshold.minContractValue
            );
            insightOptionsForm.setValue(
              "options.threshold.maxDaysDelayed",
              (
                incomingInsight.options as {
                  threshold: {
                    minContractValue: number;
                    maxDaysDelayed: number;
                  };
                }
              ).threshold.maxDaysDelayed
            );
          }
        }

        setInsight(incomingInsight);

        insightDetailsForm.reset({
          // TODO: fix this type casting
          description: incomingInsight.description ?? undefined,
        });

        insightOptionsForm.reset({
          analysis_type: (incomingInsight.options as { analysis_type: string })
            ?.analysis_type as "AT_CAD" | "",
          timeline_status: (
            incomingInsight.options as { timeline_status: string }
          )?.timeline_status as ContractAwardDayTimelineStatuses,
          options: {
            // TODO: include additional parameters here (to restore them)
          },
        });
      },
      onError: (error) => {
        toast.error(toastMessage("Error Loading Insight", error.message));
        console.error("Mutation Error:", error);
      },
    }
  );

  // Update (Edit) Insight
  const editInsightForm = useForm<IUpdateInsight>();
  const [insightToEdit, setInsightToEdit] = useState<insight>();
  const [showEditSlideOver, setShowEditSlideOver] = useState(false);
  const updateInsight = api.insight.updateInsight.useMutation({
    onSuccess: (data) => {
      toast.success(toastMessage("Insight Updated", data.message));
      void getInsight.refetch();
      setShowEditSlideOver(false);
      setInsightToEdit(undefined);
      editInsightForm.reset();
    },
    onError: (error) => {
      toast.error(toastMessage("Error Updating Insight", error.message));
      console.error("Mutation Error:", error);
    },
  });
  const submitEditInsight = useCallback<SubmitHandler<IUpdateInsight>>(
    async (input) => {
      if (!insightToEdit) return;

      await updateInsight.mutateAsync({
        ...input,
        id: insightToEdit.id,
      });
    },
    [insightToEdit, updateInsight]
  );

  // Quick Update (Edit) Insight Details
  const insightDetailsForm = useForm<IUpdateInsight>();
  const submitInsightDetails = useCallback<SubmitHandler<IUpdateInsight>>(
    async (newDetails) => {
      if (!insight?.id) return;

      // Make sure the new details are different from the old details
      if (
        (newDetails.name !== undefined && newDetails.name === insight.name) ||
        (newDetails.description !== undefined &&
          newDetails.description === insight.description)
      )
        return;

      await updateInsight.mutateAsync({
        ...newDetails,
        id: insight.id,
      });
    },
    [updateInsight, insight]
  );

  // Sync Breadcrumbs with Insight (executes on insight change)
  const [breadcrumbs, setBreadcrumbs] = useState<NavItem[]>([
    INITIAL_BREADCRUMB,
  ]);
  useEffect(() => {
    if (!insight) return;
    setBreadcrumbs([
      INITIAL_BREADCRUMB,
      {
        id: insight.id.toString(),
        name: insight.name,
        href: `/insights/${insight.id}`,
        current: true,
      },
    ]);
  }, [insight]);

  // Insight Options
  const insightOptionsForm = useForm<IUpdateInsightOptions>();
  const analysisType = insightOptionsForm.watch("analysis_type");
  const timelineStatus = insightOptionsForm.watch("timeline_status");
  useEffect(() => {
    if (!analysisType) {
      void insightOptionsForm.reset();
      setSelectedProjects([]);
    }
  }, [analysisType, insightOptionsForm]);

  // Project Filters
  const [selectedProjects, setSelectedProjects] = useState<view_project[]>([]);
  const { data: projects } = api.project.list_view.useQuery();

  // Generate Insight
  const generateInsightResults_AT_CAD =
    api.insight.generateInsightResults_AT_CAD.useMutation({
      onSuccess: (data) => {
        toast.success(toastMessage("Insight Generated", data.message));
        void getInsight.refetch();
      },
      onError: (error) => {
        toast.error(toastMessage("Error Generating Insight", error.message));
        console.error("Mutation Error:", error);
      },
    });
  const submitGenerateInsight_AT_CAD = useCallback<
    SubmitHandler<IUpdateInsightOptions>
  >(
    async (input) => {
      if (!insight?.id) return;

      await generateInsightResults_AT_CAD.mutateAsync({
        id: insight.id,
        timeline_status: timelineStatus,
        // TODO: add other parameters here
      });
    },
    [generateInsightResults_AT_CAD, insight, timelineStatus]
  );

  return (
    <SimpleLayout
      variant="no-bg"
      mainContents={
        <>
          {/* Header */}
          <div className="mx-5 mt-3 flex flex-1 items-center justify-between space-x-4">
            <div>
              {insight ? (
                <div className="flex items-center space-x-2">
                  {insight.is_archived && (
                    <>
                      <ArchiveBoxIcon
                        className="h-4 w-4 rounded-sm text-gray-100 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                        data-tooltip-id="is-archived-header-tooltip"
                        data-tooltip-content="This icon indicates that the insight is archived."
                      />
                      <Tooltip
                        id="is-archived-header-tooltip"
                        className="z-10"
                      />
                    </>
                  )}
                  <h1 className="text-lg font-bold text-gray-100 [text-shadow:_0_2px_0_rgb(0_0_0_/_40%)]">
                    {insight.name}
                  </h1>
                </div>
              ) : (
                <TextSkeleton
                  width={"10rem"}
                  height={"1rem"}
                  className="rounded-md bg-gray-300"
                />
              )}

              <div className="relative top-2">
                <Breadcrumbs
                  breadcrumbs={breadcrumbs}
                  isLoading={getInsight.isLoading}
                  customWidth="max-w-[calc(100%-2.5rem)]"
                />
              </div>
            </div>

            {/* Header Buttons */}
            <div className="flex space-x-4">
              {/* Actions */}
              <Dropdown
                label="Actions"
                itemGroups={[
                  {
                    items: [
                      {
                        text: "Export Insight...",
                        icon: DocumentArrowDownIcon,
                        // TODO: Implement export
                        disabled: true,
                      },
                    ],
                  },
                  {
                    items: [
                      {
                        text: "Edit Details...",
                        icon: PencilIcon,
                        disabled: true,
                        // TODO: implement edit
                        // onClick: () => {
                        //   if (!insight) return;
                        //   editInsightForm.reset(
                        //     // TODO: fix this type casting
                        //     insight as unknown as IUpdateInsight
                        //   );
                        //   setInsightToEdit(insight);
                        //   setShowEditSlideOver(true);
                        // },
                      },
                    ],
                  },
                  {
                    items: [
                      {
                        text: "Archive...",
                        icon: ArchiveBoxIcon,
                        // TODO: Implement Archive
                        disabled: true,
                      },
                      {
                        text: "Delete...",
                        icon: TrashIcon,
                        // TODO: Implement delete
                        disabled: true,
                      },
                    ],
                  },
                ]}
              />
            </div>
          </div>

          {/* Details */}
          <div className="mx-1 mb-2 mt-12 px-3.5">
            {/* Description */}
            <form>
              <Input
                id="insight_description"
                // label="Description"
                variant="large"
                borderStyle="none"
                largeSize="min-h-[2rem] rounded-sm bg-transparent"
                type="text"
                className="text-slate-100 [text-shadow:_0_2px_0_rgb(0_0_0_/_40%)]"
                // optional
                placeholder="Begin typing to add a description..."
                register={insightDetailsForm.register("description")}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onBlur={insightDetailsForm.handleSubmit(submitInsightDetails)}
              />
            </form>
          </div>

          {/* Insight Options */}
          {!isShowingOptions && insight && (
            <>
              <div className="flex flex-col space-y-4">
                {/* Insight Options Header */}
                <div className="mx-3 mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-dark to-blue-800 p-3 text-white">
                  <h1 className="text-lg font-bold">
                    <CogIcon className="mr-2 inline-block h-6 w-6" /> Insight
                    Options
                  </h1>

                  {/* Toggle Show Options */}
                  {insight.options &&
                    insight.generated_at &&
                    (isShowingOptions ? (
                      <button
                        type="button"
                        onClick={() => setIsShowingOptions(false)}
                        className="flex items-center justify-center rounded-md bg-white bg-opacity-10 p-1.5 text-white"
                      >
                        <ArrowUpIcon className="h-5 w-5" />
                        <span className="sr-only">Hide Options</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsShowingOptions(true)}
                        className="flex items-center justify-center rounded-md bg-white bg-opacity-10 p-1.5 text-white"
                      >
                        <ArrowDownIcon className="h-5 w-5" />
                        <span className="sr-only">Show Options</span>
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
          <form
            className={classNames(
              "no-scrollbar mx-3 my-4 rounded-xl shadow-md",
              isShowingOptions
                ? "block h-full overflow-auto bg-white pb-6"
                : "hidden"
            )}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={insightOptionsForm.handleSubmit(
              submitGenerateInsight_AT_CAD
            )}
          >
            {insight ? (
              <div className="flex flex-col space-y-4">
                {/* Insight Options Header */}
                <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-brand-dark to-blue-800 p-3 text-white">
                  <h1 className="text-lg font-bold">
                    <CogIcon className="mr-2 inline-block h-6 w-6" /> Insight
                    Options
                  </h1>

                  {/* Toggle Show Options */}
                  {insight.options &&
                    insight.generated_at &&
                    (isShowingOptions ? (
                      <button
                        type="button"
                        onClick={() => setIsShowingOptions(false)}
                        className="flex items-center justify-center rounded-md bg-white bg-opacity-10 p-1.5 text-white"
                      >
                        <ArrowUpIcon className="h-5 w-5" />
                        <span className="sr-only">Hide Options</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsShowingOptions(true)}
                        className="flex items-center justify-center rounded-md bg-white bg-opacity-10 p-1.5 text-white"
                      >
                        <ArrowDownIcon className="h-5 w-5" />
                        <span className="sr-only">Show Options</span>
                      </button>
                    ))}
                </div>

                {isShowingOptions && (
                  <>
                    {/* Alert message */}
                    {!insight.options && !insight.generated_at && (
                      <div className="mx-4 flex flex-col items-center justify-center space-y-4 rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow">
                        <div className="flex items-center space-x-2">
                          <AlertTriangleIcon className="h-6 w-6 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">
                            This insight does not have any options set up yet.
                          </span>
                        </div>
                        <span className="text-xs font-normal text-gray-600">
                          Please select an analysis (insight) type below to get
                          started.
                        </span>
                      </div>
                    )}

                    {/* Insight Option menus */}
                    <div className="mx-auto flex w-1/3 flex-col items-center space-x-6 px-0 py-2 md:mx-0 md:w-full md:flex-row md:items-start md:justify-center md:px-14 lg:px-16">
                      {/* Analysis Type */}
                      <div className="flex flex-col space-y-2">
                        <label
                          htmlFor="analysis_type"
                          className="text-sm font-medium text-gray-800"
                        >
                          {!insight.options && !insight.generated_at && (
                            <>
                              <span className="font-bold text-blue-600">
                                1.
                              </span>{" "}
                              Select an{" "}
                            </>
                          )}{" "}
                          Analysis Type
                        </label>

                        <select
                          id="analysis_type"
                          className={`h-fit w-fit rounded-md bg-blue-50 text-gray-800 sm:text-sm ${
                            analysisType ? "" : "bg-red-50 text-[#DC2F0A]"
                          }`}
                          {...insightOptionsForm.register("analysis_type")}
                          disabled={
                            insight.options || insight.generated_at
                              ? true
                              : false
                          }
                        >
                          <option value="">...</option>
                          <option value="AT_CAD">Contract Award Days</option>
                        </select>
                      </div>
                      <ArrowRightIcon
                        className={classNames(
                          "mb-3 mt-auto hidden h-5 w-5 md:block",
                          analysisType ? "text-slate-600" : "text-slate-300"
                        )}
                      />

                      {/* [Contract Award Days]: Timeline Status */}
                      {analysisType === "AT_CAD" && (
                        <>
                          <div className="mt-4 flex flex-col space-y-2 md:mt-0">
                            <label
                              htmlFor="analysis_type"
                              className="text-sm font-medium text-gray-800"
                            >
                              {!insight.options && !insight.generated_at && (
                                <>
                                  <span className="font-bold text-blue-600">
                                    2.
                                  </span>{" "}
                                  Select a{" "}
                                </>
                              )}
                              Timeline Status
                            </label>

                            <select
                              id="timeline_status"
                              className={`h-fit w-fit rounded-md bg-blue-50 text-gray-800 sm:text-sm ${
                                timelineStatus ? "" : "bg-red-50 text-[#DC2F0A]"
                              }`}
                              {...insightOptionsForm.register(
                                "timeline_status"
                              )}
                              disabled={
                                insight.options || insight.generated_at
                                  ? true
                                  : false
                              }
                            >
                              <option value="">...</option>
                              <option value="requirement_plan">
                                Requirements Planning
                              </option>
                              <option value="draft_rfp_released">
                                Draft RFP Released
                              </option>
                              <option value="approved_by_acb">
                                Approved at ACB
                              </option>
                              <option value="rfp_released">RFP Released</option>
                              <option value="proposal_received">
                                Proposal Received
                              </option>
                              <option value="tech_eval_comp">
                                Tech Eval Complete
                              </option>
                              <option value="negotiation_comp">
                                Negotiations Complete
                              </option>
                              <option value="awarded">Awarded</option>
                            </select>
                          </div>

                          <ArrowRightIcon
                            className={classNames(
                              "mb-3 mt-auto hidden h-5 w-5 md:block",
                              timelineStatus
                                ? "text-slate-600"
                                : "text-slate-300"
                            )}
                          />

                          {/* [Contract Award Days]: Select Projects */}
                          {timelineStatus && projects && (
                            <>
                              <div className="mt-4 flex w-full flex-col space-y-2 md:mt-0 md:w-auto">
                                <label className="text-sm font-medium text-gray-800">
                                  {!insight.options &&
                                    !insight.generated_at && (
                                      <>
                                        <span className="font-bold text-blue-600">
                                          3.
                                        </span>{" "}
                                        Select{" "}
                                      </>
                                    )}{" "}
                                  Projects
                                </label>

                                <MultiSelectBox
                                  placeholder="All Projects (default)..."
                                  data={projects}
                                  displayValue={formatProjectName}
                                  displayValues={(selected: view_project[]) =>
                                    selected.map(formatProjectName).join(", ")
                                  }
                                  onSelectedItemsChange={(
                                    selected: view_project[]
                                  ) => {
                                    setSelectedProjects(selected);
                                  }}
                                  inputClassName="border-gray-500 min-w-[20rem] rounded-md bg-blue-50 text-gray-800 placeholder-gray-800 -mt-1"
                                  disabled={
                                    insight.options || insight.generated_at
                                      ? true
                                      : false
                                  }
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* Configure Parameters */}
                    {timelineStatus && projects && (
                      <>
                        <ArrowDownIcon className="mx-auto mb-3 hidden h-5 w-5 text-slate-600 md:block" />
                        <div className="mx-auto flex flex-col items-center space-y-2">
                          <label
                            htmlFor="configure_parameters"
                            className="text-sm font-medium text-gray-800"
                          >
                            {!insight.options && !insight.generated_at && (
                              <>
                                <span className="font-bold text-blue-600">
                                  4.
                                </span>{" "}
                                Configure{" "}
                              </>
                            )}
                            Parameters
                          </label>

                          <div
                            id="configure_parameters"
                            className="w-full max-w-4xl rounded-md border border-gray-500 bg-blue-50 p-6 shadow-sm"
                          >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* Start Date */}
                              <div>
                                <label
                                  htmlFor="start_date"
                                  className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                  Start Date
                                </label>
                                <Controller
                                  control={insightOptionsForm.control}
                                  name="options.startDate"
                                  render={({ field }) => (
                                    <DatePicker
                                      id="start_date"
                                      selected={field.value}
                                      onChange={(date) =>
                                        insightOptionsForm.setValue(
                                          "options.startDate",
                                          date ?? undefined
                                        )
                                      }
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                      placeholderText="Start Date"
                                      disabled={
                                        insight.options || insight.generated_at
                                          ? true
                                          : false
                                      }
                                    />
                                  )}
                                />
                              </div>

                              {/* End Date */}
                              <div>
                                <label
                                  htmlFor="end_date"
                                  className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                  End Date
                                </label>
                                <Controller
                                  control={insightOptionsForm.control}
                                  name="options.endDate"
                                  render={({ field }) => (
                                    <DatePicker
                                      id="end_date"
                                      selected={field.value}
                                      onChange={(date) =>
                                        insightOptionsForm.setValue(
                                          "options.endDate",
                                          date ?? undefined
                                        )
                                      }
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                      placeholderText="End Date"
                                      disabled={
                                        insight.options || insight.generated_at
                                          ? true
                                          : false
                                      }
                                    />
                                  )}
                                />
                              </div>

                              {/* Contract Status */}
                              {projects &&
                                selectedProjects &&
                                selectedProjects.length === 0 && (
                                  <div>
                                    <label
                                      htmlFor="contract_status"
                                      className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                      Contract Status
                                    </label>
                                    <Controller
                                      control={insightOptionsForm.control}
                                      name="options.contract_status"
                                      render={({ field }) => (
                                        <select
                                          {...field}
                                          id="contract_status"
                                          className="mt-1 block w-full overflow-hidden rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                          multiple
                                          disabled={
                                            insight.options ||
                                            insight.generated_at
                                              ? true
                                              : false
                                          }
                                        >
                                          {[
                                            "Pre_Award",
                                            "Awarded",
                                            "Closed",
                                          ].map((status) => (
                                            <option key={status} value={status}>
                                              {status.replace("_", "-")}
                                            </option>
                                          ))}
                                        </select>
                                      )}
                                    />
                                  </div>
                                )}

                              {/* Additional Parameters */}
                              <div className="grid grid-cols-2 gap-4">
                                {/* Contract Value */}
                                <div>
                                  <label
                                    htmlFor="min_contract_value"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                  >
                                    Min Contract Value
                                  </label>
                                  <Controller
                                    control={insightOptionsForm.control}
                                    name="options.threshold.minContractValue"
                                    render={({ field }) => (
                                      <input
                                        {...field}
                                        id="min_contract_value"
                                        type="number"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Minimum"
                                        disabled={
                                          insight.options ||
                                          insight.generated_at
                                            ? true
                                            : false
                                        }
                                      />
                                    )}
                                  />
                                </div>

                                {/* Max Days Delayed */}
                                <div>
                                  <label
                                    htmlFor="max_days_delayed"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                  >
                                    Max Days Delayed
                                  </label>
                                  <Controller
                                    control={insightOptionsForm.control}
                                    name="options.threshold.maxDaysDelayed"
                                    render={({ field }) => (
                                      <input
                                        {...field}
                                        id="max_days_delayed"
                                        type="number"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Maximum"
                                        disabled={
                                          insight.options ||
                                          insight.generated_at
                                            ? true
                                            : false
                                        }
                                      />
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        {!insight.options && !insight.generated_at && (
                          <Button
                            type="submit"
                            text="Generate Insight"
                            icon={SearchCodeIcon}
                            onClick={() => {
                              return;
                            }}
                            className="mx-auto mb-6 mt-4"
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            ) : (
              // Loading State
              <div className="mt-12 flex animate-bounce flex-col items-center justify-center">
                <Loader2Icon className="h-8 w-8 animate-spin text-gray-500" />
                <span className="text-md -mr-3 mt-2 whitespace-nowrap font-medium text-gray-500">
                  Loading...
                </span>
              </div>
            )}
          </form>

          {/* Insight Details */}
          <div
            className={classNames(
              "mx-3 mt-4 overflow-x-auto rounded-t-md bg-red-300 px-3.5 py-4 shadow-md",
              !isShowingOptions ? "h-full" : ""
            )}
          >
            {insight ? (
              <div className="flex flex-col space-y-8"></div>
            ) : (
              // Loading State
              <div className="mt-12 flex animate-bounce flex-col items-center justify-center">
                <Loader2Icon className="h-8 w-8 animate-spin text-gray-500" />
                <span className="text-md -mr-3 mt-2 whitespace-nowrap font-medium text-gray-500">
                  Loading...
                </span>
              </div>
            )}
          </div>
        </>
      }
      modals={<></>}
    />
  );
}

// Function to format project name with its status
const formatProjectName = (project: view_project) => {
  let statusLabel = "";
  switch (
    project.contract_status as
      | $Enums.contract_award_contract_status
      | "Pre-Award"
  ) {
    case "Awarded":
    case "Closed":
    case "Pre-Award":
      statusLabel = ` (${project.contract_status.replace("_", "-")})`;
      break;
    // Add other cases if needed
  }
  return `${project.project_name}${statusLabel}`;
};
