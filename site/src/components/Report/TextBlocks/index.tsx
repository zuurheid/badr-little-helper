import React from "react";
import s from "./TextBlocks.module.scss";

interface TextBlockProps {
  text: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({ text }) => {
  return (
    <div className={`${s.block} ${s.paragraph}`}>
      <p>
        <span>{text}</span>
      </p>
    </div>
  );
};

interface HeaderBlockProps {
  text: string;
}

export const HeaderBlock: React.FC<HeaderBlockProps> = ({ text }) => {
  return (
    <div className={s.header}>
      <h2>{text}</h2>
    </div>
  );
};

interface ListBlockProps {
  elements: string[];
  type: "ordered" | "unordered";
}

export const ListBlock: React.FC<ListBlockProps> = ({ elements, type }) => {
  let listElements = elements.map((e, idx) => (
    <li key={idx}>
      <span>{e}</span>
    </li>
  ));
  const className = `${s.block} ${s.list}`;
  switch (type) {
    case "unordered": {
      return <ul className={className}>{listElements}</ul>;
    }
    case "ordered": {
      return <ol className={className}>{listElements}</ol>;
    }
  }
};
