import {
  THONG_BAO,
  THONG_BAO_FAIL,
  THONG_BAO_SUCCESS,
} from "src/constants/ActionTypes";

// Saga effects
import { put, takeEvery, all, fork } from "redux-saga/effects";
import fetchData from "./others/Api";
import { getTokenInfo } from "src/util/Common";
const tokenInfo = getTokenInfo();
// Load API
const fetchDataAPI = function* fetchDataAPI() {
  try {
    const receivedData = yield fetchData(
      `ThongBao?user_id=${tokenInfo.id}`,
      "GET",
      null
    );
    yield put({
      type: THONG_BAO_SUCCESS,
      data: receivedData.data.datalist,
    });
  } catch (error) {
    yield put({
      type: THONG_BAO_FAIL,
      error,
    });
  }
};

export const watchFetchDataAPI = function* watchFetchDataAPI() {
  yield takeEvery(THONG_BAO, fetchDataAPI);
};

export default function* rootSaga() {
  yield all([fork(watchFetchDataAPI)]);
}
