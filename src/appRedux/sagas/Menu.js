import {
  LOAD_MENU,
  LOAD_MENU_SUCCESS,
  LOAD_MENU_FAIL,
} from "src/constants/ActionTypes";

// Saga effects
import { put, takeEvery, all, fork } from "redux-saga/effects";
import fetchData from "./others/Api";
import { convertObjectToUrlParams, getLocalStorage } from "src/util/Common";

// Load API
const fetchDataAPI = function* fetchDataAPI() {
  const menu = getLocalStorage("menu");
  const param = convertObjectToUrlParams({
    DonVi_Id: menu && menu.donVi_Id.toLowerCase(),
    PhanMem_Id: menu && menu.phanMem_Id,
  });
  try {
    const receivedData = yield fetchData(`Menu/By_User?${param}`, "GET", null);
    yield put({
      type: LOAD_MENU_SUCCESS,
      data: receivedData.data,
      status: receivedData.status,
    });
  } catch (error) {
    yield put({
      type: LOAD_MENU_FAIL,
      error,
    });
  }
};

export const watchFetchDataAPI = function* watchFetchDataAPI() {
  yield takeEvery(LOAD_MENU, fetchDataAPI);
};

export default function* rootSaga() {
  yield all([fork(watchFetchDataAPI)]);
}
