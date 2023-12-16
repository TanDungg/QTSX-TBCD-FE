import { HISTORY_SUCCESS } from "src/constants/ActionTypes";

const INIT_STATE = {
  path: "",
  option: {},
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case HISTORY_SUCCESS: {
      return {
        ...state,
        ...action.data,
      };
    }

    default:
      return state;
  }
};
