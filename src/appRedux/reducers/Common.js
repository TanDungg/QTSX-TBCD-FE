import { fromJS } from "immutable";
import isEmpty from "lodash/isEmpty";

import {
  FETCH_ERROR,
  FETCH_START,
  FETCH_SUCCESS,
  FETCH_RESET,
  HIDE_MESSAGE,
  SHOW_MESSAGE,
  FETCH_RESET_ITEM,
  WINDOW_WIDTH,
  TOGGLE_COLLAPSED_NAV,
  GET_APP_NAME,
} from "src/constants/ActionTypes";
import Helper from "src/helpers";
import { messages } from "src/constants/Messages";
import MessageStatus from "src/util/MessageStatus";

const INIT_STATE = fromJS({
  error: "",
  loading: false,
  message: "",
  data: [],
  item: {},
  getName: "",
  loadingSave: false,
  customMessage: "",
  navCollapsed: false,
  width: window.innerWidth,
  pathname: "/",
  reset: false,
});

export default (state = INIT_STATE, action) => {
  const apiType = action.apiType;
  switch (action.type) {
    case "@@router/LOCATION_CHANGE": {
      return state
        .set(
          "pathname",
          action.payload ? action.payload.location.hash : window.location.hash
        )
        .set("navCollapsed", false);
    }
    case WINDOW_WIDTH:
      return state.set("width", action.width);
    case TOGGLE_COLLAPSED_NAV: {
      return state.set("navCollapsed", action.navCollapsed);
    }

    case FETCH_START: {
      if (apiType === "ADD" || apiType === "EDIT") {
        return state
          .set("error", "")
          .set("getName", "")
          .set("loading", true)
          .set("loadingSave", true)
          .set("reset", false);
      }
      return state
        .set("error", "")
        .set("getName", "")
        .set("loading", true)
        .set("reset", false);
    }
    case FETCH_SUCCESS: {
      /**
       * Thông báo (action.apiType) ---
       * LIST: Fetch danh sách
       * ADD: Thêm mới
       * EDIT: Sửa
       * DELETE: Xoá
       * DETAIL: Chi tiết
       * Status trả về (action.status) ---
       * 400: Trùng
       * 404: Dịch vụ không tồn tại
       * 417: Dữ liệu không tồn tại
       * 500: Lỗi dữ liệu
       * 504: Gateway Time-out
       */
      const responseStatus = action.status;
      if (
        responseStatus === 200 ||
        responseStatus === 201 ||
        responseStatus === 204
      ) {
        if (apiType === "LIST") {
          if (action.getName) {
            let setValue = {};
            setValue[action.getName] = {};
            setValue[action.getName] = action.data;
            setValue.getName = action.getName;
            setValue = fromJS(setValue);
            return state
              .set("message", messages.TAI_VE_THANH_CONG)
              .set("loading", false)
              .set(action.getName, setValue.get(action.getName))
              .set("getName", setValue.get("getName"))
              .set("reset", false);
          } else {
            return state
              .set("message", messages.TAI_VE_THANH_CONG)
              .set("loading", false)
              .set("data", action.data)
              .set("reset", false);
          }
        }
        let customMessage;
        if (!isEmpty(action.data) && typeof action.data === "string") {
          customMessage = action.data;
        }
        if (apiType === "ADD") {
          // Message thêm mới
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.THEM_THANH_CONG);
          return state
            .set("message", messages.THEM_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "YEUCAU") {
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.GUI_YEU_CAU_THANH_CONG);
          return state
            .set("message", messages.GUI_YEU_CAU_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "NHANHANG") {
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.NHAN_HANG_THANH_CONG);
          return state
            .set("message", messages.NHAN_HANG_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "XACNHAN") {
          // Message thêm mới
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.XAC_NHAN_THANH_CONG);
          return state
            .set("message", messages.XAC_NHAN_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "TUCHOI") {
          // Message thêm mới
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.TU_CHOI_THANH_CONG);
          return state
            .set("message", messages.TU_CHOI_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "CANCEL") {
          // Message thêm mới
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.HUY_THANH_CONG);
          return state
            .set("message", messages.HUY_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "FINISH") {
          // Message thêm mới
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.BAO_TRI_THANH_CONG);
          return state
            .set("message", messages.BAO_TRI_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "REPLY") {
          // Message đánh giá
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.DANH_GIA_THANH_CONG);
          return state
            .set("message", messages.DANH_GIA_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "DOWLOAD") {
          // Message DOWLOAD
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.TAI_FILE_THANH_CONG);
          return state
            .set("message", messages.TAI_FILE_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "DELETE") {
          // Message xoá thành công
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.XOA_THANH_CONG);
          return state
            .set("message", messages.XOA_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("reset", false);
        }
        if (apiType === "EDIT") {
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.CAP_NHAT_THANH_CONG);
          return state
            .set("error", "")
            .set("message", messages.CAP_NHAT_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "GUIPHIEU") {
          if (customMessage) Helper.alertSuccessMessage(customMessage);
          else Helper.alertSuccessMessage(messages.GUI_PHIEU_THANH_CONG);
          return state
            .set("error", "")
            .set("message", messages.GUI_PHIEU_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "DETAIL") {
          return state
            .set("error", "")
            .set("message", "")
            .set("loading", false)
            .set("item", fromJS(action.data))
            .set("reset", false);
        }
        if (apiType === "XUATKHO") {
          // Message xuất kho
          return state
            .set("message", messages.XUATKHO_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "IMPORT") {
          // Message xuất kho
          if (!isEmpty(action.data.message) && action.data.message !== "") {
            customMessage = action.data.message;
            Helper.alertError(customMessage);
          } else Helper.alertSuccessMessage(messages.IMPORT_THANH_CONG);
          return state
            .set("message", messages.IMPORT_THANH_CONG)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "ROLE") {
          // Message xuất kho
          if (!isEmpty(action.data.message) && action.data.message !== "") {
            customMessage = action.data.message;
            Helper.alertError(customMessage);
          } else Helper.alertSuccessMessage(messages.ADD_ROLE_SUCCESS);
          return state
            .set("message", messages.ADD_ROLE_SUCCESS)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        if (apiType === "EDITROLE") {
          // Message xuất kho
          if (!isEmpty(action.data.message) && action.data.message !== "") {
            customMessage = action.data.message;
            Helper.alertError(customMessage);
          } else Helper.alertSuccessMessage(messages.EDIT_ROLE_SUCCESS);
          return state
            .set("message", messages.EDIT_ROLE_SUCCESS)
            .set("customMessage", customMessage)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
        return state.set("loading", false);
      } else {
        if (apiType === "IMPORT") {
          MessageStatus(responseStatus, action.data.ghiChuImport);
          return state
            .set("error", "")
            .set("message", action.data.ghiChuImport)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        } else {
          MessageStatus(responseStatus, action.data);
          return state
            .set("error", "")
            .set("message", action.data.message)
            .set("loading", false)
            .set("loadingSave", false)
            .set("reset", false);
        }
      }
    }
    case FETCH_ERROR: {
      return state
        .set("error", action.payload)
        .set("message", "")
        .set("loading", false)
        .set("reset", false);
    }
    case SHOW_MESSAGE: {
      return state
        .set("error", "")
        .set("message", action.payload)
        .set("loading", false)
        .set("reset", false);
    }
    case HIDE_MESSAGE: {
      return state
        .set("error", "")
        .set("message", "")
        .set("loading", false)
        .set("reset", false);
    }
    case FETCH_RESET: {
      return INIT_STATE;
    }
    case FETCH_RESET_ITEM: {
      // remove item in state
      return state.set(action.payload, fromJS({})).set("reset", true);
    }
    default:
      return state;
  }
};
