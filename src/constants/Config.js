// export const BASE_URL_API = "https://qlcntt-be.thacoindustries.com";
export const BASE_URL_API = `http://10.14.7.215:1512`;
// export const BASE_URL_API = `http://localhost`;

export const BASE_URL_APP = `${window.location.origin.toString()}`;
// export const BASE_URL_APP = `http://localhost:4000`;

export const APP_NAME = "HỆ THỐNG ERP";
export const PAGE_SIZE = 20;
//localhost

export const DEFAULT_FORM_STYLE = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

export const DEFAULT_FORM_CUSTOM = {
  labelCol: {
    span: 6,
    style: { fontWeight: "bold" },
  },
  wrapperCol: {
    span: 12,
  },
};

export const DEFAULT_FORM = {
  labelCol: {
    span: 6,
    style: { fontWeight: "bold" },
  },
  wrapperCol: {
    span: 18,
  },
};

export const DEFAULT_FORM_TWO_COL = {
  labelCol: {
    span:
      window.innerWidth >= 1600
        ? 8
        : window.innerWidth >= 1200
        ? 11
        : window.innerWidth >= 768
        ? 8
        : window.innerWidth >= 576
        ? 10
        : 7,
    style: {
      fontWeight: "bold",
      marginLeft: window.innerWidth >= 1600 ? -15 : 0,
    },
  },
  wrapperCol: {
    span:
      window.innerWidth >= 1600
        ? 16
        : window.innerWidth >= 1200
        ? 13
        : window.innerWidth >= 768
        ? 16
        : window.innerWidth >= 576
        ? 14
        : 17,
  },
};

export const DEFAULT_FORM_TRA_NCC = {
  labelCol: {
    span:
      window.innerWidth >= 1600
        ? 7
        : window.innerWidth >= 1200
        ? 10
        : window.innerWidth >= 768
        ? 6
        : window.innerWidth >= 576
        ? 9
        : 7,
    style: {
      fontWeight: "bold",
      marginLeft: window.innerWidth >= 1600 ? -15 : 0,
    },
  },
  wrapperCol: {
    span:
      window.innerWidth >= 1600
        ? 16
        : window.innerWidth >= 1200
        ? 14
        : window.innerWidth >= 768
        ? 17
        : window.innerWidth >= 576
        ? 15
        : 17,
  },
};

export const DEFAULT_FORM_DENGHI_CVT = {
  labelCol: {
    span:
      window.innerWidth >= 1600
        ? 7
        : window.innerWidth >= 1200
        ? 11
        : window.innerWidth >= 768
        ? 6
        : window.innerWidth >= 576
        ? 9
        : 7,
    style: {
      fontWeight: "bold",
      marginLeft: window.innerWidth >= 1600 ? -15 : 0,
    },
  },
  wrapperCol: {
    span:
      window.innerWidth >= 1600
        ? 16
        : window.innerWidth >= 1200
        ? 13
        : window.innerWidth >= 768
        ? 17
        : window.innerWidth >= 576
        ? 15
        : 17,
  },
};
