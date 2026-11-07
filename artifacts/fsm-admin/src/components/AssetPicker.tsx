import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type AssetPickerOption = {
  id: number;
  name: string;
  /** Extra searchable text shown dimmed under the name (VIN, plate, serial, fleet tag). */
  hint?: string | null;
};

/**
 * Searchable, scrollable asset picker. Replaces the plain <Select> for
 * long lists (50+ trucks, 250+ handhelds) where a dropdown either gets
 * clipped or is painful to scroll. Type to filter by name or hint; the
 * list is capped at a fixed height and scrolls inside the popover.
 *
 * `value` is the selected id as a string, or "none" for no selection,
 * matching the convention the maintenance form already uses.
 */
export function AssetPicker({
  value,
  onChange,
  options,
  placeholder = "Select",
  searchPlaceholder = "Search…",
  emptyLabel = "None",
  id,
  disabled,
  "data-testid": testId,
}: {
  value: string;
  onChange: (value: string) => void;
  options: AssetPickerOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  id?: string;
  disabled?: boolean;
  "data-testid"?: string;
}) {
  const [open, setOpen] = useState(false);

  const sorted = useMemo(
    () => [...options].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
    [options],
  );
  const selected = value !== "none" ? sorted.find((o) => String(o.id) === value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          data-testid={testId}
          className={cn(
            "h-9 w-full justify-between bg-transparent px-3 font-normal shadow-sm",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="truncate">{selected ? selected.name : value === "none" ? placeholder : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[260px] p-0"
        align="start"
        // Keep the list inside the viewport even when the trigger sits
        // low in a tall dialog; the list itself scrolls.
        collisionPadding={8}
      >
        <Command
          // cmdk matches on the item's `value`; we fold name + hint in so
          // typing a VIN fragment or fleet tag finds the asset too.
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72 overflow-y-auto overscroll-contain">
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onChange("none");
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === "none" ? "opacity-100" : "opacity-0")} />
                <span className="text-muted-foreground">{emptyLabel}</span>
              </CommandItem>
              {sorted.map((o) => {
                const isSelected = String(o.id) === value;
                return (
                  <CommandItem
                    key={o.id}
                    value={`${o.name} ${o.hint ?? ""} #${o.id}`}
                    onSelect={() => {
                      onChange(String(o.id));
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                    <div className="min-w-0">
                      <div className="truncate">{o.name}</div>
                      {o.hint && (
                        <div className="truncate font-mono text-[11px] text-muted-foreground">{o.hint}</div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">
          {sorted.length} {sorted.length === 1 ? "asset" : "assets"} · scroll or type to search
        </div>
      </PopoverContent>
    </Popover>
  );
}
