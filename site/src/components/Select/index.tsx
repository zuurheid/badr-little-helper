import styled from "styled-components";
import MUISelect from "@material-ui/core/Select";

const Select = styled(MUISelect)`
  && {
    .MuiSelect-root {
      color: white;
      background: #3f51b5;
    }
    .MuiSvgIcon-root {
      color: white;
    }
  }
`;

export default Select;
