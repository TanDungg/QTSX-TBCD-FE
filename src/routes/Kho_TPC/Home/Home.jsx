import { EyeOutlined } from "@ant-design/icons";
import { Card, Tabs } from "antd";
import { Column, G2 } from "@ant-design/plots";

import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getNumberDayOfMonth } from "src/util/Common";

import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { reDataForTable } from "src/util/Common";

import { EditableTableRow, Table } from "src/components/Common";

import { convertObjectToUrlParams } from "src/util/Common";

require("dotenv").config();
const { EditableRow, EditableCell } = EditableTableRow;

function Home({ permission, history }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [dataTDSXB, setDataTDSXB] = useState([]);
  const [dataTDSXCT, setDataTDSXCT] = useState([]);
  const [dataTDGHB, setDataTDGHB] = useState([]);
  const [dataTDGHCT, setDataTDGHCT] = useState([]);
  const [mixRowSXCT, setMixRowSXCT] = useState([]);
  const [mixRowGHCT, setMixRowGHCT] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [load, setLoad] = useState(false);
  useEffect(() => {
    loadData(Number(activeTab));
    setLoad(!load);
    return () => dispatch(fetchReset());
  }, [activeTab]);
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(activeTab);
      setLoad(!load);
    }, 30000);
    return () => clearTimeout(timer);
  }, [load]);

  const loadData = (number) => {
    const date = new Date();
    const ngay =
      date.getDate().toString().length === 1
        ? "0" + date.getDate()
        : date.getDate();
    const thang =
      (date.getMonth() + 1).toString().length === 1
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1;
    const nam = date.getFullYear();
    let param1 = convertObjectToUrlParams({ ngay, thang, nam });
    let param = convertObjectToUrlParams({ thang, nam });
    if (number == 1) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `baocao/bieu-do?${param1}`,
            "GET",
            null,
            "DETAIL",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.data) {
            const dataPlot = [];
            map(res.data, (d) => {
              if (
                d.soLuongKHSX == 0 &&
                d.soLuongKHGH == 0 &&
                d.soLuongTTGH == 0 &&
                d.soLuongTTSX == 0
              ) {
              } else {
                const newData = [
                  {
                    name: "Kế hoạch sản xuất",
                    soLuong: d.soLuongKHSX,
                    maXe: d.maXe,
                  },
                  {
                    name: "Thực tế sản xuất",
                    soLuong: d.soLuongTTSX,
                    maXe: d.maXe,
                  },
                  {
                    name: "Kế hoạch giao hàng",
                    soLuong: d.soLuongKHGH,
                    maXe: d.maXe,
                  },
                  {
                    name: "Thực tế giao hàng",
                    soLuong: d.soLuongTTGH,
                    maXe: d.maXe,
                  },
                ];
                dataPlot.push(...newData);
              }
            });
            setData(dataPlot);
          }
        })
        .catch((error) => console.error(error));
    } else if (number == 2) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `baocao/tien-do-sx-bo?${param}`,
            "GET",
            null,
            "DETAIL",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.data) {
            const newData = res.data;
            for (let i = 1; i <= getNumberDayOfMonth() + 1; i++) {
              map(newData, (d) => {
                d.dept = "Xưởng sản xuất";
                map(d.chiTiet, (dulieu) => {
                  const key = dulieu.ngay;
                  if (dulieu.soluong == 0) {
                    d[key] = "-";
                  } else {
                    d[key] = dulieu.soluong;
                  }
                  if (dulieu[i] == undefined) {
                    d[i] = "-";
                  }
                });
              });
            }
            setDataTDSXB(reDataForTable(newData));
          }
        })
        .catch((error) => console.error(error));
    } else if (number == 3) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `baocao/tien-do-sx-ct?${param}`,
            "GET",
            null,
            "DETAIL",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.data) {
            const newData = res.data;
            const elementToFind = [];
            const result = [];
            map(newData, (d) => {
              elementToFind.push({ tenXe: d.tenXe });
            });
            const uniqueArr = elementToFind.filter((element, index, self) => {
              return (
                index === self.findIndex((el) => el.tenXe === element.tenXe)
              );
            });
            uniqueArr.forEach((d) => {
              let count = 0;
              let firstIndex = -1;
              let lastIndex = -1;
              elementToFind.forEach((element, index) => {
                const matches = Object.keys(d).every((key) => {
                  return d[key] === element[key];
                });

                if (matches) {
                  count++;

                  if (firstIndex === -1) {
                    firstIndex = index;
                  }

                  lastIndex = index;
                }
              });
              result.push({
                tenXe: d.tenXe,
                first: firstIndex,
                last: lastIndex,
                tong: count,
              });
            });
            setMixRowSXCT(result);
            for (let i = 1; i <= getNumberDayOfMonth() + 1; i++) {
              map(newData, (d) => {
                d.boPhan = "Xưởng";
                map(d.chiTiet, (dulieu) => {
                  const key = dulieu.ngay;
                  if (dulieu.soLuongSX == 0) {
                    d[key] = "-";
                  } else {
                    d[key] = dulieu.soLuongSX;
                  }
                  if (dulieu[i] == undefined) {
                    d[i] = "-";
                  }
                });
              });
            }
            setDataTDSXCT(reDataForTable(newData));
          }
        })
        .catch((error) => console.error(error));
    } else if (number == 4) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `baocao/tien-do-gh-bo?${param}`,
            "GET",
            null,
            "DETAIL",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.data) {
            const newData = res.data;
            for (let i = 1; i <= getNumberDayOfMonth() + 1; i++) {
              map(newData, (d) => {
                d.dept = "Xưởng sản xuất";

                map(d.chiTiet, (dulieu) => {
                  const key = dulieu.ngay;
                  if (dulieu.soLuong == 0) {
                    d[key] = "-";
                  } else {
                    d[key] = dulieu.soLuong;
                  }
                  if (dulieu[i] == undefined) {
                    d[i] = "-";
                  }
                });
              });
            }
            setDataTDGHB(reDataForTable(newData));
          }
        })
        .catch((error) => console.error(error));
    } else if (number == 5) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `baocao/tien-do-gh-ct?${param}`,
            "GET",
            null,
            "DETAIL",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.data) {
            const newData = res.data;
            const elementToFind = [];
            const result = [];
            map(newData, (d) => {
              elementToFind.push({ tenXe: d.tenXe });
            });
            const uniqueArr = elementToFind.filter((element, index, self) => {
              return (
                index === self.findIndex((el) => el.tenXe === element.tenXe)
              );
            });
            uniqueArr.forEach((d) => {
              let count = 0;
              let firstIndex = -1;
              let lastIndex = -1;
              elementToFind.forEach((element, index) => {
                const matches = Object.keys(d).every((key) => {
                  return d[key] === element[key];
                });

                if (matches) {
                  count++;

                  if (firstIndex === -1) {
                    firstIndex = index;
                  }

                  lastIndex = index;
                }
              });
              result.push({
                tenXe: d.tenXe,
                first: firstIndex,
                last: lastIndex,
                tong: count,
              });
            });
            setMixRowGHCT(result);
            for (let i = 1; i <= getNumberDayOfMonth() + 1; i++) {
              map(newData, (d) => {
                d.boPhan = "Xưởng";
                map(d.chiTiet, (dulieu) => {
                  const key = dulieu.ngay;
                  if (dulieu.soLuongXK == 0) {
                    d[key] = "-";
                  } else {
                    d[key] = dulieu.soLuongXK;
                  }
                  if (dulieu[i] == undefined) {
                    d[i] = "-";
                  }
                });
              });
            }
            setDataTDGHCT(reDataForTable(newData));
          }
        })
        .catch((error) => console.error(error));
    }
  };
  const getDate = () => {
    const date = new Date();
    const day =
      (date.getDate().toString().length === 1
        ? "0" + date.getDate()
        : date.getDate()) +
      "/" +
      ((date.getMonth() + 1).toString().length === 1
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) +
      "/" +
      date.getFullYear() +
      " ";
    return day.toString();
  };

  const ngayThangNam = getDate();
  /**
   * Hiển thị tag quyền
   *
   * @param {*} val
   * @returns
   */
  const renderDisplayName = (val) => {
    const tu = val.toString().split("/")[0];
    const mau = val.toString().split("/")[1];
    if (!isEmpty(val.toString())) {
      if (val == "-" || val == "0/0") {
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            -
          </div>
        );
      } else if (Number(tu) >= Number(mau)) {
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "blue",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
            }}
          >
            {val}
          </div>
        );
      } else if (Number(tu) < Number(mau)) {
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "red",
              display: "flex",
              justifyContent: "center",
              color: "#fff",
              alignItems: "center",
            }}
          >
            {val}
          </div>
        );
      } else {
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {val}
          </div>
        );
      }
    }
    return null;
  };
  const render = (val) => {
    if (val == "-" || val == "0/0") {
      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          -
        </div>
      );
    } else {
      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {val}
        </div>
      );
    }
  };
  let colTDXSB = [
    {
      title: "Bộ phận",
      dataIndex: "dept",
      key: "dept",
      width: 60,
      fixed: width > 450 ? "left" : "none",
      align: "center",
      onCell: (_, index) => {
        if (index == 0) {
          return {
            rowSpan: dataTDSXB.length,
          };
        }
        return {
          rowSpan: 0,
        };
      },
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenXe",
      key: "tenXe",
      width: 150,
      fixed: width > 450 ? "left" : "none",
      align: "center",
    },
    {
      align: "center",
      title: `Kết quả sản xuất theo sản phẩm tháng ${ngayThangNam.slice(-8)}`,
      children: new Array(getNumberDayOfMonth()).fill(null).map((_, i) => {
        const id = String(i + 1);
        return {
          title: id,
          align: "center",
          width: 60,
          dataIndex: id,
          key: id,
          render: (val) =>
            // id > new Date().getDate() ?
            render(val),
          // : renderDisplayName(val),
        };
      }),
    },
    {
      title: "Lũy kế sản xuất",
      dataIndex: "luyKeSX",
      key: "luyKeSX",
      align: "center",
      width: 60,
    },
    {
      title: "Lũy kế kế hoạch",
      dataIndex: "luyKeKH",
      key: "luyKeKH",
      align: "center",
      width: 60,
    },
    {
      title: "Kế hoạch của tháng",
      dataIndex: "tongKH",
      key: "tongKH",
      align: "center",

      width: 60,
    },
    {
      title: "Chênh lệch",
      dataIndex: "diff",
      align: "center",
      key: "diff",
      width: 60,
    },
  ];
  let colTDXSCT = [
    {
      title: "Bộ phận",
      dataIndex: "boPhan",
      key: "boPhan",
      width: 60,
      fixed: width > 770 ? "left" : "none",
      align: "center",
      onCell: (_, index) => {
        if (index == 0) {
          return {
            rowSpan: dataTDSXCT.length,
          };
        }
        return {
          rowSpan: 0,
        };
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenXe",
      fixed: width > 770 ? "left" : "none",

      key: "tenXe",
      width: 120,
      align: "center",
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        mixRowSXCT.forEach((d, i) => {
          if (index === d.first) {
            obj.props.rowSpan = d.tong;
          }
          if (index > d.first && index <= d.last) {
            obj.props.rowSpan = 0;
          }
        });
        return obj;
      },
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      fixed: width > 770 ? "left" : "none",

      width: 150,
      align: "center",
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      fixed: width > 770 ? "left" : "none",

      width: 150,
      align: "center",
    },
    {
      align: "center",
      title: `Kết quả sản xuất theo chi tiết tháng ${ngayThangNam.slice(-8)}`,
      children: new Array(getNumberDayOfMonth()).fill(null).map((_, i) => {
        const id = String(i + 1);
        return {
          title: id,
          align: "center",
          width: 50,
          dataIndex: id,
          key: id,
        };
      }),
    },
    {
      title: "Lũy kế sản xuất",
      dataIndex: "luyKeSX",
      key: "luyKeSX",
      align: "center",
      width: 50,
    },
    {
      title: "Lũy kế kế hoạch",
      dataIndex: "luyKeKH",
      key: "luyKeKH",
      align: "center",
      width: 50,
    },
    {
      title: "Kế hoạch của tháng",
      dataIndex: "tongKH",
      key: "tongKH",
      align: "center",

      width: 60,
    },
    {
      title: "Chênh lệch",
      dataIndex: "diff",
      align: "center",
      key: "diff",
      width: 50,
    },
  ];
  let colTDGHB = [
    {
      title: "Bộ phận",
      dataIndex: "dept",
      key: "dept",
      width: 60,
      fixed: width > 450 ? "left" : "none",
      align: "center",
      onCell: (_, index) => {
        if (index == 0) {
          return {
            rowSpan: dataTDGHB.length,
          };
        }
        return {
          rowSpan: 0,
        };
      },
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenXe",
      key: "tenXe",
      fixed: width > 450 ? "left" : "none",
      width: 150,
      align: "center",
    },
    {
      align: "center",
      title: `Kết quả giao hàng theo sản phẩm tháng ${ngayThangNam.slice(-8)}`,
      children: new Array(getNumberDayOfMonth()).fill(null).map((_, i) => {
        const id = String(i + 1);
        return {
          title: id,
          align: "center",
          width: 60,
          key: id,
          dataIndex: id,
          render: (val) =>
            // id > new Date().getDate() ?
            render(val),
          //  : renderDisplayName(val),
        };
      }),
    },
    {
      title: "Lũy kế giao hàng",
      dataIndex: "luyKeGH",
      key: "luyKeGH",
      align: "center",
      width: 60,
    },
    {
      title: "Lũy kế kế hoạch",
      dataIndex: "luyKeKH",
      key: "luyKeKH",
      align: "center",
      width: 60,
    },
    {
      title: "Kế hoạch của tháng",
      dataIndex: "tongKH",
      key: "tongKH",
      align: "center",

      width: 60,
    },
    {
      title: "Chênh lệch",
      dataIndex: "diff",
      align: "center",
      key: "diff",
      width: 60,
    },
  ];

  let colTDGHCT = [
    {
      title: "Bộ phận",
      dataIndex: "boPhan",
      key: "boPhan",
      fixed: width > 770 ? "left" : "none",
      width: 60,
      align: "center",
      onCell: (_, index) => {
        if (index == 0) {
          return {
            rowSpan: dataTDGHCT.length,
          };
        }
        return {
          rowSpan: 0,
        };
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenXe",
      key: "tenXe",
      fixed: width > 770 ? "left" : "none",
      width: 120,
      align: "center",
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        mixRowGHCT.forEach((d, i) => {
          if (index === d.first) {
            obj.props.rowSpan = d.tong;
          }
          if (index > d.first && index <= d.last) {
            obj.props.rowSpan = 0;
          }
        });
        return obj;
      },
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      fixed: width > 770 ? "left" : "none",
      width: 150,
      align: "center",
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      width: 150,
      fixed: width > 770 ? "left" : "none",
      align: "center",
    },
    {
      align: "center",
      title: `Kết quả sản xuất theo chi tiết tháng ${ngayThangNam.slice(-8)}`,
      children: new Array(getNumberDayOfMonth()).fill(null).map((_, i) => {
        const id = String(i + 1);
        return {
          title: id,
          align: "center",
          width: 50,
          dataIndex: id,
          key: id,
        };
      }),
    },
    {
      title: "Lũy kế giao hàng ",
      dataIndex: "luyKeGH",
      key: "luyKeGH",
      align: "center",
      width: 50,
    },
    {
      title: "Lũy kế kế hoạch",
      dataIndex: "luyKeKH",
      key: "luyKeKH",
      align: "center",
      width: 50,
    },
    {
      title: "Kế hoạch của tháng",
      dataIndex: "tongKH",
      key: "tongKH",
      align: "center",

      width: 60,
    },
    {
      title: "Chênh lệch",
      dataIndex: "diff",
      align: "center",
      key: "diff",
      width: 50,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columsTDSXB = map(colTDXSB, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });
  const columsTDSXCT = map(colTDXSCT, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });
  const columsTDHGB = map(colTDGHB, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });
  const columsTDHGCT = map(colTDGHCT, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const config = {
    data,
    isGroup: true,
    xField: "maXe",
    yField: "soLuong",
    // groupField: "name",
    seriesField: "name",
    // isStack: true,
    color: ["#1677ff", "#f5222d", "#52c41a", "#fadb14"],
    label: {
      position: "middle",
      layout: [
        {
          type: "interval-adjust-position",
        },
        {
          type: "interval-hide-overlap",
        },
        {
          // type: "adjust-color",
        },
      ],
      style: {
        fontSize: 18,
        fontWeight: "bold",
        fill: "black",
      },
    },
    legend: {
      itemName: {
        style: {
          fontSize: 15,
          fill: "black",
        },
      },
    },
    xAxis: {
      label: {
        style: {
          fontSize: 15,
          // fill: "black",
          fontWeight: "bold",
        },
        autoRotate: false,
      },
    },
    // slider: {
    //   start: 0.0,
    //   end: 0.5,
    // },
  };
  const data1 = [
    {
      name: "Kế hoạch sản xuất",
      month: "CX-5.",
      value: 70,
      type: "CX5_CX8-CAPO",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "CX-5.",
      value: 67,
      type: "CX5-COP",
    },
    {
      name: "Thực tế sản xuất",
      month: "CX-5.",
      value: 70,
      type: "CX5_CX8-CAPO",
    },
    {
      name: "Thực tế sản xuất",
      month: "CX-5.",
      value: 67,
      type: "CX5-COP",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "CX-5.",
      value: 70,
      type: "CX5_CX8-CAPO",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "CX-5.",
      value: 67,
      type: "CX5-COP",
    },
    {
      name: "Thực tế giao hàng",
      month: "CX-5.",
      value: 70,
      type: "CX5_CX8-CAPO",
    },
    {
      name: "Thực tế giao hàng",
      month: "CX-5.",
      value: 67,
      type: "CX5-COP",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "CX-8.",
      value: 70,
      type: "CX5_CX8-CAPO1",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "CX-8.",
      value: 67,
      type: "CX5-COP1",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "CX-8.",
      value: 67,
      type: "CX5-COPA1",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "CX-8.",
      value: 67,
      type: "CX5-C1OPA",
    },
    {
      name: "Thực tế sản xuất",
      month: "CX-8.",
      value: 70,
      type: "CX5_CX8-CAPO1",
    },
    {
      name: "Thực tế sản xuất",
      month: "CX-8.",
      value: 67,
      type: "CX5-COP1",
    },
    {
      name: "Thực tế sản xuất",
      month: "CX-8.",
      value: 70,
      type: "CX5-COPA1",
    },
    {
      name: "Thực tế sản xuất",
      month: "CX-8.",
      value: 67,
      type: "CX5-C1OPA",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "CX-8.",
      value: 70,
      type: "CX5_CX8-CAPO1",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "CX-8.",
      value: 67,
      type: "CX5-COP1",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "CX-8.",
      value: 70,
      type: "CX5-COPA1",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "CX-8.",
      value: 67,
      type: "CX5-C1OPA",
    },
    {
      name: "Thực tế giao hàng",
      month: "CX-8.",
      value: 70,
      type: "CX5_CX8-CAPO1",
    },
    {
      name: "Thực tế giao hàng",
      month: "CX-8.",
      value: 67,
      type: "CX5-COP1",
    },
    {
      name: "Thực tế giao hàng",
      month: "CX-8.",
      value: 70,
      type: "CX5-COPA1",
    },
    {
      name: "Thực tế giao hàng",
      month: "CX-8.",
      value: 67,
      type: "CX5-C1OPA",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "QY",
      value: 70,
      type: "QY1",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "QY",
      value: 67,
      type: "QY2",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "QY",
      value: 67,
      type: "QY3",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "QY",
      value: 67,
      type: "QY4",
    },
    {
      name: "Kế hoạch sản xuất",

      month: "QY",
      value: 67,
      type: "QY5",
    },
    {
      name: "Kế hoạch sản xuất",
      month: "QY",
      value: 70,
      type: "QY6",
    },
    {
      name: "Thực tế sản xuất",
      month: "QY",
      value: 70,
      type: "QY1",
    },
    {
      name: "Thực tế sản xuất",
      month: "QY",
      value: 67,
      type: "QY2",
    },
    {
      name: "Thực tế sản xuất",
      month: "QY",
      value: 70,
      type: "QY3",
    },
    {
      name: "Thực tế sản xuất",
      month: "QY",
      value: 67,
      type: "QY4",
    },
    {
      name: "Thực tế sản xuất",

      month: "QY",
      value: 67,
      type: "QY5",
    },
    {
      name: "Thực tế sản xuất",

      month: "QY",
      value: 70,
      type: "QY6",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "QY",
      value: 70,
      type: "QY1",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "QY",
      value: 67,
      type: "QY2",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "QY",
      value: 70,
      type: "QY3",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "QY",
      value: 67,
      type: "QY4",
    },
    {
      name: "Kế hoạch giao hàng",
      month: "QY",
      value: 70,
      type: "QY5",
    },
    {
      name: "Kế hoạch giao hàng",

      month: "QY",
      value: 67,
      type: "QY6",
    },
    {
      name: "Thực tế giao hàng",
      month: "QY",
      value: 67,
      type: "QY1",
    },
    {
      name: "Thực tế giao hàng",
      month: "QY",
      value: 70,
      type: "QY2",
    },
    {
      name: "Thực tế giao hàng",
      month: "QY",
      value: 67,
      type: "QY3",
    },
    {
      name: "Thực tế giao hàng",
      month: "QY",
      value: 70,
      type: "QY4",
    },
    {
      name: "Thực tế giao hàng",
      month: "QY",
      value: 67,
      type: "QY5",
    },
    {
      name: "Thực tế giao hàng",
      month: "QY",
      value: 67,
      type: "QY6",
    },
  ];

  const config1 = {
    data: data1,
    xField: "month",
    yField: "value",
    isGroup: true,
    isStack: true,
    seriesField: "type",
    groupField: "name",
    label: true,
    legend: false,

    xAxis: {
      grid: {
        line: {
          style: {
            stroke: "red",
            lineWidth: 2,
            lineDash: [4, 5],
            strokeOpacity: 0.7,
            shadowColor: "black",
            shadowBlur: 10,
            shadowOffsetX: 5,
            shadowOffsetY: 5,
            cursor: "pointer",
          },
        },
      },
    },
  };

  const goTrinhChieu = () => {
    history.push("/trinh-chieu");
  };

  return (
    <div className="gx-main-content">
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        // extra={<EyeOutlined />}
      >
        <Tabs
          tabBarExtraContent={
            width < 576 ? null : (
              <EyeOutlined
                style={{ cursor: "pointer" }}
                onClick={goTrinhChieu}
              />
            )
          }
          defaultActiveKey="1"
          onTabClick={(key) => setActiveTab(key)}
          items={[
            {
              label: `Biểu đồ`,
              key: "1",
              children: (
                <>
                  <h2 align={"center"} style={{ marginBottom: 20 }}>
                    {`KẾT QUẢ SẢN XUẤT NGÀY ${ngayThangNam}`}
                  </h2>
                  <Column
                    {...config}
                    style={{
                      height: "70vh",
                    }}
                  />
                </>
              ),
            },
            // {
            //   label: `Biểu đồ chi tiết`,
            //   key: "2",
            //   children: (
            //     <>
            //       <h2 align={"center"} style={{ marginBottom: 20 }}>
            //         {`KẾT QUẢ SẢN XUẤT NGÀY ${ngayThangNam}`}
            //       </h2>
            //       <Column
            //         {...config1}
            //         style={{
            //           height: "70vh",
            //         }}
            //       />
            //     </>
            //   ),
            // },
            {
              label: `Tiến độ sản xuất bộ`,
              key: "2",
              children: (
                <Table
                  size="small"
                  className="gx-table-responsive gx-table-font-size"
                  scroll={{ y: 600, x: 1600 }}
                  bordered
                  dataSource={dataTDSXB}
                  columns={columsTDSXB}
                  components={components}
                  pagination={false}
                />
              ),
            },
            {
              label: `Tiến độ sản xuất chi tiết`,
              key: "3",
              children: (
                <Table
                  size="small"
                  className="gx-table-responsive gx-table-resize"
                  scroll={{ y: 600, x: 1600 }}
                  bordered
                  dataSource={dataTDSXCT}
                  columns={columsTDSXCT}
                  components={components}
                  pagination={false}
                />
              ),
            },
            {
              label: `Tiến độ giao hàng bộ`,
              key: "4",
              children: (
                <Table
                  size="small"
                  className="gx-table-responsive gx-table-font-size"
                  scroll={{ y: 600, x: 1600 }}
                  bordered
                  dataSource={dataTDGHB}
                  columns={columsTDHGB}
                  components={components}
                  pagination={false}
                />
              ),
            },
            {
              label: `Tiến độ giao hàng chi tiết`,
              key: "5",
              children: (
                <Table
                  size="small"
                  className="gx-table-responsive gx-table-resize"
                  scroll={{ y: 600, x: 1600 }}
                  bordered
                  dataSource={dataTDGHCT}
                  columns={columsTDHGCT}
                  components={components}
                  pagination={false}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default Home;
