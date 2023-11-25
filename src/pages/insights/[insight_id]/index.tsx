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
import type { insight } from "@prisma/client";
import TextSkeleton from "~/components/ui/skeletons/text-skeleton";
import Breadcrumbs from "~/components/breadcrumbs";
import SlideOver from "~/components/ui/modals/slide-over";
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowRightIcon,
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
} from "~/validation/insight";
import { useSession } from "next-auth/react";
import Modal from "~/components/ui/modals/modal";

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

  // Get Insight (executes on page load)
  const [insight, setInsight] = useState<insight>();
  const getInsight = api.insight.getInsight.useQuery(
    {
      id: parseInt(router.query.insight_id as string),
    },
    {
      enabled: !!router.query.insight_id,
      onSuccess: (data) => {
        const insight = data.result;

        // Check if insight.options is an object and has no keys (empty object)
        if (
          typeof insight.options === "object" &&
          Object.keys(insight.options as object).length === 0
        )
          insight.options = null;

        setInsight(insight);

        insightDetailsForm.reset({
          // TODO: fix this type casting
          description: insight.description ?? undefined,
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
          <div className="mx-3 my-4 rounded-xl bg-white pb-6 shadow-md">
            {insight ? (
              <div className="flex flex-col space-y-4">
                {/* Insight Options Header */}
                <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-brand-dark to-blue-800 p-3 text-white">
                  <h1 className="text-lg font-bold">
                    <CogIcon className="mr-2 inline-block h-6 w-6" /> Insight
                    Options
                  </h1>
                </div>
                {/* Alert message */}
                {!insight.options && (
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
                      <span className="font-bold text-blue-600">1.</span> Select
                      an Analysis Type
                    </label>

                    <select
                      id="analysis_type"
                      className={`h-fit w-fit rounded-md bg-blue-50 text-gray-800 sm:text-sm ${
                        analysisType ? "" : "bg-red-50 text-[#DC2F0A]"
                      }`}
                      {...insightOptionsForm.register("analysis_type")}
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
                          <span className="font-bold text-blue-600">2.</span>{" "}
                          Select a Timeline Status
                        </label>

                        <select
                          id="timeline_status"
                          className={`h-fit w-fit rounded-md bg-blue-50 text-gray-800 sm:text-sm ${
                            timelineStatus ? "" : "bg-red-50 text-[#DC2F0A]"
                          }`}
                          {...insightOptionsForm.register("timeline_status")}
                        >
                          <option value="">...</option>
                          <option value="Requirements Planning">
                            Requirements Planning
                          </option>
                          <option value="Draft RFP Released">
                            Draft RFP Released
                          </option>
                          <option value="Approved at ACB">
                            Approved at ACB
                          </option>
                          <option value="RFP Released">RFP Released</option>
                          <option value="Tech Eval Complete">
                            Tech Eval Complete
                          </option>
                          <option value="Negotiations Complete">
                            Negotiations Complete
                          </option>
                          <option value="Awarded">Awarded</option>
                        </select>
                      </div>

                      <ArrowRightIcon
                        className={classNames(
                          "mb-3 mt-auto hidden h-5 w-5 md:block",
                          timelineStatus ? "text-slate-600" : "text-slate-300"
                        )}
                      />

                      {/* [Contract Award Days]: Select Projects */}
                      {timelineStatus && projects && (
                        <>
                          <div className="mt-4 flex w-full flex-col space-y-2 md:mt-0 md:w-auto">
                            <label className="text-sm font-medium text-gray-800">
                              <span className="font-bold text-blue-600">
                                3.
                              </span>{" "}
                              Select Projects
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
                              inputClassName="border-gray-500 rounded-md bg-blue-50 text-gray-800 placeholder-gray-800 -mt-1"
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
                        <span className="font-bold text-blue-600">4.</span>{" "}
                        Configure Parameters
                      </label>

                      <div
                        id="configure_parameters"
                        className="h-fit w-fit min-w-[16rem] rounded-md border border-gray-500 bg-blue-50 px-4 py-2 text-gray-800 placeholder-gray-800 sm:text-sm"
                      >
                        TODO
                      </div>
                    </div>
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
          </div>

          {/* TODO: Insight Details */}
          <div className="mx-3 mt-4 h-full overflow-x-auto rounded-sm px-3.5 py-4">
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
  switch (project.contract_status) {
    case "Awarded":
    case "Closed":
    case "Pre_Award":
      statusLabel = ` (${project.contract_status})`;
      break;
    // Add other cases if needed
  }
  return `${project.project_name}${statusLabel}`;
};
