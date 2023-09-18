import {
  THONG_BAO,
  THONG_BAO_SUCCESS,
  THONG_BAO_FAIL,
} from "src/constants/ActionTypes";

const INIT_STATE = {
  thongbao: [],
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case THONG_BAO: {
      return {
        ...state,
      };
    }

    case THONG_BAO_SUCCESS: {
      return {
        ...state,
        thongbao: action.data,
      };
    }

    case THONG_BAO_FAIL: {
      return {
        ...state,
      };
    }

    default:
      return state;
  }
};
