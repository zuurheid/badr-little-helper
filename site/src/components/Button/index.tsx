import React from "react";
import MUIButton from "@material-ui/core/Button";

export interface ButtonProps {
  text: string;
  onClick?: () => void;
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
    <MUIButton
      color={color || "default"}
      onClick={onClick}
      disabled={disabled}
      fullWidth
      variant={variant || "contained"}
    >
      {text}
    </MUIButton>
  );
};

export default Button;
