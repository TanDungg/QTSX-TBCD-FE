import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { exportExcel, getDateNow, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
  Table,
  Select,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import moment from "moment";
import { BASE_URL_APP } from "src/constants/Config";
const { RangePicker } = DatePicker;

const { EditableRow, EditableCell } = EditableTableRow;

function NhapKho({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [Data, setData] = useState([]);
  const [DataXuat, setDataXuat] = useState([]);
  const [Loai, setLoai] = useState("sanpham");
  const [ListKho, setListKho] = useState([]);
  const [Kho_Id, setKho_Id] = useState(null);
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [LoaiSanPham, setLoaiSanPham] = useState(null);
  const [ListNhomVatTu, setListNhomVatTu] = useState([]);
  const [NhomVatTu, setNhomVatTu] = useState(null);
  const [ListXuong, setListXuong] = useState([]);
  const [Xuong, setXuong] = useState(null);
  const [TuNgay, setTuNgay] = useState(getDateNow(-7));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [keyword, setKeyword] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(
        keyword,
        Kho_Id,
        Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
        Xuong,
        TuNgay,
        DenNgay,
        page,
        Loai === "sanpham" ? true : false
      );
      getXuongSanXuat(INFO);
      getKho(Loai);
      getLoaiSanPham();
      getNhomVatTu();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    keyword,
    Kho_Id,
    loaiVT_nhomSP,
    phongBan_Id,
    tungay,
    denngay,
    page,
    IsSanPham
  ) => {
    let param = convertObjectToUrlParams({
      keyword,
      Kho_Id,
      loaiVT_nhomSP,
      phongBan_Id,
      tungay,
      denngay,
      page,
      IsSanPham,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/bao-cao-nhap-kho?${param}`,
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
          setData(res.data);
        }
      })
      .catch((error) => console.error(error));
    let paramxuat = convertObjectToUrlParams({
      keyword,
      Kho_Id,
      loaiVT_nhomSP,
      phongBan_Id,
      tungay,
      denngay,
      page: -1,
      IsSanPham,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/bao-cao-nhap-kho?${paramxuat}`,
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
          setDataXuat(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const getKho = (Loai) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thuTu=${
            Loai === "sanpham" ? 101 : 1
          }&&isThanhPham=${Loai === "sanpham" ? true : false}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setListKho(res.data);
      } else {
        setListKho([]);
      }
    });
  };

  const getLoaiSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `LoaiSanPham?page=-1`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setListLoaiSanPham(res.data);
      } else {
        setListLoaiSanPham([]);
      }
    });
  };

  const getNhomVatTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `NhomVatTu?page=-1`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setListNhomVatTu(res.data);
      } else {
        setListNhomVatTu([]);
      }
    });
  };

  const getXuongSanXuat = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?page=-1&&donviid=${INFO.donVi_Id}`,
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
          const xuongsx = [];
          res.data.forEach((x) => {
            if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
              xuongsx.push(x);
            }
          });
          setListXuong(xuongsx);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onChangeKeyword = (val) => {
    setPage(1);
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(
        val.target.value,
        Kho_Id,
        Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
        Xuong,
        TuNgay,
        DenNgay,
        page,
        Loai === "sanpham" ? true : false
      );
    }
  };

  const onSearchKeyword = () => {
    getListData(
      keyword,
      Kho_Id,
      Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
      Xuong,
      TuNgay,
      DenNgay,
      page,
      Loai === "sanpham" ? true : false
    );
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(
      keyword,
      Kho_Id,
      Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
      Xuong,
      TuNgay,
      DenNgay,
      pagination,
      Loai === "sanpham" ? true : false
    );
  };

  function removeDuplicates(arr) {
    const uniqueObjects = [];
    arr.forEach((obj) => {
      const isDuplicate = uniqueObjects.some((item) => {
        return item.text === obj.text && item.value === obj.value;
      });
      if (!isDuplicate) {
        uniqueObjects.push(obj);
      }
    });
    return uniqueObjects;
  }
  // const { totalRow, pageSize } = Data;

  let dataList = reDataForTable(Data);
  const renderDetail = (val) => {
    const detail = (
      <a
        onClick={() => {
          let url = "";
          if (Loai !== "sanpham") {
            url =
              BASE_URL_APP +
              "/quan-ly-kho-tpc/nhap-kho/vat-tu/" +
              val.lkn_PhieuNhapKho_Id +
              "/chinh-sua";
          } else {
            url =
              BASE_URL_APP +
              "/quan-ly-kho-tpc/nhap-kho/thanh-pham/" +
              val.lkn_PhieuNhapKho_Id +
              "/chinh-sua";
          }
          window.open(url, "_blank");
        }}
      >
        {val.maPhieu}
      </a>
    );
    return <div>{detail}</div>;
  };
  let colValues = () => {
    const col = [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 40,
        align: "center",
        fixed: width > 1050 ? "left" : "none",
      },
      {
        title: "Mã phiếu",
        // dataIndex: "maPhieu",
        key: "maPhieu",
        align: "center",
        fixed: width > 1050 ? "left" : "none",
        render: (record) => renderDetail(record),
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: d.maPhieu,
              value: d.maPhieu,
            };
          })
        ),
        onFilter: (value, record) => record.maPhieu.includes(value),
        filterSearch: true,
      },
      {
        title: "Ngày nhập",
        dataIndex: "ngayNhap",
        key: "ngayNhap",
        align: "center",
        width: 100,
        fixed: width > 1050 ? "left" : "none",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: d.ngayNhap,
              value: d.ngayNhap,
            };
          })
        ),
        onFilter: (value, record) => record.ngayNhap.includes(value),
        filterSearch: true,
      },

      {
        title: Loai === "sanpham" ? "Mã sản phẩm" : "Mã vật tư",
        dataIndex: Loai === "sanpham" ? "maSanPham" : "maVatTu",
        key: Loai === "sanpham" ? "maSanPham" : "maVatTu",
        align: "center",
        fixed: width > 1050 ? "left" : "none",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: Loai === "sanpham" ? d.maSanPham : d.maVatTu,
              value: Loai === "sanpham" ? d.maSanPham : d.maVatTu,
            };
          })
        ),
        onFilter: (value, record) =>
          Loai === "sanpham"
            ? record.maSanPham.includes(value)
            : record.maVatTu.includes(value),
        filterSearch: true,
      },
      {
        title: Loai === "sanpham" ? "Tên sản phẩm" : "Tên vật tư",
        dataIndex: Loai === "sanpham" ? "tenSanPham" : "tenVatTu",
        key: Loai === "sanpham" ? "tenSanPham" : "tenVatTu",
        align: "center",
        fixed: width > 1050 ? "left" : "none",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: Loai === "sanpham" ? d.tenSanPham : d.tenVatTu,
              value: Loai === "sanpham" ? d.tenSanPham : d.tenVatTu,
            };
          })
        ),
        onFilter: (value, record) =>
          Loai === "sanpham"
            ? record.tenSanPham.includes(value)
            : record.tenVatTu.includes(value),
        filterSearch: true,
      },
      {
        title: "Số lượng",
        dataIndex: "soLuong",
        key: "soLuong",
        align: "center",
        width: 68,
        fixed: width > 1050 ? "left" : "none",
      },
      {
        title: "Đơn vị tính",
        dataIndex: "tenDonViTinh",
        key: "tenDonViTinh",
        align: "center",
        width: 85,
      },
      {
        title: "Kho nhập",
        dataIndex: "tenCauTrucKho",
        key: "tenCauTrucKho",
        align: "center",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: d.tenCauTrucKho,
              value: d.tenCauTrucKho,
            };
          })
        ),
        onFilter: (value, record) => record.tenCauTrucKho.includes(value),
        filterSearch: true,
      },
      {
        title: "Màu sắc",
        dataIndex: "tenMauSac",
        key: "tenMauSac",
        align: "center",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: d.tenMauSac,
              value: d.tenMauSac,
            };
          })
        ),
        onFilter: (value, record) =>
          record.tenMauSac && record.tenMauSac.includes(value),
        filterSearch: true,
      },
      {
        title: Loai === "sanpham" ? "Loại sản phẩm" : "Nhóm vật tư",
        dataIndex: Loai === "sanpham" ? "tenLoaiSanPham" : "tenNhomVatTu",
        key: Loai === "sanpham" ? "tenLoaiSanPham" : "tenNhomVatTu",
        align: "center",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: Loai === "sanpham" ? d.tenLoaiSanPham : d.tenNhomVatTu,
              value: Loai === "sanpham" ? d.tenLoaiSanPham : d.tenNhomVatTu,
            };
          })
        ),
        onFilter: (value, record) =>
          Loai === "sanpham"
            ? record.tenLoaiSanPham.includes(value)
            : record.tenNhomVatTu.includes(value),
        filterSearch: true,
      },
    ];
    if (Loai === "sanpham") {
      return [
        ...col,
        {
          title: "Ngày sản xuất",
          dataIndex: "ngaySanXuat",
          key: "ngaySanXuat",
          align: "center",
          filters: removeDuplicates(
            map(dataList, (d) => {
              return {
                text: d.ngaySanXuat,
                value: d.ngaySanXuat,
              };
            })
          ),
          onFilter: (value, record) => record.ngaySanXuat.includes(value),
          filterSearch: true,
        },
        {
          title: "Ghi chú",
          dataIndex: "ghiChu",
          key: "ghiChu",
          align: "center",
        },
      ];
    } else {
      return [
        ...col,
        {
          title: "Mã nhà cung cấp",
          dataIndex: "maNhaCungCap",
          key: "maNhaCungCap",
          align: "center",
          width: 150,
          filters: removeDuplicates(
            map(dataList, (d) => {
              return {
                text: d.maNhaCungCap,
                value: d.maNhaCungCap,
              };
            })
          ),
          onFilter: (value, record) =>
            record.maNhaCungCap && record.maNhaCungCap.includes(value),
          filterSearch: true,
        },
        {
          title: "Tên nhà cung cấp",
          dataIndex: "tenNhaCungCap",
          key: "tenNhaCungCap",
          align: "center",
          width: 150,
          filters: removeDuplicates(
            map(dataList, (d) => {
              return {
                text: d.tenNhaCungCap,
                value: d.tenNhaCungCap,
              };
            })
          ),
          onFilter: (value, record) => record.tenNhaCungCap.includes(value),
          filterSearch: true,
        },
        {
          title: "Ngày hóa đơn",
          dataIndex: "ngayHoaDon",
          key: "ngayHoaDon",
          align: "center",
          filters: removeDuplicates(
            map(dataList, (d) => {
              return {
                text: d.ngayHoaDon,
                value: d.ngayHoaDon,
              };
            })
          ),
          onFilter: (value, record) =>
            record.ngayHoaDon && record.ngayHoaDon.includes(value),
          filterSearch: true,
        },
        {
          title: "Số hóa đơn",
          dataIndex: "soHoaDon",
          key: "soHoaDon",
          align: "center",
          filters: removeDuplicates(
            map(dataList, (d) => {
              return {
                text: d.soHoaDon,
                value: d.soHoaDon,
              };
            })
          ),
          onFilter: (value, record) =>
            record.soHoaDon && record.soHoaDon.includes(value),
          filterSearch: true,
        },
        {
          title: "Ghi chú",
          dataIndex: "ghiChu",
          key: "ghiChu",
          align: "center",
        },
      ];
    }
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues(), (col) => {
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

  const handleTaoPhieu = (
    keyword,
    Kho_Id,
    loaiVT_nhomSP,
    phongBan_Id,
    tungay,
    denngay,
    page,
    IsSanPham
  ) => {
    let param = convertObjectToUrlParams({
      keyword,
      Kho_Id,
      loaiVT_nhomSP,
      phongBan_Id,
      tungay,
      denngay,
      page,
      IsSanPham,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/export-file-excel-bc-nhap-kho?${param}`,
          "POST",
          DataXuat,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel(
        `BaoCaoNhapKho${Loai === "sanpham" ? "ThanhPham" : "VatTu"}`,
        res.data.dataexcel
      );
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={() =>
            handleTaoPhieu(
              keyword,
              Kho_Id,
              Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
              Xuong,
              TuNgay,
              DenNgay,
              page,
              Loai === "sanpham" ? true : false
            )
          }
          disabled={permission && !permission.add}
        >
          Xuất excel
        </Button>
      </>
    );
  };

  const handleOnSelectLoai = (value) => {
    setLoai(value);
    getKho(value);
    setKho_Id(null);
    setLoaiSanPham(null);
    setNhomVatTu(null);
    getListData(
      keyword,
      Kho_Id,
      null,
      Xuong,
      TuNgay,
      DenNgay,
      1,
      value === "sanpham" ? true : false
    );
  };

  const handleOnSelectKho = (value) => {
    setKho_Id(value);
    getListData(
      keyword,
      value,
      Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
      Xuong,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
  };

  const handleClearKho = () => {
    setKho_Id(null);
    setPage(1);
    getListData(
      keyword,
      null,
      Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
      Xuong,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
  };

  const handleOnSelectLoaiSP = (value) => {
    setLoaiSanPham(value);
    getListData(keyword, Kho_Id, value, Xuong, TuNgay, DenNgay, 1, true);
  };

  const handleClearLoaiSP = () => {
    setLoaiSanPham(null);
    setPage(1);
    getListData(keyword, Kho_Id, null, Xuong, TuNgay, DenNgay, 1, true);
  };

  const handleOnSelectNhomVatTu = (value) => {
    setNhomVatTu(value);
    getListData(keyword, Kho_Id, value, Xuong, TuNgay, DenNgay, 1, false);
  };

  const handleClearNhomVatTu = () => {
    setNhomVatTu(null);
    setPage(1);
    getListData(keyword, Kho_Id, null, Xuong, TuNgay, DenNgay, 1, false);
  };

  const handleOnSelectXuongSanXuat = (value) => {
    setXuong(value);
    getListData(
      keyword,
      Kho_Id,
      Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
      value,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
  };

  const handleClearXuongSanXuat = () => {
    setXuong(null);
    setPage(1);
    getListData(
      keyword,
      Kho_Id,
      Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
      null,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setPage(1);
    getListData(
      keyword,
      Kho_Id,
      Loai === "sanpham" ? LoaiSanPham : NhomVatTu,
      null,
      dateString[0],
      dateString[1],
      1,
      Loai === "sanpham" ? true : false
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Báo cáo nhập kho"}
        description="Báo cáo nhập kho"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ marginBottom: 10 }}>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Sản phẩm/Vật tư:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={[
                {
                  key: "sanpham",
                  value: "Sản phẩm",
                },
                {
                  key: "vattu",
                  value: "Vật tư",
                },
              ]}
              placeholder="Chọn kho"
              optionsvalue={["key", "value"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectLoai}
              value={Loai}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Kho:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKho ? ListKho : []}
              placeholder="Chọn kho"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectKho}
              value={Kho_Id}
              allowClear
              onClear={handleClearKho}
            />
          </Col>
          {Loai === "sanpham" ? (
            <Col
              xxl={6}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <h5>Loại sản phẩm:</h5>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListLoaiSanPham ? ListLoaiSanPham : []}
                placeholder="Loại sản phẩm"
                optionsvalue={["id", "tenLoaiSanPham"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleOnSelectLoaiSP}
                value={LoaiSanPham}
                allowClear
                onClear={handleClearLoaiSP}
              />
            </Col>
          ) : (
            <Col
              xxl={6}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <h5>Nhóm vật tư:</h5>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListNhomVatTu ? ListNhomVatTu : []}
                placeholder="Nhóm vật tư"
                optionsvalue={["id", "tenNhomVatTu"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleOnSelectNhomVatTu}
                value={NhomVatTu}
                allowClear
                onClear={handleClearNhomVatTu}
              />
            </Col>
          )}
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Xưởng sản xuất:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng sản xuất"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectXuongSanXuat}
              value={Xuong}
              allowClear
              onClear={handleClearXuongSanXuat}
            />
          </Col>

          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Ngày:</h5>
            <RangePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={[
                moment(TuNgay, "DD/MM/YYYY"),
                moment(DenNgay, "DD/MM/YYYY"),
              ]}
              allowClear={false}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchKeyword,
                onSearch: onSearchKeyword,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1600, y: "45vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          loading={loading}
          pagination={
            false
            //   {
            //   onChange: handleTableChange,
            //   pageSize: pageSize,
            //   total: totalRow,
            //   showSizeChanger: false,
            //   showQuickJumper: true,
            // }
          }
        />
      </Card>
    </div>
  );
}

export default NhapKho;
