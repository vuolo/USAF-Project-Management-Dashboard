import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type FieldValues,
  useForm,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { toastMessage } from "~/utils/toast";
import {
  ArchiveBoxIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import Input from "~/components/ui/input";
import Button from "~/components/ui/button";
import Dropdown, { type DropdownItemGroups } from "~/components/ui/dropdown";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import type { insight } from "@prisma/client";
import SimpleLayout, { type NavItem } from "~/components/layouts/simple-layout";
import SlideOver from "~/components/ui/modals/slide-over";
import type { IAddInsight, IUpdateInsight } from "~/validation/insight";
import {
  Building2Icon,
  DoorOpenIcon,
  FilterIcon,
  FilterXIcon,
  Loader2Icon,
  LocateFixedIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import Modal from "~/components/ui/modals/modal";
import FilterTabs, {
  type FilterTabOption,
  type FilterTab,
} from "~/components/ui/filter-tabs";
import type { DataRow } from "~/types/misc";
import TanstackTable from "~/components/ui/tanstack-table";
import { fuzzyFilter } from "~/utils/tanstack-table";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import DebouncedInput from "~/components/ui/debounced-input";
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import { LightbulbOffIcon } from "lucide-react";
import { classNames } from "~/utils/misc";

export default function Insights() {
  // Get Insights (executes on page load)
  const [insights, setInsights] = useState<insight[]>([]);
  const getInsights = api.insight.getInsights.useQuery(undefined, {
    onSuccess: (data) => {
      const insights = data.result;
      setInsights(insights);
    },
    onError: (error) => {
      toast.error(toastMessage("Error Loading Insights", error.message));
      console.error("Mutation Error:", error);
    },
  });

  // Add Insight
  const addInsightForm = useForm<IAddInsight>();
  const [showAddSlideOver, setShowAddSlideOver] = useState(false);
  const addInsight = api.insight.addInsight.useMutation({
    onSuccess: (data) => {
      toast.success(
        toastMessage("Added Insight", `'${data.result.name}' was added.`)
      );
      void getInsights.refetch();
      setShowAddSlideOver(false);
      addInsightForm.reset();
    },
    onError: (error) => {
      toast.error(toastMessage("Error Adding Insight", error.message));
      console.error("Mutation Error:", error);
    },
  });
  const submitAddInsight = useCallback<SubmitHandler<IAddInsight>>(
    async (input) => {
      await addInsight.mutateAsync(input);
    },
    [addInsight]
  );

  // Delete Insight
  const [insightToDelete, setInsightToDelete] = useState<insight>();
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const deleteInsight = api.insight.deleteInsight.useMutation({
    onSuccess: (data) => {
      toast.success(
        toastMessage("Deleted Insight", `'${data.result.name}' was deleted.`)
      );
      void getInsights.refetch();
      setShowConfirmDeleteModal(false);
      setInsightToDelete(undefined);
    },
    onError: (error) => {
      toast.error(toastMessage("Error Deleting Insight", error.message));
      console.error("Mutation Error:", error);
    },
  });
  const handleDeleteInsight = useCallback(
    async (id?: number) => {
      if (!id) return;
      await deleteInsight.mutateAsync({ id });
    },
    [deleteInsight]
  );

  // Archive/Unarchive Insight
  const [insightToArchive, setInsightToArchive] = useState<insight>();
  const [showConfirmArchiveModal, setShowConfirmArchiveModal] = useState(false);
  const archiveInsight = api.insight.updateInsight.useMutation({
    onSuccess: (data) => {
      data.result.is_archived
        ? toast.success(
            toastMessage(
              "Archived Insight",
              `'${data.result.name}' was archived.`
            )
          )
        : toast.success(
            toastMessage(
              "Unarchived Insight",
              `'${data.result.name}' was unarchived.`
            )
          );
      void getInsights.refetch();
      setShowConfirmArchiveModal(false);
      setInsightToArchive(undefined);
    },
    onError: (error, variables) => {
      variables.is_archived
        ? toast.error(toastMessage("Error Archiving Insight", error.message))
        : toast.error(toastMessage("Error Unarchiving Insight", error.message));
      console.error("Mutation Error:", error);
    },
  });
  const handleArchiveInsight = useCallback(
    async (id?: number, is_archived?: boolean) => {
      if (!id) return;
      await archiveInsight.mutateAsync({
        id,
        is_archived:
          is_archived === undefined
            ? !insightToArchive?.is_archived
            : is_archived,
      });
    },
    [archiveInsight, insightToArchive]
  );

  // Update (Edit) Insight
  const editInsightForm = useForm<IUpdateInsight>();
  const [insightToEdit, setInsightToEdit] = useState<insight>();
  const [showEditSlideOver, setShowEditSlideOver] = useState(false);
  const updateInsight = api.insight.updateInsight.useMutation({
    onSuccess: (data) => {
      toast.success(
        toastMessage("Updated Insight", `'${data.result.name}' was updated.`)
      );
      void getInsights.refetch();
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

  // Filters Tabs
  const [filter, setFilter] = useState<FilterTabOption>("Active");
  const [filterTabs, setFilterTabs] = useState<FilterTab[]>([
    { name: "Active" },
    { name: "Archived" },
    { name: "All" },
  ]);
  useEffect(() => {
    const activeCount = insights.filter(
      (insight) => !insight.is_archived
    ).length;
    const archivedCount = insights.filter(
      (insight) => insight.is_archived
    ).length;
    setFilterTabs([
      { name: "Active", count: activeCount },
      { name: "Archived", count: archivedCount },
      { name: "All", count: insights.length },
    ]);
  }, [insights]);

  // Define the columns for the table (and how to render each cell)
  const columns: ColumnDef<DataRow>[] = useMemo(() => {
    return [
      {
        id: "actions",
        header: "",
        accessorKey: "actions",
        enableHiding: false,
        cell: (info) => (
          <div className="flex items-center justify-center">
            <Dropdown
              itemGroups={info.getValue() as DropdownItemGroups[]}
              direction="right"
            />
          </div>
        ),
        size: 25,
      },
      {
        id: "Name",
        header: "Name",
        accessorKey: "name",
        cell: (info) => {
          const insight: insight | undefined = info.row.getValue("data");
          if (!insight)
            return (
              info.getValue() || <span className="text-gray-500">...</span>
            );

          return renderNameCell(insight, info.getValue() as ReactNode);
        },
      },
      {
        id: "Description",
        header: "Description",
        accessorKey: "description",
        cell: (info) => (
          <div
            className="w-fit max-w-md truncate lg:max-w-2xl xl:max-w-3xl"
            data-tooltip-id="description-tooltip"
            data-tooltip-content={String(info.cell.getValue() || "")}
          >
            <span /*className="cursor-help"*/>
              {String(info.cell.getValue() || "")}
            </span>
            {/* <Tooltip
              id="description-tooltip"
              className="z-10 max-w-sm whitespace-normal break-words"
            /> */}
          </div>
        ),
      },
      {
        id: "Created At",
        header: "Created At",
        accessorKey: "created_at",
        cell: (info) => (
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-500">
              {info.cell.getValue()
                ? new Date(info.cell.getValue() as Date)
                    // yyyy-mm-dd at hh:mm (MILITARY TIME)
                    .toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: false,
                    })
                : "..."}
            </span>
          </div>
        ),
      },
      {
        id: "data",
        header: "",
        accessorKey: "data",
        enableHiding: false,
        cell: () => null,
      },
    ];
  }, []);

  // Sync the row data with the insights
  const rows: DataRow[] = useMemo(
    () =>
      insights
        .filter(
          (insight) =>
            (filter === "Active" && !insight.is_archived) ||
            (filter === "Archived" && insight.is_archived) ||
            filter === "All"
        )
        .map((insight) => {
          return {
            actions: [
              {
                items: [
                  {
                    text: "Export Insight...",
                    icon: DocumentArrowDownIcon,
                    // TODO: add functionality to export
                    disabled: true,
                  },
                ],
              },
              {
                items: [
                  {
                    text: "Edit...",
                    icon: PencilIcon,
                    onClick: () => {
                      editInsightForm.reset(
                        // TODO: fix this type casting
                        insight as unknown as IUpdateInsight
                      );
                      setInsightToEdit(insight);
                      setShowEditSlideOver(true);
                    },
                  },
                ],
              },
              {
                items: [
                  {
                    text: insight.is_archived ? "Unarchive..." : "Archive...",
                    icon: ArchiveBoxIcon,
                    onClick: () => {
                      setInsightToArchive(insight);
                      setShowConfirmArchiveModal(true);
                    },
                  },
                  {
                    text: "Delete...",
                    icon: TrashIcon,
                    onClick: () => {
                      setInsightToDelete(insight);
                      setShowConfirmDeleteModal(true);
                    },
                  },
                ],
              },
            ],
            ...insight,
            data: insight,
          };
        }),
    [insights, filter]
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  // TanStack Table
  const table = useReactTable({
    data: rows,
    columns,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    // initialState: {
    //   columnVisibility: { Description: false },
    // },
    // Global Filter (Search)
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    onGlobalFilterChange: setSearchQuery,
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getColumnCanGlobalFilter: (column) => {
      return column.id !== "actions" && column.id !== "data";
    },
    state: {
      globalFilter: searchQuery, // This is needed to keep the global filter in sync with the search query
      sorting,
    },
    // Sorting
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <SimpleLayout
      variant="no-bg"
      mainClassName="max-w-7xl w-full mx-auto xl:pt-8"
      mainContents={
        <>
          {/* Header */}
          <div className="mx-5 mt-3 flex flex-1 items-end justify-between space-x-4">
            <h1 className="relative top-2 text-3xl font-extrabold text-gray-100 [text-shadow:_0_3px_0_rgb(0_0_0_/_40%)] xl:top-0">
              Insights
            </h1>

            {/* Header Buttons */}
            <div className="flex space-x-4">
              {/* Filters */}
              <FilterTabs
                filter={filter}
                setFilter={setFilter}
                tabs={filterTabs}
              />

              {/* Actions */}
              <Dropdown
                label="Actions"
                itemGroups={[
                  {
                    items: [
                      {
                        text: "Export Insights...",
                        icon: DocumentArrowDownIcon,
                        // TODO: add functionality to export insights list
                        disabled: true,
                      },
                      {
                        text: "Import Insights...",
                        icon: DocumentArrowUpIcon,
                        // TODO: add functionality to import insights list
                        disabled: true,
                      },
                    ],
                  },
                ]}
              />
            </div>
          </div>

          {/* Sub-Header */}
          <div className="mx-5 mt-4 flex flex-1 items-center justify-end space-x-4">
            <div className="flex space-x-4">
              {/* Show/Hide Filters Button */}
              <Button
                text={`${showFilters ? "Hide" : "Show"} Filters${
                  !showFilters ? "..." : ""
                }`}
                icon={showFilters ? FilterXIcon : FilterIcon}
                variant={"outline"}
                onClick={() => setShowFilters((prev) => !prev)}
              />
            </div>

            {/* Search Bar */}
            <DebouncedInput
              icon={MagnifyingGlassIcon}
              type="text"
              placeholder="Search"
              value={searchQuery ?? ""}
              onChange={(value) => setSearchQuery(String(value))}
              className="w-72"
            />

            {/* Create Insight Button */}
            <Button
              text="Create Insight"
              icon={PlusIcon}
              onClick={() => setShowAddSlideOver(true)}
            />
          </div>

          {/* Insights */}
          <div className="ml-1 mr-3 mt-4 h-full overflow-x-auto pl-3.5 pr-2">
            {/* Filters */}
            {showFilters && (
              <div className="shadow-small sticky left-0 top-0 mb-4 rounded-md border border-border-primary">
                <div className="w-full rounded-t-md border-b border-border-primary bg-gray-100 px-3 py-1">
                  <h1 className="flex items-center space-x-2 font-medium">
                    <FilterIcon className="h-4 w-4" />
                    <span>Filters</span>
                  </h1>
                </div>
                <div className="flex rounded-b-md bg-white">
                  {/* Column Visibility */}
                  {/* <div className="flex w-1/3 flex-col space-y-2 border-r border-border-primary p-2"> */}
                  <div className="flex flex-col space-y-2 p-2">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Column Visibility
                    </h2>
                    <div className="flex flex-wrap items-center">
                      <label className="flex items-center space-x-2 pr-1 text-sm">
                        <input
                          {...{
                            type: "checkbox",
                            checked: table.getIsAllColumnsVisible(),
                            onChange:
                              table.getToggleAllColumnsVisibilityHandler(),
                          }}
                          className="rounded-sm border-gray-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <span>Toggle All</span>
                      </label>
                      <span className="ml-2 mr-3 text-gray-400">|</span>
                      {table.getAllLeafColumns().map((column) => {
                        return column.id !== "actions" &&
                          column.id !== "data" ? (
                          <div key={column.id} className="mr-3">
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                {...{
                                  type: "checkbox",
                                  checked: column.getIsVisible(),
                                  onChange: column.getToggleVisibilityHandler(),
                                }}
                                className="rounded-sm border-gray-300 text-brand-primary focus:ring-brand-primary"
                              />
                              <span>{column.id}</span>
                            </label>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <TanstackTable
              table={table}
              isLoading={false}
              autoResizeWidth
              tableFor="insights"
              NothingToDisplayIcon={LightbulbOffIcon}
            />
          </div>
        </>
      }
      modals={
        <>
          {/* Create Insight Slide-over */}
          <SlideOver
            isOpen={showAddSlideOver}
            setIsOpen={setShowAddSlideOver}
            title="Create Insight"
            description="Take a closer look at your data."
          >
            <form
              className="flex flex-col space-y-4"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={addInsightForm.handleSubmit(submitAddInsight)}
            >
              {/* Name */}
              <Input
                id="insight_name"
                label="Name"
                type="text"
                placeholder="e.g. 'Tech Eval Analysis'"
                register={addInsightForm.register("name", {
                  required: true,
                })}
              />
              {addInsightForm.formState.errors.name && (
                <p className="-mt-2 flex items-center space-x-2 text-sm text-red-500">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Please enter a name for this insight.</span>
                </p>
              )}

              {/* Description */}
              <Input
                id="insight_description"
                label="Description"
                optional
                variant="large"
                type="text"
                placeholder="e.g. 'Highlight discrepancies in Tech Eval contract award days in past projects (projected vs. actual).'"
                register={addInsightForm.register("description")}
              />

              {/* - [Options] - */}
              <Controller
                name="options"
                control={addInsightForm.control}
                defaultValue={{ building: "", location: "", room: "" }}
                render={({ field }) => (
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <p className="font-medium">Options</p>
                      <div className="flex items-end space-x-1">
                        <p className="flex items-center space-x-1.5 text-sm text-gray-500">
                          <SlidersHorizontalIcon className="h-3 w-3" />
                          <span>Options</span>
                        </p>
                        <span className="text-sm text-gray-500">
                          (Optional)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between space-x-4 rounded-md border border-[#CCCCCC] p-4">
                      {/* <Input
                        label="Deviation Percentage"
                        type="text"
                        placeholder="e.g. '600/200 Complex'"
                        value={(field.value as LocationAttributeValue).building}
                        onChange={(e) =>
                          field.onChange({
                            ...field.value,
                            building: e.target.value,
                          })
                        }
                        descriptorComponent={
                          <div className="flex items-center">
                            <Building2Icon className="ml-2 h-3 w-3 text-gray-500" />
                          </div>
                        }
                      />

                      <Input
                        label="Laboratory"
                        type="text"
                        placeholder="e.g. 'Surface Science Lab'"
                        value={(field.value as LocationAttributeValue).location}
                        onChange={(e) =>
                          field.onChange({
                            ...field.value,
                            location: e.target.value,
                          })
                        }
                        descriptorComponent={
                          <div className="flex items-center">
                            <LocateFixedIcon className="ml-2 h-3 w-3 text-gray-500" />
                          </div>
                        }
                      />

                      <Input
                        label="Room Number"
                        type="text"
                        placeholder="e.g. '2BH127'"
                        value={(field.value as LocationAttributeValue).room}
                        onChange={(e) =>
                          field.onChange({
                            ...field.value,
                            room: e.target.value,
                          })
                        }
                        descriptorComponent={
                          <div className="flex items-center">
                            <DoorOpenIcon className="ml-2 h-3 w-3 text-gray-500" />
                          </div>
                        }
                      /> */}
                    </div>
                  </div>
                )}
              />

              {/* Submit Button */}
              <Button
                text={addInsight.isLoading ? "Submitting..." : "Submit"}
                type="submit"
                icon={addInsight.isLoading ? Loader2Icon : undefined}
                iconClassName={"animate-spin"}
                disabled={addInsight.isLoading}
              />
            </form>
          </SlideOver>

          {/* Edit Insight Slide-over */}
          <SlideOver
            isOpen={showEditSlideOver}
            setIsOpen={setShowEditSlideOver}
            title="Edit Insight"
            description="Describe the insight."
          >
            <form
              className="flex flex-col space-y-4"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={editInsightForm.handleSubmit(submitEditInsight)}
            >
              {/* Name */}
              <Input
                id="insight_name"
                label="Name"
                type="text"
                placeholder="e.g. 'Tech Eval Analysis'"
                register={editInsightForm.register("name", {
                  required: true,
                })}
              />
              {editInsightForm.formState.errors.name && (
                <p className="-mt-2 flex items-center space-x-2 text-sm text-red-500">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Please enter a name for this insight.</span>
                </p>
              )}

              {/* Description */}
              <Input
                id="insight_description"
                label="Description"
                optional
                variant="large"
                type="text"
                placeholder="e.g. 'Highlight discrepancies in Tech Eval contract award days in past projects (projected vs. actual).'"
                register={editInsightForm.register("description")}
              />

              {/* - [Options] - */}
              <Controller
                name="options"
                control={editInsightForm.control}
                defaultValue={{ building: "", location: "", room: "" }}
                render={({ field }) => (
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <p className="font-medium">Options</p>
                      <div className="flex items-end space-x-1">
                        <p className="flex items-center space-x-1.5 text-sm text-gray-500">
                          <SlidersHorizontalIcon className="h-3 w-3" />
                          <span>Options</span>
                        </p>
                        <span className="text-sm text-gray-500">
                          (Optional)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between space-x-4 rounded-md border border-[#CCCCCC] p-4">
                      {/* <Input
                        label="Deviation Percentage"
                        type="text"
                        placeholder="e.g. '600/200 Complex'"
                        value={(field.value as LocationAttributeValue).building}
                        onChange={(e) =>
                          field.onChange({
                            ...field.value,
                            building: e.target.value,
                          })
                        }
                        descriptorComponent={
                          <div className="flex items-center">
                            <Building2Icon className="ml-2 h-3 w-3 text-gray-500" />
                          </div>
                        }
                      />

                      <Input
                        label="Laboratory"
                        type="text"
                        placeholder="e.g. 'Surface Science Lab'"
                        value={(field.value as LocationAttributeValue).location}
                        onChange={(e) =>
                          field.onChange({
                            ...field.value,
                            location: e.target.value,
                          })
                        }
                        descriptorComponent={
                          <div className="flex items-center">
                            <LocateFixedIcon className="ml-2 h-3 w-3 text-gray-500" />
                          </div>
                        }
                      />

                      <Input
                        label="Room Number"
                        type="text"
                        placeholder="e.g. '2BH127'"
                        value={(field.value as LocationAttributeValue).room}
                        onChange={(e) =>
                          field.onChange({
                            ...field.value,
                            room: e.target.value,
                          })
                        }
                        descriptorComponent={
                          <div className="flex items-center">
                            <DoorOpenIcon className="ml-2 h-3 w-3 text-gray-500" />
                          </div>
                        }
                      /> */}
                    </div>
                  </div>
                )}
              />

              {/* Submit */}
              <Button
                text={
                  updateInsight.isLoading ? "Submitting..." : "Submit Changes"
                }
                type="submit"
                icon={updateInsight.isLoading ? Loader2Icon : undefined}
                iconClassName={"animate-spin"}
                disabled={updateInsight.isLoading}
              />
            </form>
          </SlideOver>

          {/* Delete Insight Modal */}
          <Modal
            title="Delete Insight"
            objectName={insightToDelete?.name}
            message="Are you sure you want to delete this insight? This action cannot be undone."
            color="bg-red-600"
            iconColor="text-red-600"
            hoverColor="hover:bg-red-700"
            lightColor="bg-red-100"
            Icon={TrashIcon}
            submitButtonContent="Delete"
            cancelButtonContent="Cancel"
            isOpen={showConfirmDeleteModal}
            setIsOpen={setShowConfirmDeleteModal}
            onSubmit={() => void handleDeleteInsight(insightToDelete?.id)}
            isLoading={deleteInsight.isLoading}
            loadingButtonContent="Deleting..."
          />

          {/* Archive/Unarchive Insight Modal */}
          <Modal
            title={
              insightToArchive?.is_archived
                ? "Unarchive Insight"
                : "Archive Insight"
            }
            objectName={insightToArchive?.name}
            message={
              insightToArchive?.is_archived
                ? "Are you sure you want to unarchive this insight?"
                : "Are you sure you want to archive this insight?"
            }
            color={
              insightToArchive?.is_archived ? "bg-green-600" : "bg-yellow-600"
            }
            iconColor={
              insightToArchive?.is_archived
                ? "text-green-600"
                : "text-yellow-600"
            }
            hoverColor={
              insightToArchive?.is_archived
                ? "hover:bg-green-700"
                : "hover:bg-yellow-700"
            }
            lightColor={
              insightToArchive?.is_archived ? "bg-green-100" : "bg-orange-100"
            }
            Icon={
              insightToArchive?.is_archived ? ArchiveBoxIcon : ArchiveBoxIcon
            }
            submitButtonContent={
              insightToArchive?.is_archived ? "Unarchive" : "Archive"
            }
            cancelButtonContent="Cancel"
            isOpen={showConfirmArchiveModal}
            setIsOpen={setShowConfirmArchiveModal}
            onSubmit={() => void handleArchiveInsight(insightToArchive?.id)}
            isLoading={archiveInsight.isLoading}
            loadingButtonContent={
              insightToArchive?.is_archived ? "Unarchiving..." : "Archiving..."
            }
          />
        </>
      }
    />
  );
}

// This is the custom cell renderer for the insight name column.
const renderNameCell = (insight: insight, value: ReactNode) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Archived Icon */}
      {insight.is_archived && (
        <>
          <ArchiveBoxIcon
            className="h-4 w-4 rounded-sm text-gray-500"
            data-tooltip-id="is-archived-header-tooltip"
            data-tooltip-content="This icon indicates that the insight is archived."
          />
          <Tooltip id="is-archived-header-tooltip" className="z-10" />
        </>
      )}

      {/* Value */}
      <Link
        href={`/insights/${insight.id}`}
        data-tooltip-id="insight-name-tooltip"
        data-tooltip-content={insight.description || ""}
        className="-mx-1 cursor-pointer rounded-sm px-1 font-medium hover:text-gray-800 hover:underline"
      >
        {value || <span className="text-gray-500">...</span>}
        <Tooltip
          id="insight-name-tooltip"
          className="z-10 max-w-sm whitespace-normal break-words"
        />
      </Link>
    </div>
  );
};
