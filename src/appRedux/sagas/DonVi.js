import { DON_VI, DON_VI_FAIL, DON_VI_SUCCESS } from "src/constants/ActionTypes";

// Saga effects
import { put, takeEvery, all, fork } from "redux-saga/effects";
import fetchData from "./others/Api";
import { getTokenInfo } from "src/util/Common";
// Load API
const fetchDataAPI = function* fetchDataAPI() {
  const tokenInfo = getTokenInfo();
  try {
    const receivedData = yield fetchData(
      `PhanMem/list-don-vi-for-user?user_Id=${tokenInfo && tokenInfo.id}`,
      "GET",
      null
    );
    yield put({
      type: DON_VI_SUCCESS,
      data: JSON.parse(receivedData.data.chitiet),
    });
  } catch (error) {
    yield put({
      type: DON_VI_FAIL,
      error,
    });
  }
};

export const watchFetchDataAPI = function* watchFetchDataAPI() {
  yield takeEvery(DON_VI, fetchDataAPI);
};

export default function* rootSaga() {
  yield all([fork(watchFetchDataAPI)]);
}
