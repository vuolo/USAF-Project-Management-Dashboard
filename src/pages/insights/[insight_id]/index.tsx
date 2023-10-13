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
  Building2Icon,
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
import { type IUpdateInsight } from "~/validation/insight";
import { useSession } from "next-auth/react";
import Modal from "~/components/ui/modals/modal";

const INITIAL_BREADCRUMB: NavItem = {
  id: "insights",
  name: "Insights",
  href: "/insights",
  current: false,
};

export default function Insight() {
  const user = useSession().data?.db_user;
  const router = useRouter();

  // Get Insights (executes on page load)
  const [insights, setInsights] = useState<insight[]>([]);
  const getInsights = api.insight.getInsights.useQuery(undefined, {
    enabled: !!router.query.insight_id,
    onSuccess: (data) => {
      const insights = data.result;
      setInsights(insights);
    },
    onError: (error) => {
      toast.error(toastMessage("Error Loading Insights", error.message));
      console.error("Mutation Error:", error);
    },
  });

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
      void getInsights.refetch();
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
                  isLoading={getInsights.isLoading}
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
                largeSize="min-h-[4rem] bg-transparent"
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
          <div className="ml-1 mr-3 mt-4 h-full overflow-x-auto pl-3.5 pr-2">
            {insight ? (
              <div className="flex flex-col space-y-8">
                {/* Top Details Section */}
                <div className="flex items-start justify-between">
                  {/* Insight Attributes (Left) */}
                  <div className="mt-4 flex flex-wrap items-start">
                    {/* TODO */}
                  </div>
                </div>
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
        </>
      }
      modals={<></>}
    />
  );
}
