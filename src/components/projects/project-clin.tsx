import { Fragment, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { api } from "~/utils/api";
import { formatCurrency } from "~/utils/currency";
import { List, ListPlus } from "lucide-react";
import type { clin_data_clin_type } from "@prisma/client";
import type { view_clin } from "~/types/view_clin";

function ProjectClin({ project_id }: { project_id: number }) {
  const router = useRouter();
  const user = useSession().data?.db_user;
  const { data: clin_list } = api.clin.get.useQuery({ project_id });

  // Add CLIN Modal functionality (states)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalInput_clinNumber, setAddModalInput_clinNumber] =
    useState<string>();
  const [addModalInput_selectedClinType, setAddModalInput_selectedClinType] =
    useState<clin_data_clin_type>("FFP");
  const [addModalInput_clinScope, setAddModalInput_clinScope] = useState("");
  const [addModalInput_igce, setAddModalInput_igce] = useState<number>();

  const addClin = api.clin.add.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error adding CLIN.",
          "There was an error adding the CLIN. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage(
          "CLIN added successfully.",
          "The CLIN was added successfully."
        )
      );

      // Add the new clin details to the UI (using reload is a bit hacky, but it works)
      router.reload();
    },
  });

  const submitAddClin = useCallback(() => {
    if (
      typeof addModalInput_clinNumber !== "string" ||
      typeof addModalInput_selectedClinType !== "string" ||
      typeof addModalInput_clinScope !== "string" ||
      typeof addModalInput_igce !== "number"
    ) {
      toast.error(
        toastMessage(
          "Error adding CLIN.",
          "Please enter a valid CLIN number, type, scope, and IGCE."
        )
      );
      return;
    }

    addClin.mutate({
      project_id,
      clin_num: parseInt(addModalInput_clinNumber),
      clin_type: addModalInput_selectedClinType,
      clin_scope: addModalInput_clinScope,
      ind_gov_est: addModalInput_igce,
    });
  }, [
    addModalInput_clinNumber,
    addModalInput_selectedClinType,
    addModalInput_clinScope,
    addModalInput_igce,
    addClin,
    project_id,
  ]);

  // Open add CLIN modal
  const openAddModal = useCallback(() => {
    setAddModalInput_clinNumber(undefined);
    setAddModalInput_selectedClinType("FFP");
    setAddModalInput_clinScope("");
    setAddModalInput_igce(undefined);
    setAddModalOpen(true);
  }, []);

  // Close add CLIN modal
  const closeAddModal = useCallback(
    (save: boolean) => {
      setAddModalOpen(false);

      if (save) {
        if (
          typeof addModalInput_clinNumber !== "string" ||
          typeof addModalInput_selectedClinType !== "string" ||
          typeof addModalInput_clinScope !== "string" ||
          typeof addModalInput_igce !== "number"
        ) {
          toast.error(
            toastMessage(
              "Error adding CLIN.",
              "Please enter a valid CLIN number, type, scope, and IGCE."
            )
          );
          return;
        }

        submitAddClin();
      }

      // Reset the input (use a timeout to wait for the modal close transition to finish)
      setTimeout(() => {
        setAddModalInput_clinNumber(undefined);
        setAddModalInput_selectedClinType("FFP");
        setAddModalInput_clinScope("");
        setAddModalInput_igce(undefined);
      }, 500);
    },
    [
      addModalInput_clinNumber,
      addModalInput_selectedClinType,
      addModalInput_clinScope,
      addModalInput_igce,
      submitAddClin,
    ]
  );

  // Edit CLIN Modal functionality (states)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalInput_clinNumber, setEditModalInput_clinNumber] =
    useState<string>();
  const [editModalInput_selectedClinType, setEditModalInput_selectedClinType] =
    useState<clin_data_clin_type>("FFP");
  const [editModalInput_clinScope, setEditModalInput_clinScope] = useState("");
  const [editModalInput_igce, setEditModalInput_igce] = useState<number>();
  const [editModalInput_clinId, setEditModalInput_clinId] = useState<number>();

  const editClin = api.clin.update.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error editing CLIN.",
          "There was an error editing the CLIN. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage(
          "CLIN edited successfully.",
          "The CLIN was edited successfully."
        )
      );

      // Add the new clin details to the UI (using reload is a bit hacky, but it works)
      router.reload();
    },
  });

  const submitEditClin = useCallback(() => {
    if (
      typeof editModalInput_clinNumber !== "string" ||
      typeof editModalInput_selectedClinType !== "string" ||
      typeof editModalInput_clinScope !== "string" ||
      typeof editModalInput_igce !== "number" ||
      typeof editModalInput_clinId !== "number"
    ) {
      toast.error(
        toastMessage(
          "Error editing CLIN.",
          "Please enter a valid CLIN number, type, scope, and IGCE."
        )
      );
      return;
    }

    editClin.mutate({
      id: editModalInput_clinId,
      project_id,
      clin_num: parseInt(editModalInput_clinNumber),
      clin_type: editModalInput_selectedClinType,
      clin_scope: editModalInput_clinScope,
      ind_gov_est: editModalInput_igce,
    });

    // Reset the input (use a timeout to wait for the modal close transition to finish)
    setTimeout(() => {
      setEditModalInput_clinNumber(undefined);
      setEditModalInput_selectedClinType("FFP");
      setEditModalInput_clinScope("");
      setEditModalInput_igce(undefined);
      setEditModalInput_clinId(undefined);
    }, 500);
  }, [
    editModalInput_clinNumber,
    editModalInput_selectedClinType,
    editModalInput_clinScope,
    editModalInput_igce,
    editModalInput_clinId,
    editClin,
    project_id,
  ]);

  // Open edit CLIN modal
  const openEditModal = useCallback(
    (clin: view_clin) => {
      setEditModalInput_clinNumber(clin.clin_num?.toString()?.padStart(4, '0') ?? undefined);
      setEditModalInput_selectedClinType(clin.clin_type);
      setEditModalInput_clinScope(clin.clin_scope ?? "");
      setEditModalInput_igce(Number(clin.ind_gov_est));
      setEditModalInput_clinId(clin.id);
      setEditModalOpen(true);
    },
    [setEditModalOpen]
  );

  // Close edit CLIN modal
  const closeEditModal = useCallback(
    (save: boolean) => {
      setEditModalOpen(false);

      if (save) {
        if (
          typeof editModalInput_clinNumber !== "string" ||
          typeof editModalInput_selectedClinType !== "string" ||
          typeof editModalInput_clinScope !== "string" ||
          typeof editModalInput_igce !== "number" ||
          typeof editModalInput_clinId !== "number"
        ) {
          toast.error(
            toastMessage(
              "Error editing CLIN.",
              "Please enter a valid CLIN number, type, scope, and IGCE."
            )
          );
          return;
        }

        submitEditClin();
      }

      // Reset the input (use a timeout to wait for the modal close transition to finish)
      setTimeout(() => {
        setEditModalInput_clinNumber(undefined);
        setEditModalInput_selectedClinType("FFP");
        setEditModalInput_clinScope("");
        setEditModalInput_igce(undefined);
        setEditModalInput_clinId(undefined);
      }, 500);
    },
    [
      submitEditClin,
      setEditModalOpen,
      editModalInput_clinId,
      editModalInput_clinNumber,
      editModalInput_selectedClinType,
      editModalInput_clinScope,
      editModalInput_igce,
    ]
  );

  // Delete CLIN functionality
  const deleteClin = api.clin.delete.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error deleting CLIN.",
          "There was an error deleting the CLIN. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage(
          "CLIN deleted successfully.",
          "The CLIN was deleted successfully."
        )
      );

      // Remove the deleted clin from the UI (using reload is a bit hacky, but it works)
      router.reload();
    },
  });

  const submitDeleteClin = useCallback(() => {
    if (editModalInput_clinId)
      deleteClin.mutate({
        id: editModalInput_clinId,
      });
  }, [deleteClin, editModalInput_clinId]);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-100 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
            CLIN Data
          </h1>
          <p className="mt-2 text-sm text-gray-200 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
            View and edit CLIN (Contract Line Item Numbers) data for this
            project.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={openAddModal}
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-brand-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-dark/80 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
          >
            Add CLIN
          </button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!clin_list ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : clin_list.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-200 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
                    No CLIN data for this project.
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
                        CLIN Number
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        CLIN Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        CLIN Scope
                      </th>
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Projected CLIN Value ($)
                        </th>
                      )}
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Independent Goverment Cost Estimate ($)
                        </th>
                      )}
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Edit</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {clin_list &&
                      clin_list.map((clin, clinIdx) => (
                        <tr
                          key={clin.id}
                          className={
                            clinIdx % 2 === 0 ? undefined : "bg-gray-50"
                          }
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-brand-dark underline sm:pl-6">
                            <Link
                              href={`/projects/${project_id}/clin/${clin.clin_num}/wbs`}
                              className="hover:text-brand-dark/80"
                            >
                              {clin.clin_num?.toString()?.padStart(4, '0')}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {clin.clin_type}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {clin.clin_scope}
                          </td>
                          {user?.user_role !== "Contractor" && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatCurrency(clin.clin_value)}
                            </td>
                          )}
                          {user?.user_role !== "Contractor" && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatCurrency(clin.ind_gov_est)}
                            </td>
                          )}
                          {user?.user_role !== "Contractor" && (
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <a
                                onClick={() => {
                                  openEditModal(clin);
                                }}
                                className="cursor-pointer text-blue-600 hover:text-blue-900"
                              >
                                Edit
                                <span className="sr-only">
                                  , {clin.clin_num}
                                </span>
                              </a>
                            </td>
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

      {/* Add CLIN Modal */}
      <Transition.Root show={addModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {
            closeAddModal(false);
          }}
        >
          <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ListPlus
                        className="h-6 w-6 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mr-2 mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Add CLIN
                      </Dialog.Title>
                      <div className="mt-2 flex min-w-full flex-col gap-2">
                        {/* CLIN Number */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeAddModal(true);
                          }}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="clin-number">CLIN Number</label>
                          <input
                            type="text"
                            name="clin-number"
                            id="clin-number"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. '0001'"
                            value={addModalInput_clinNumber}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              const numericValue = Number(inputValue);
                              var minValue = 0;
                              var maxValue = 9999;

                              if (numericValue >= minValue && numericValue <= maxValue) {
                                // Reformat the number with leading zeros
                                const formattedValue = numericValue.toString().padStart(4, '0');
                                setAddModalInput_clinNumber(formattedValue);
                              } else if (numericValue < minValue) {
                                // If the input value is less than the minimum, set it to the minimum value
                                setAddModalInput_clinNumber(minValue.toString().padStart(4, '0'));
                              } else {
                                // If the input value is greater than the maximum, set it to the maximum value
                                setAddModalInput_clinNumber(maxValue.toString().padStart(4, '0'));
                              }
                            }}
                          />
                        </form>

                        {/* CLIN Type */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeAddModal(true);
                          }}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="clin-type">CLIN Type</label>
                          <select
                            id="clin-type"
                            name="clin-type"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={addModalInput_selectedClinType}
                            onChange={(e) => {
                              setAddModalInput_selectedClinType(
                                e.target.value as clin_data_clin_type
                              );
                            }}
                          >
                            <option value="FFP">FFP</option>
                            <option value="FFIF">FFIF</option>
                            <option value="FF-EPA">FF-EPA</option>
                            <option value="CPFF">CPFF</option>
                            <option value="CPIF">CPIF</option>
                            <option value="CPAF">CPAF</option>
                            <option value="T&M">T&M</option>
                          </select>
                        </form>

                        {/* CLIN Scope */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeAddModal(true);
                          }}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="clin-scope">CLIN Scope</label>
                          <input
                            type="text"
                            name="clin-scope"
                            id="clin-scope"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. 'Development of a new feature'"
                            value={addModalInput_clinScope}
                            onChange={(e) => {
                              setAddModalInput_clinScope(e.target.value);
                            }}
                          />
                        </form>

                        {/* Independent Goverment Cost Estimate */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeAddModal(true);
                          }}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="igce">
                            Independent Goverment Cost Estimate ($)
                          </label>
                          <input
                            type="number"
                            name="igce"
                            id="igce"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. '100000'"
                            value={addModalInput_igce}
                            onChange={(e) => {
                              setAddModalInput_igce(Number(e.target.value));
                            }}
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => closeAddModal(true)}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => closeAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Edit CLIN Modal */}
      <Transition.Root show={editModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {
            closeEditModal(false);
          }}
        >
          <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <List
                        className="h-6 w-6 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mr-2 mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Edit CLIN
                      </Dialog.Title>
                      <div className="mt-2 flex min-w-full flex-col gap-2">
                        {/* CLIN Number */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeEditModal(true);
                          }}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="clin-number">CLIN Number</label>
                          <input
                            type="number"
                            name="clin-number"
                            id="clin-number"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. '1'"
                            value={editModalInput_clinNumber}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              const numericValue = Number(inputValue);
                              var minValue = 0;
                              var maxValue = 9999;

                              if (numericValue >= minValue && numericValue <= maxValue) {
                                // Reformat the number with leading zeros
                                const formattedValue = numericValue.toString().padStart(4, '0');
                                setEditModalInput_clinNumber(formattedValue);
                              } else if (numericValue < minValue) {
                                // If the input value is less than the minimum, set it to the minimum value
                                setEditModalInput_clinNumber(minValue.toString().padStart(4, '0'));
                              } else {
                                // If the input value is greater than the maximum, set it to the maximum value
                                setEditModalInput_clinNumber(maxValue.toString().padStart(4, '0'));
                              }
                            }}
                          />
                        </form>

                        {/* CLIN Type */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeEditModal(true);
                          }}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="clin-type">CLIN Type</label>
                          <select
                            id="clin-type"
                            name="clin-type"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={editModalInput_selectedClinType}
                            onChange={(e) => {
                              setEditModalInput_selectedClinType(
                                e.target.value as clin_data_clin_type
                              );
                            }}
                          >
                            <option value="FFP">FFP</option>
                            <option value="FFIF">FFIF</option>
                            <option value="FF-EPA">FF-EPA</option>
                            <option value="CPFF">CPFF</option>
                            <option value="CPIF">CPIF</option>
                            <option value="CPAF">CPAF</option>
                            <option value="T&M">T&M</option>
                          </select>
                        </form>

                        {/* CLIN Scope */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeEditModal(true);
                          }}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="clin-scope">CLIN Scope</label>
                          <input
                            type="text"
                            name="clin-scope"
                            id="clin-scope"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. 'Development of a new feature'"
                            value={editModalInput_clinScope}
                            onChange={(e) => {
                              setEditModalInput_clinScope(e.target.value);
                            }}
                          />
                        </form>

                        {/* Independent Goverment Cost Estimate */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeEditModal(true);
                          }}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="igce">
                            Independent Goverment Cost Estimate ($)
                          </label>
                          <input
                            type="number"
                            name="igce"
                            id="igce"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. '100000'"
                            value={editModalInput_igce}
                            onChange={(e) => {
                              setEditModalInput_igce(Number(e.target.value));
                            }}
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      submitDeleteClin();
                      closeEditModal(false);
                    }}
                  >
                    Delete CLIN
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => closeEditModal(true)}
                  >
                    Submit Changes
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => closeEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

export default ProjectClin;
