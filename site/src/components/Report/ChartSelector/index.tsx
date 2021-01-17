import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import s from "./ChartSelector.module.scss";
import { TextBlock } from "../TextBlocks";
import FormControl from "@material-ui/core/FormControl";
import Select from "../../Select";
import MenuItem from "@material-ui/core/MenuItem";

type valueType = string | number | readonly string[];

interface ChartSelectorProps<T> {
  label: string;
  elements: Array<T>;
  getValue: (el: T) => valueType;
  onCustomSelect: (el: T | null) => void;
  emptyElement: {
    value: valueType;
    text: string;
  };
  elementToItem: (
    el: T
  ) => {
    key: string;
    text: string;
  };
}

function ChartSelector<T>(props: ChartSelectorProps<T>) {
  const { t } = useTranslation();
  let [customElement, setCustomElement] = useState<T | null>(null);

  const handleChange = (e: any) => {
    const customElementFiltered = props.elements.filter(
      (el) => props.getValue(el) === e.target.value
    );
    const newCustomElement =
      customElementFiltered.length === 1 ? customElementFiltered[0] : null;
    setCustomElement(newCustomElement);
    props.onCustomSelect(newCustomElement);
  };

  return (
    <div className={s.customDepartmentSelector}>
      <div className={s.customDepartmentSelectorText}>
        <TextBlock text={props.label} style="em" />
      </div>
      <FormControl
        variant="outlined"
        size="small"
        classes={{ root: s.formControl }}
      >
        <Select
          value={
            customElement == null
              ? props.emptyElement.value
              : props.getValue(customElement)
          }
          onChange={handleChange}
        >
          <MenuItem value={props.emptyElement.value}>
            {props.emptyElement.text}
          </MenuItem>
          {props.elements.map((el) => {
            let { key, text } = props.elementToItem(el);
            const value = props.getValue(el);
            if (key == null) {
              key = JSON.stringify(value);
            }
            return (
              <MenuItem key={key} value={value}>
                {text}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
}

export default ChartSelector;
