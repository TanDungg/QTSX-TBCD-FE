import React, { useState, useEffect } from "react";
import { Card, Button, Col, Row, DatePicker, Divider } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { ModalDeleteConfirm, Table, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getDateNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
const { RangePicker } = DatePicker;
function DieuChuyenNhanVien({ history, permission }) {
  const [page, setPage] = useState(1);
  const [donViSelect, setDonViSelect] = useState([]);
  const [DonVi, setDonVi] = useState("");
  const [FromDate, setFromDate] = useState(getDateNow());
  const [ToDate, setToDate] = useState(getDateNow());
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
  const getListData = (donviid, tungay, denngay, page) => {
    let param = convertObjectToUrlParams({
      donviid,
      tungay,
      denngay,
      page,
    });
    dispatch(
      fetchStart(
        `DieuChuyenNhanVien/get-dieu-chuyen-cbnv?${param}`,
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
          getListData(res.data[0].id, FromDate, ToDate, page);
        } else {
          setDonViSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Chuyển tới trang thêm mới người dùng
   *
   */
  const handleRedirect = () => {
    history.push({
      pathname: "/he-thong/dieu-chuyen-cbnv/lap-yeu-cau",
    });
  };
  /**
   * Chuyển tới trang thêm mới người dùng
   *
   */
  const handleRedirectImport = () => {
    history.push({
      pathname: "/he-thong/dieu-chuyen-cbnv/import",
    });
  };
  /**
   * ActionContent: Hành động trên bảng
   *
   * @param {*} item
   * @returns View
   */
  const actionContent = (item) => {
    const editItem =
      permission && permission.edit && !item.XacNhan ? (
        <Link
          to={{
            pathname: `/he-thong/dieu-chuyen-cbnv/${item.id}/chinh-sua`,
            state: { itemData: item, permission },
          }}
          title="Sửa"
          onClick={() => {}}
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <EditOutlined />
        </span>
      );

    const deleteItemVal =
      permission && permission.del && !item.XacNhan
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <React.Fragment>
        {editItem}
        <Divider type="vertical" />
        <a {...deleteItemVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </React.Fragment>
    );
  };

  /**
   * deleteItem: Xoá item theo item
   *
   * @param {number} item
   * @returns
   */
  const deleteItemFunc = async (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.maDieuChuyen,
      "Phiếu điều chuyển"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `DieuChuyenNhanVien/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(DonVi, FromDate, ToDate, page);
      })
      .catch((error) => console.error(error));
  };
  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `/he-thong/dieu-chuyen-cbnv/${val.id}/chi-tiet`,
            state: { itemData: val, permission, dieuChuyen: true },
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
    ];

    renderHead = [
      ...renderHead,
      {
        title: "Hành động",
        key: "action",
        align: "center",
        width: 90,
        render: (value) => actionContent(value),
        fixed: "right",
      },
    ];
    return renderHead;
  };

  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(DonVi, FromDate, ToDate, pagination);
  };

  /**
   * Hiển thị button thêm
   *
   * @returns
   */
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<UploadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirectImport}
          disabled={permission && !permission.add}
        >
          Import
        </Button>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Lập phiếu điều chuyển
        </Button>
      </>
    );
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    getListData(DonVi, dateString[0], dateString[1], page);
  };
  const handleOnSelectDonVi = (val) => {
    setDonVi(val);
    getListData(val, FromDate, ToDate, page);
  };
  const { totalRow, pageSize } = data;
  const dataList = reDataForTable(data);

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Điều chuyển cán bộ nhân viên"
        description="Điều chuyển cán bộ nhân viên"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={2}
            xl={3}
            lg={4}
            md={4}
            sm={5}
            xs={7}
            align={"center"}
            style={{ marginTop: 8 }}
          >
            Đơn vị:
          </Col>
          <Col
            xxl={8}
            xl={9}
            lg={9}
            md={9}
            sm={18}
            xs={17}
            style={{ marginBottom: 8 }}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={donViSelect ? donViSelect : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectDonVi}
              showSearch
              value={DonVi}
              optionFilterProp={"name"}
            />
          </Col>
          <Col
            xxl={2}
            xl={3}
            lg={4}
            md={4}
            sm={5}
            xs={7}
            align={"center"}
            style={{ marginTop: 8 }}
          >
            Ngày:
          </Col>
          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <RangePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={[
                moment(FromDate, "DD/MM/YYYY"),
                moment(ToDate, "DD/MM/YYYY"),
              ]}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1250, y: "55vh" }}
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
export default DieuChuyenNhanVien;
