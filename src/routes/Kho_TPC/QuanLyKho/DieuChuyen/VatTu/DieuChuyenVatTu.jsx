import React, { useEffect, useState } from "react";
import { Card, Divider, Row, Col, DatePicker, Tag } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEmpty } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import {
  DUYET_DIEUCHUYENVATTU_KHO_TPC,
  XACNHAN_DIEUCHUYENVATTU_KHO_TPC,
} from "src/constants/Config";
import { setHistory } from "src/appRedux/actions";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;
function DieuChuyenVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const { option, path } = useSelector(({ History }) => History);

  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    accessRole: JSON.parse(getTokenInfo().accessRole),
  };
  const [ListKho, setListKho] = useState([]);

  const [Kho, setKho] = useState(null);
  const [KhoDen, setKhoDen] = useState(null);

  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getKho();
      if (path === match.url) {
        setFromDate(option.FromDate);
        setToDate(option.ToDate);
        setKho(option.Kho);
        setKhoDen(option.KhoDen);
        setPage(option.page);
        setKeyword(option.keyword);
        getListData(
          option.keyword,
          option.Kho,
          option.FromDate,
          option.ToDate,
          option.page,
          option.KhoDen
        );
      }
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy dữ liệu về
   *
   */
  const getListData = (keyword, khoDi_Id, tuNgay, denNgay, page, khoDen_Id) => {
    const param = convertObjectToUrlParams({
      khoDi_Id,
      khoDen_Id,
      tuNgay,
      denNgay,
      keyword,
      page,
    });
    dispatch(
      fetchStart(
        `lkn_PhieuDieuChuyenVatTuController?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&isThanhPham=false`,
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
          setListKho(res.data);
        } else {
          setListKho([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchDeNghiMuaHang = () => {
    getListData(keyword, Kho, FromDate, ToDate, page, KhoDen);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, Kho, FromDate, ToDate, page, KhoDen);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    let check = false;
    if (
      !item.isDuyet &&
      INFO.accessRole.includes(DUYET_DIEUCHUYENVATTU_KHO_TPC)
    ) {
      check = true;
    } else if (
      item.isDuyet &&
      !item.isXacNhan &&
      item.lkn_PhieuDeNghiCapVatTu_Id &&
      INFO.accessRole.includes(XACNHAN_DIEUCHUYENVATTU_KHO_TPC)
    ) {
      check = true;
    }

    const confirmItem =
      permission && permission.cof && check ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/xac-nhan`,
            state: { itemData: item },
          }}
          title="Xác nhận"
          onClick={() => {
            dispatch(
              setHistory({
                path: match.path,
                option: {
                  Kho,
                  FromDate,
                  ToDate,
                  page,
                  keyword,
                  KhoDen,
                },
              })
            );
          }}
        >
          <CheckCircleOutlined />
        </Link>
      ) : (
        <span disabled title="Xác nhận">
          <CheckCircleOutlined />
        </span>
      );
    const editItem =
      permission && permission.edit && check ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission &&
      permission.del &&
      !item.isDuyet &&
      INFO.accessRole.includes(DUYET_DIEUCHUYENVATTU_KHO_TPC)
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {confirmItem}
        <Divider type="vertical" />
        {/* {editItem}
        <Divider type="vertical" /> */}
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  /**
   * deleteItemFunc: Xoá item theo item
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.maPhieuDieuChuyen,
      "phiếu điều chuyển"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_PhieuDieuChuyenVatTuController?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(keyword, Kho, FromDate, ToDate, page, KhoDen);
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
    getListData(keyword, Kho, FromDate, ToDate, pagination, KhoDen);
  };

  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(data.datalist, page, pageSize);

  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
          onClick={() => {
            dispatch(
              setHistory({
                path: match.path,
                option: {
                  Kho,
                  FromDate,
                  ToDate,
                  page,
                  keyword,
                  KhoDen,
                },
              })
            );
          }}
        >
          {val.maPhieuDieuChuyenVatTu}
        </Link>
      ) : (
        <span disabled>{val.maPhieuDieuChuyenVatTu}</span>
      );
    return <div>{detail}</div>;
  };
  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã phiếu điều chuyển",
      key: "maPhieuDieuChuyenVatTu",
      align: "center",
      render: (val) => renderDetail(val),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuDieuChuyenVatTu,
            value: d.maPhieuDieuChuyenVatTu,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maPhieuDieuChuyenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Kho điều chuyển",
      dataIndex: "tenKhoDi",
      key: "tenKhoDi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhoDi,
            value: d.tenKhoDi,
          };
        })
      ),
      onFilter: (value, record) => record.tenKhoDi.includes(value),
      filterSearch: true,
    },
    {
      title: "Kho nhận",
      dataIndex: "tenKhoDen",
      key: "tenKhoDen",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhoDen,
            value: d.tenKhoDen,
          };
        })
      ),
      onFilter: (value, record) => record.tenKhoDen.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày yêu cầu",
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
      title: "Người lập",
      dataIndex: "tenNguoiLap",
      key: "tenNguoiLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiLap,
            value: d.tenNguoiLap,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiLap.includes(value),
      filterSearch: true,
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 140,
      render: (val) => {
        return (
          <Tag
            color={
              val === "Xưởng đã xác nhận"
                ? "green"
                : val === "Chưa duyệt"
                ? "blue"
                : val === "Kho duyệt"
                ? "orange  "
                : "red"
            }
          >
            {" "}
            {val}
          </Tag>
        );
      },
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tinhTrang,
            value: d.tinhTrang,
          };
        })
      ),
      onFilter: (value, record) => record.tinhTrang.includes(value),
      filterSearch: true,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = map(renderHead, (col) => {
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

  const handleOnSelectKho = (val) => {
    if (Kho !== val) {
      setKho(val);
      setPage(1);
      getListData(keyword, val, FromDate, ToDate, 1, KhoDen);
    }
  };

  const handleClearKho = (val) => {
    setKho("");
    setPage(1);
    getListData(keyword, "", FromDate, ToDate, 1, KhoDen);
  };
  const handleOnSelectKhoDen = (val) => {
    if (KhoDen !== val) {
      setKhoDen(val);
      setPage(1);
      getListData(keyword, Kho, FromDate, ToDate, 1, val);
    }
  };

  const handleClearKhoDen = (val) => {
    setKhoDen("");
    setPage(1);
    getListData(keyword, Kho, FromDate, ToDate, 1, "");
  };
  const handleChangeNgay = (dateString) => {
    if (FromDate !== dateString[0] && ToDate !== dateString[1]) {
      setFromDate(dateString[0]);
      setToDate(dateString[1]);
      setPage(1);
      getListData(keyword, Kho, dateString[0], dateString[1], 1, KhoDen);
    }
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Điều chuyển vật tư"
        description="Điều chuyển vật tư"
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ marginBottom: 8 }}>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Kho đi:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKho ? ListKho : []}
              placeholder="Chọn Kho đi"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKho}
              value={Kho}
              onChange={(value) => setKho(value)}
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
            <h5>Kho đến:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKho ? ListKho : []}
              placeholder="Chọn Kho đến"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKhoDen}
              value={KhoDen}
              allowClear
              onClear={handleClearKhoDen}
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
                moment(FromDate, "DD/MM/YYYY"),
                moment(ToDate, "DD/MM/YYYY"),
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
                onPressEnter: onSearchDeNghiMuaHang,
                onSearch: onSearchDeNghiMuaHang,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
        <Table
          bordered
          scroll={{ x: 700, y: "65vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={(record) => {
            return record.isParent ? "editable-row" : "editable-row";
          }}
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default DieuChuyenVatTu;
