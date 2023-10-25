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
  const [mixRowTDSX, setMixRowTDSX] = useState([]);
  const [mixRowTDNK, setMixRowTDNK] = useState([]);
  const [mixRowTDGH, setMixRowTDGH] = useState([]);
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
    if (number == 1) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_BaoCao/get-dashboard-ke-hoach-sx-theo-ngay`,
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
                    soLuong: d.keHoachSanXuat,
                    maXe: d.tenPhongBan,
                  },
                  {
                    name: "Thực tế sản xuất",
                    soLuong: d.thucTeSanXuat,
                    maXe: d.tenPhongBan,
                  },
                  {
                    name: "Kế hoạch giao hàng",
                    soLuong: d.keHoachGiaoHang,
                    maXe: d.tenPhongBan,
                  },
                  {
                    name: "Thực tế giao hàng",
                    soLuong: d.thucTeGiaoHang,
                    maXe: d.tenPhongBan,
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
            `lkn_BaoCao/dashboard-tien-do-san-xuat`,
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
            const newData = [];

            res.data.forEach((x) => {
              JSON.parse(x.chiTietSanPham).forEach((sp) => {
                const chiTiet = {};
                chiTiet.dept = x.tenPhongBan;
                chiTiet.tenSanPham = sp.tenSanPham;
                chiTiet.luyKeSX = sp.luyKeSanXuat;
                chiTiet.diff = sp.chenhLech;
                chiTiet.tongKH = sp.keHoachThang;
                chiTiet.luyKeKH = sp.luyKeSanXuat;
                sp.soLuongChiTiet &&
                  sp.soLuongChiTiet.forEach((ct) => {
                    chiTiet[ct.ngay] = ct.soLuong;
                  });
                newData.push(chiTiet);
              });
            });
            setDataTDSXB(reDataForTable(newData));

            const elementToFind = [];
            const result = [];
            map(newData, (d) => {
              elementToFind.push({ dept: d.dept });
            });
            const uniqueArr = elementToFind.filter((element, index, self) => {
              return index === self.findIndex((el) => el.dept === element.dept);
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
                dept: d.dept,
                first: firstIndex,
                last: lastIndex,
                tong: count,
              });
            });
            setMixRowTDSX(result);
          }
        })
        .catch((error) => console.error(error));
    } else if (number == 3) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_BaoCao/dashboard-tien-do-nhap-kho`,
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
            const newData = [];
            res.data.forEach((x) => {
              JSON.parse(x.chiTietSanPham).forEach((sp) => {
                const chiTiet = {};
                chiTiet.dept = x.tenPhongBan;
                chiTiet.tenSanPham = sp.tenSanPham;
                chiTiet.tongSoLuong = sp.tongSoLuong;
                sp.soLuongChiTiet.forEach((ct) => {
                  chiTiet[ct.ngay] = ct.soLuong;
                });
                newData.push(chiTiet);
              });
            });
            setDataTDSXCT(reDataForTable(newData));

            const elementToFind = [];
            const result = [];
            map(newData, (d) => {
              elementToFind.push({ dept: d.dept });
            });
            const uniqueArr = elementToFind.filter((element, index, self) => {
              return index === self.findIndex((el) => el.dept === element.dept);
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
                dept: d.dept,
                first: firstIndex,
                last: lastIndex,
                tong: count,
              });
            });
            setMixRowTDNK(result);
          }
        })
        .catch((error) => console.error(error));
    } else if (number == 4) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_BaoCao/dashboard-tien-do-giao-hang`,
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
            const newData = [];
            res.data.forEach((x) => {
              JSON.parse(x.sanPhams).forEach((sp) => {
                const chiTiet = {};
                chiTiet.dept = x.tenPhongBan;
                chiTiet.tenSanPham = sp.tenSanPham;
                chiTiet.luyKeSX = sp.luyKeThucHien;
                chiTiet.diff = sp.chenhLech;
                chiTiet.tongKH = sp.tongkeHoach;
                chiTiet.luyKeKH = sp.luyKeKeHoach;
                sp.chiTiets &&
                  sp.chiTiets.forEach((ct) => {
                    chiTiet[ct.ngay] = ct.soLuong;
                  });
                newData.push(chiTiet);
              });
            });
            setDataTDGHB(reDataForTable(newData));
            const elementToFind = [];
            const result = [];
            map(newData, (d) => {
              elementToFind.push({ dept: d.dept });
            });
            const uniqueArr = elementToFind.filter((element, index, self) => {
              return index === self.findIndex((el) => el.dept === element.dept);
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
                dept: d.dept,
                first: firstIndex,
                last: lastIndex,
                tong: count,
              });
            });
            setMixRowTDGH(result);
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
  // /**
  //  * Hiển thị tag quyền
  //  *
  //  * @param {*} val
  //  * @returns
  //  */
  // const renderDisplayName = (val) => {
  //   const tu = val.toString().split("/")[0];
  //   const mau = val.toString().split("/")[1];
  //   if (!isEmpty(val.toString())) {
  //     if (val == "-" || val == "0/0") {
  //       return (
  //         <div
  //           style={{
  //             position: "absolute",
  //             top: 0,
  //             left: 0,
  //             width: "100%",
  //             height: "100%",
  //             display: "flex",
  //             justifyContent: "center",
  //             alignItems: "center",
  //           }}
  //         >
  //           -
  //         </div>
  //       );
  //     } else if (Number(tu) >= Number(mau)) {
  //       return (
  //         <div
  //           style={{
  //             position: "absolute",
  //             top: 0,
  //             left: 0,
  //             width: "100%",
  //             height: "100%",
  //             background: "blue",
  //             display: "flex",
  //             justifyContent: "center",
  //             alignItems: "center",
  //             color: "#fff",
  //           }}
  //         >
  //           {val}
  //         </div>
  //       );
  //     } else if (Number(tu) < Number(mau)) {
  //       return (
  //         <div
  //           style={{
  //             position: "absolute",
  //             top: 0,
  //             left: 0,
  //             width: "100%",
  //             height: "100%",
  //             background: "red",
  //             display: "flex",
  //             justifyContent: "center",
  //             color: "#fff",
  //             alignItems: "center",
  //           }}
  //         >
  //           {val}
  //         </div>
  //       );
  //     } else {
  //       return (
  //         <div
  //           style={{
  //             position: "absolute",
  //             top: 0,
  //             left: 0,
  //             width: "100%",
  //             height: "100%",
  //             display: "flex",
  //             justifyContent: "center",
  //             alignItems: "center",
  //           }}
  //         >
  //           {val}
  //         </div>
  //       );
  //     }
  //   }
  //   return null;
  // };
  const render = (val) => {
    if (val === undefined) {
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
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        mixRowTDSX.forEach((d, i) => {
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
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
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
      width: 65,
    },
    {
      title: "Lũy kế kế hoạch",
      dataIndex: "luyKeKH",
      key: "luyKeKH",
      align: "center",
      width: 65,
    },
    {
      title: "Kế hoạch của tháng",
      dataIndex: "tongKH",
      key: "tongKH",
      align: "center",

      width: 65,
    },
    {
      title: "Chênh lệch",
      dataIndex: "diff",
      align: "center",
      key: "diff",
      width: 65,
    },
  ];
  let colTDXSCT = [
    {
      title: "Bộ phận",
      dataIndex: "dept",
      key: "dept",
      width: 60,
      fixed: width > 450 ? "left" : "none",
      align: "center",
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        mixRowTDNK.forEach((d, i) => {
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
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      width: 150,
      fixed: width > 450 ? "left" : "none",
      align: "center",
    },
    {
      align: "center",
      title: `Kết quả nhập kho theo sản phẩm tháng ${ngayThangNam.slice(-8)}`,
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
      title: "Tổng",
      dataIndex: "tongSoLuong",
      key: "tongSoLuong",
      align: "center",
      width: 65,
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
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        mixRowTDGH.forEach((d, i) => {
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
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      width: 150,
      fixed: width > 450 ? "left" : "none",
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
      width: 65,
    },
    {
      title: "Lũy kế kế hoạch",
      dataIndex: "luyKeKH",
      key: "luyKeKH",
      align: "center",
      width: 65,
    },
    {
      title: "Kế hoạch của tháng",
      dataIndex: "tongKH",
      key: "tongKH",
      align: "center",

      width: 65,
    },
    {
      title: "Chênh lệch",
      dataIndex: "diff",
      align: "center",
      key: "diff",
      width: 65,
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
          // tabBarExtraContent={
          //   width < 576 ? null : (
          //     <EyeOutlined
          //       style={{ cursor: "pointer" }}
          //       onClick={goTrinhChieu}
          //     />
          //   )
          // }
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
              label: `Tiến độ sản xuất`,
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
              label: `Tiến độ nhập kho`,
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
              label: `Tiến độ giao hàng`,
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
          ]}
        />
      </Card>
    </div>
  );
}

export default Home;
