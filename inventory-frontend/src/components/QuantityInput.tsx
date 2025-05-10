import React, { useState } from "react";

type QuantityInputProps = {
  id: string;
  quantity: number;
  onUpdate: (val: number) => void;
  isLoading?: boolean;
};

export const QuantityInput: React.FC<QuantityInputProps> = ({
  id,
  quantity,
  onUpdate,
}) => {
  const [value, setValue] = useState<string | number>(quantity);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const commitUpdate = () => {
    const val = parseInt(value as string, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdate(val);
      setIsEditing(false);
    } else {
      setValue(quantity);
    }
  };

  return (
    <div className="quantity-wrapper">
      <input
        type="number"
        disabled={isLoading}
        className="quantity-input"
        min={0}
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val) && val >= 0) setValue(val);
        }}
        onBlur={commitUpdate}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitUpdate();
        }}
      />
      {isLoading && <span className="spinner">⏳</span>}
    </div>
  );
};
