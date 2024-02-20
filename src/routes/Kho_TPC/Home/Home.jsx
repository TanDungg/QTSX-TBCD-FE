import { Card, Tabs } from "antd";
import { Column } from "@ant-design/plots";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getNumberDayOfMonth, removeDuplicates } from "src/util/Common";

import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { reDataForTable } from "src/util/Common";

import { EditableTableRow, Table } from "src/components/Common";
require("dotenv").config();
const { EditableRow, EditableCell } = EditableTableRow;

function Home({ permission, history }) {
  const { width, loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [dataTDSXB, setDataTDSXB] = useState([]);
  const [dataTDSXCT, setDataTDSXCT] = useState([]);
  const [dataTDGHB, setDataTDGHB] = useState([]);
  const [dataVTHH, setDataVTHH] = useState([]);
  const [dataTKTT, setDataTKTT] = useState([]);

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
    if (number === 1) {
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
                d.soLuongKHSX === 0 &&
                d.soLuongKHGH === 0 &&
                d.soLuongTTGH === 0 &&
                d.soLuongTTSX === 0
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
    } else if (number === 2) {
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
    } else if (number === 3) {
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
    } else if (number === 4) {
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
    } else if (number === 5) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `CauTrucKho/vat-tu-sap-het-han`,
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
          if (res && res.status === 200) {
            setDataVTHH(res.data);
          }
        })
        .catch((error) => console.error(error));
    } else if (number === 6) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `CauTrucKho/vat-tu-dinh-muc`,
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
          if (res && res.status === 200) {
            setDataTKTT(res.data);
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
  //     if (val ==="-" || val ==="0/0") {
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
  let colVTSHH = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataVTHH, (d) => {
          return {
            text: d.maVatTu,
            value: d.maVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataVTHH, (d) => {
          return {
            text: d.tenVatTu,
            value: d.tenVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "thoiGianSuDung",
      key: "thoiGianSuDung",
      align: "center",
      filters: removeDuplicates(
        map(dataVTHH, (d) => {
          return {
            text: d.thoiGianSuDung,
            value: d.thoiGianSuDung,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianSuDung.includes(value),
      filterSearch: true,
    },
    {
      title: "Kho",
      dataIndex: "tenKho",
      key: "tenKho",
      align: "center",
      filters: removeDuplicates(
        map(dataVTHH, (d) => {
          return {
            text: d.tenKho,
            value: d.tenKho,
          };
        })
      ),
      onFilter: (value, record) => record.tenKho.includes(value),
      filterSearch: true,
    },
    {
      title: "Vị trí",
      key: "viTri",
      align: "center",
      render: (val) => {
        return (
          <span>{val.tenNgan ? val.tenNgan : val.tenKe && val.tenKe}</span>
        );
      },
      filters: removeDuplicates(
        map(dataVTHH, (d) => {
          return {
            text: d.tenNgan ? d.tenNgan : d.tenKe && d.tenKe,
            value: d.tenNgan ? d.tenNgan : d.tenKe && d.tenKe,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenNgan
          ? record.tenNgan.includes(value)
          : record.tenKe.includes(value),
      filterSearch: true,
    },
  ];
  let colTKTT = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataTKTT, (d) => {
          return {
            text: d.maVatTu,
            value: d.maVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataTKTT, (d) => {
          return {
            text: d.tenVatTu,
            value: d.tenVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng tồn",
      dataIndex: "soLuongTon",
      key: "soLuongTon",
      align: "center",
      render: (val) => <span>{val.toFixed(4)}</span>,
    },
    {
      title: "Số lượng tồn tối thiểu",
      dataIndex: "sLTonKhoToiThieu",
      key: "sLTonKhoToiThieu",
      align: "center",
    },
    {
      title: "Số lượng tồn tối đa",
      dataIndex: "sLTonKhoToiDa",
      key: "sLTonKhoToiDa",
      align: "center",
    },
    {
      title: "Kho",
      dataIndex: "tenKho",
      key: "tenKho",
      align: "center",
      filters: removeDuplicates(
        map(dataTKTT, (d) => {
          return {
            text: d.tenKho,
            value: d.tenKho,
          };
        })
      ),
      onFilter: (value, record) => record.tenKho.includes(value),
      filterSearch: true,
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
  const columsVTSHH = map(colVTSHH, (col) => {
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
  const columsTKTT = map(colTKTT, (col) => {
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

  // const goTrinhChieu = () => {
  //   history.push("/trinh-chieu");
  // };

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
                  scroll={{ y: "63vh", x: 1600 }}
                  bordered
                  dataSource={dataTDSXB}
                  columns={columsTDSXB}
                  loading={loading}
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
                  scroll={{ y: "63vh", x: 1600 }}
                  bordered
                  dataSource={dataTDSXCT}
                  columns={columsTDSXCT}
                  components={components}
                  loading={loading}
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
                  scroll={{ y: "63vh", x: 1600 }}
                  bordered
                  dataSource={dataTDGHB}
                  columns={columsTDHGB}
                  loading={loading}
                  components={components}
                  pagination={false}
                />
              ),
            },
            {
              label: `Vật tư sắp hết hạn`,
              key: "5",
              children: (
                <Table
                  size="small"
                  className="gx-table-responsive gx-table-font-size"
                  scroll={{ y: "67vh", x: 700 }}
                  bordered
                  dataSource={reDataForTable(dataVTHH)}
                  columns={columsVTSHH}
                  loading={loading}
                  components={components}
                  pagination={false}
                />
              ),
            },
            {
              label: `Tồn kho tối thiểu`,
              key: "6",
              children: (
                <Table
                  size="small"
                  className="gx-table-responsive gx-table-font-size"
                  scroll={{ y: "67vh", x: 800 }}
                  bordered
                  dataSource={reDataForTable(dataTKTT)}
                  columns={columsTKTT}
                  loading={loading}
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
