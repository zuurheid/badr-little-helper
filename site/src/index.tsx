import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./i18n";

import { GlobalWorkerOptions, version } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;

ReactDOM.render(<App />, document.getElementById("root"));
