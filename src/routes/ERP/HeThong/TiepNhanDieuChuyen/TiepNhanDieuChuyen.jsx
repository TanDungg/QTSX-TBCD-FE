import React, { useState, useEffect } from "react";
import { Card, Checkbox, Col, Row, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import moment from "moment";
import { Table, Toolbar, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getDateNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
const { RangePicker } = DatePicker;
function TiepNhanDieuChuyen({ history, permission }) {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [donViSelect, setDonViSelect] = useState([]);
  const [FromDate, setFromDate] = useState(getDateNow());
  const [ToDate, setToDate] = useState(getDateNow());
  const [donVi, setDonVi] = useState("");
  const dispatch = useDispatch();
  const { data, loading } = useSelector(({ common }) => common).toJS();

  useEffect(() => {
    if (permission && permission.view) {
      getDonVi();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getListData = (donviId, tungay, denngay, page, keyword) => {
    let param = convertObjectToUrlParams({
      donviId,
      tungay,
      denngay,
      page,
      keyword,
    });
    dispatch(
      fetchStart(
        `DieuChuyenNhanVien/get-tiep-nhan-dieu-chuyen-cbnv?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };
  const getDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/get-by-role?page=-1`,
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
          setDonViSelect(res.data);
          setDonVi(res.data[0].id);
          getListData(res.data[0].id, FromDate, ToDate, page, keyword);
        } else {
          setDonViSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(donVi, FromDate, ToDate, pagination, keyword);
  };
  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchNguoiDung = () => {
    getListData(donVi, FromDate, ToDate, page, keyword);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(donVi, FromDate, ToDate, page, val.target.value);
    }
  };
  const hanhdleXacNhan = (e, value) => {
    const newData = { id: value.id, xacNhan: e.target.checked };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DieuChuyenNhanVien/xac-nhan/${value.id}`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status === 204) {
          getListData(donVi, FromDate, ToDate, page, keyword);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Hiển thị checkbox trên bảng
   *
   * @param {*} value
   * @returns
   */
  const renderPermissionTmp = (value) => {
    return (
      <Row justify={"center"}>
        <Col>
          <Checkbox
            disabled={value.XacNhan}
            checked={value.XacNhan}
            onChange={(e) => hanhdleXacNhan(e, value)}
          ></Checkbox>
        </Col>
      </Row>
    );
  };

  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `/he-thong/dieu-chuyen-cbnv/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maDieuChuyen}
        </Link>
      ) : (
        <span disabled>{val.maDieuChuyen}</span>
      );
    return <div>{detail}</div>;
  };
  /**
   * Hiển thị bảng
   *
   * @returns
   */
  const header = () => {
    let renderHead = [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 50,
        align: "center",
        fixed: "left",
      },
      {
        title: "Số phiếu",
        key: "maDieuChuyen",
        align: "center",
        render: (value) => renderDetail(value),
      },
      {
        title: "Đơn vị lập điều chuyển",
        dataIndex: "donViLapDieuChuyen",
        align: "center",
        key: "donViLapDieuChuyen",
      },
      {
        title: "Đơn vị điều chuyển đến",
        dataIndex: "donViDieuChuyenDen",
        align: "center",
        key: "donViDieuChuyenDen",
      },
      {
        title: "Người lập",
        dataIndex: "nguoiLap",
        align: "center",
        key: "nguoiLap",
      },
      {
        title: "Ngày điều chuyển",
        dataIndex: "ngayDieuChuyen",
        align: "center",
        key: "ngayDieuChuyen",
      },
      {
        title: "Số lượng",
        dataIndex: "SoLuong",
        key: "SoLuong",
        align: "center",
        render: (val) => <div>{val[0].SL}</div>,
      },
      {
        title: "Trạng thái",
        dataIndex: "trangThai",
        key: "trangThai",
        align: "center",
      },
      {
        title: "Xác nhận",
        key: "XacNhan",
        align: "center",
        render: (value) => renderPermissionTmp(value),
      },
    ];
    return renderHead;
  };

  const handleOnSelectDonVi = (val) => {
    setDonVi(val);
    getListData(val, FromDate, ToDate, page, keyword);
  };
  const handleClearSearch = () => {
    getListData(null, 1);
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    getListData(donVi, dateString[0], dateString[1], page, keyword);
  };

  const { pageSize, totalRow } = data;
  const dataList = reDataForTable(data);

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Tiếp nhận điều chuyển cán bộ nhân viên"
        description="Tiếp nhận điều chuyển cán bộ nhân viên"
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ alignItems: "center" }}>
          <Col xxl={2} xl={3} lg={4} md={4} sm={5} xs={7} align={"center"}>
            Ngày:
          </Col>
          <Col xl={6} lg={8} md={8} sm={19} xs={17}>
            <RangePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={[
                moment(FromDate, "DD/MM/YYYY"),
                moment(ToDate, "DD/MM/YYYY"),
              ]}
              allowClear={false}
            />
          </Col>

          <Col xxl={2} xl={3} lg={4} md={4} sm={5} xs={7} align={"center"}>
            Đơn vị:
          </Col>
          <Col xl={6} lg={8} md={8} sm={19} xs={17}>
            <Select
              className="heading-select slt-search th-select-heading"
              data={donViSelect ? donViSelect : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectDonVi}
              value={donVi}
              showSearch
              optionFilterProp={"name"}
            />
          </Col>
          <Col xl={6} lg={24} md={24} xs={24} style={{ marginTop: 16 }}>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchNguoiDung,
                onSearch: onSearchNguoiDung,
                placeholder: "Tìm kiếm",
                allowClear: true,
                onClear: { handleClearSearch },
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1300, y: "55vh" }}
          columns={header()}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          loading={loading}
          pagination={{
            onChange: handleTableChange,
            pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
}
export default TiepNhanDieuChuyen;
