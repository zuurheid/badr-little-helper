import React from "react";
import { HeaderBlock } from "../TextBlocks";

interface ArticleProps {
  title?: string;
  body?: JSX.Element[];
}

const Article: React.FC<ArticleProps> = ({ title, body }) => {
  return (
    <div>
      {title != null && <HeaderBlock text={title} />}
      {body != null && (
        <div>
          {body.map((b, i) => (
            <div key={i}>{b}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Article;
