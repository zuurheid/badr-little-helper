import React, { useEffect, useState } from "react";
import ButtonMUI from "@material-ui/core/Button";

export interface ButtonProps {
  text: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "default";
  variant?: "outlined" | "contained";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  text,
  color,
  onClick,
  variant,
  disabled,
}) => {
  return (
    <ButtonMUI
      color={color || "default"}
      onClick={onClick}
      disabled={disabled}
      fullWidth
      variant={variant || "contained"}
    >
      {text}
    </ButtonMUI>
  );
};

export default Button;
