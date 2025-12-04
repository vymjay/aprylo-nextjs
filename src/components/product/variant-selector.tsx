import { ProductVariant } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | undefined;
  onVariantChange: (variant: ProductVariant) => void;
  disabled?: boolean;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
  disabled = false,
}: VariantSelectorProps) {
  return (
    <Select
      disabled={disabled}
      value={selectedVariant?.id.toString()}
      onValueChange={(value) => {
        const variant = variants.find((v) => v.id.toString() === value);
        if (variant) {
          onVariantChange(variant);
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select variant">
          {selectedVariant ? `${selectedVariant.size} - ${selectedVariant.color}` : "Select variant"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {variants.map((variant) => (
          <SelectItem
            key={variant.id}
            value={variant.id.toString()}
            disabled={variant.stock < 1}
          >
            {variant.size} - {variant.color}{" "}
            {variant.stock < 1 ? " (Out of Stock)" : ` (${variant.stock} available)`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
