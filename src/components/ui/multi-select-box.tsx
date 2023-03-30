import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Combobox } from "@headlessui/react";
import { classNames } from "~/utils/misc";

interface MultiSelectBoxProps<T> {
  placeholder: string;
  data: T[];
  displayValue: (item: T) => string;
  displayValues: (items: T[]) => string;
  onSelectedItemsChange: (selectedItems: T[]) => void;
  label?: string;
}

export default function MultiSelectBox<T extends { id: number }>({
  placeholder,
  data,
  displayValue,
  displayValues,
  onSelectedItemsChange,
  label,
}: MultiSelectBoxProps<T>) {
  const [query, setQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const filteredData =
    query === ""
      ? data
      : data.filter((item) => {
          return displayValue(item).toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      value={selectedItems}
      onChange={(items: T[]) => {
        setSelectedItems(items);
        onSelectedItemsChange(items);
      }}
      multiple
    >
      {label && (
        <Combobox.Label className="block text-sm font-medium text-gray-700">
          {label}
        </Combobox.Label>
      )}
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={displayValues}
          placeholder={placeholder}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronsUpDown
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredData.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredData.map((item) => (
              <Combobox.Option
                key={item.id}
                value={item}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-brand-dark text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={classNames(
                        "block truncate",
                        selected ? "font-semibold" : "font-normal"
                      )}
                    >
                      {displayValue(item)}
                    </span>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-brand-dark"
                        )}
                      >
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
