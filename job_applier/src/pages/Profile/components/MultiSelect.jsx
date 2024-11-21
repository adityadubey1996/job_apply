import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const frameworks1 = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "nextjs", label: "Next.js" },
  { value: "nuxtjs", label: "Nuxt.js" },
];

const MultiSelect = ({ selected = [], onChange, options = [] }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState([]);

  const toggleSelection = (value) => {
    onChange([...selected, value]);
    setSelectedValues(
      (prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value) // Remove if already selected
          : [...prev, value] // Add if not selected
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-fit"
        >
          {selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((value) => {
                const option = options.find((fw) => fw.value === value);
                return (
                  <Badge key={value} variant="secondary" className="mr-1">
                    {option?.label || value}
                  </Badge>
                );
              })}
            </div>
          ) : (
            "Select options..."
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleSelection(option.value)}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedValues.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
export default MultiSelect;
