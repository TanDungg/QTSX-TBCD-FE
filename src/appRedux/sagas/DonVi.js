import { DON_VI, DON_VI_FAIL, DON_VI_SUCCESS } from "src/constants/ActionTypes";

// Saga effects
import { put, takeEvery, all, fork } from "redux-saga/effects";
import fetchData from "./others/Api";
// Load API
const fetchDataAPI = function* fetchDataAPI() {
  try {
    const receivedData = yield fetchData(
      `PhanMem/list-don-vi-for-user`,
      "GET",
      null
    );
    yield put({
      type: DON_VI_SUCCESS,
      data: receivedData.data,
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
