import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker, Divider } from "antd";
import { map, remove, find, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { getDateNow, reDataForTable } from "src/util/Common";
import { Link } from "react-router-dom";
import {
  EditableTableRow,
  Table,
  Select,
  Toolbar,
  ModalDeleteConfirm,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import moment from "moment";
const { RangePicker } = DatePicker;

const { EditableRow, EditableCell } = EditableTableRow;

function NhapKho({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [Data, setData] = useState([]);
  const [Loai, setLoai] = useState("sanpham");
  const [ListKho, setListKho] = useState([]);
  const [Kho_Id, setKho_Id] = useState(null);
  const [ListLoaiVatTu, setListLoaiVatTu] = useState([]);
  const [LoaiVT_nhomSP, setloaiVT_nhomSP] = useState(null);
  const [ListXuong, setListXuong] = useState([]);
  const [Xuong, setXuong] = useState(null);
  const [TuNgay, setTuNgay] = useState(getDateNow(7));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [keyword, setKeyword] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(
        keyword,
        Kho_Id,
        LoaiVT_nhomSP,
        Xuong,
        TuNgay,
        DenNgay,
        page,
        Loai === "sanpham" ? true : false
      );
      getXuongSanXuat(INFO);
      getKho();
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
  };

  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thuTu=1&&isThanhPham=false`,
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
        LoaiVT_nhomSP,
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
      LoaiVT_nhomSP,
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
      LoaiVT_nhomSP,
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
  const { totalRow, pageSize } = Data;

  const dataList = reDataForTable(
    Data.datalist,
    page === 1 ? page : pageSize * (page - 1) + 2
  );

  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maDinhMucVatTu}
        </Link>
      ) : (
        <span disabled>{val.maDinhMucVatTu}</span>
      );
    return <div>{detail}</div>;
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 40,
      align: "center",
    },
    {
      title: "Loại sản phẩm",
      key: "maDinhMucVatTu",
      align: "center",
      render: (val) => renderDetail(val),

      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maDinhMucVatTu,
            value: d.maDinhMucVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maDinhMucVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "ngayYeuCau",
      key: "ngayYeuCau",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayYeuCau,
            value: d.ngayYeuCau,
          };
        })
      ),
      onFilter: (value, record) => record.ngayYeuCau.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tennguoiLap",
      key: "tennguoiLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tennguoiLap,
            value: d.tennguoiLap,
          };
        })
      ),
      onFilter: (value, record) => record.tennguoiLap.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenNguoiKy",
      key: "tenNguoiKy",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiKy,
            value: d.tenNguoiKy,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiKy.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng",
      dataIndex: "xacNhanDinhMuc",
      key: "xacNhanDinhMuc",
      align: "center",
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
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

  const handleTaoPhieu = () => {
    history.push(`${match.url}/them-moi`);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleTaoPhieu}
          disabled={permission && !permission.add}
        >
          Xuất excel
        </Button>
      </>
    );
  };

  const handleOnSelectLoai = (value) => {
    setLoai(value);
    getListData(
      keyword,
      Kho_Id,
      LoaiVT_nhomSP,
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
      LoaiVT_nhomSP,
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
      LoaiVT_nhomSP,
      Xuong,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
  };

  const handleOnSelectXuongSanXuat = (value) => {
    setXuong(value);
    getListData(
      keyword,
      Kho_Id,
      LoaiVT_nhomSP,
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
      LoaiVT_nhomSP,
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
      LoaiVT_nhomSP,
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
              data={ListKho ? ListKho : []}
              placeholder="Chọn kho"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              // onSelect={handleOnSelectUser_Id}
              value={Kho_Id}
              allowClear
              // onClear={handleClearUser_Id}
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
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          loading={loading}
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
}

export default NhapKho;
