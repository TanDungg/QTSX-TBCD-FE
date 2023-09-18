import { DON_VI, DON_VI_SUCCESS, DON_VI_FAIL } from "src/constants/ActionTypes";

const INIT_STATE = {
  donvi: [],
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case DON_VI: {
      return {
        ...state,
      };
    }

    case DON_VI_SUCCESS: {
      return {
        ...state,
        donvi: action.data,
      };
    }

    case DON_VI_FAIL: {
      return {
        ...state,
      };
    }

    default:
      return state;
  }
};
