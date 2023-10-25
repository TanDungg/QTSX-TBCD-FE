import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEmpty, remove } from "lodash";
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
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;
function TheoDoiDonHang({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [FromDate, setFromDate] = useState(getDateNow(7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [ListBanPhong, setListBanPhong] = useState([]);
  const [LoaiDonHang, setLoaiDonHang] = useState("");

  const [BanPhong, setBanPhong] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      getBanPhong();
      loadData(keyword, BanPhong, FromDate, ToDate, page, LoaiDonHang);
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
  const loadData = (
    keyword,
    phongBanId,
    tuNgay,
    denNgay,
    page,
    isLoaiPhieu
  ) => {
    const param = convertObjectToUrlParams({
      phongBanId,
      tuNgay,
      denNgay,
      keyword,
      page,
      donVi_Id: INFO.donVi_Id,
      isLoaiPhieu: isLoaiPhieu ? isLoaiPhieu === "true" : null,
    });
    dispatch(
      fetchStart(
        `lkn_PhieuNhanHang/theo-doi-don-hang?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };
  const getBanPhong = () => {
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
          setListBanPhong(res.data);
        } else {
          setListBanPhong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchDeNghiMuaHang = () => {
    loadData(keyword, BanPhong, FromDate, ToDate, page, LoaiDonHang);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, BanPhong, FromDate, ToDate, page, LoaiDonHang);
    }
  };

  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    loadData(keyword, BanPhong, FromDate, ToDate, pagination, LoaiDonHang);
  };

  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(
    data.datalist,
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
          {val.maPhieuYeuCau}
        </Link>
      ) : (
        <span disabled>{val.maPhieuYeuCau}</span>
      );
    return <div>{detail}</div>;
  };
  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã đơn hàng",

      key: "maPhieuYeuCau",
      align: "center",
      render: (val) => renderDetail(val),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "ngayYeuCau",
      key: "ngayYeuCau",
      align: "center",
    },
    {
      title: "Ngày xác nhận hàng về",
      dataIndex: "ngayHoanThanhDukien",
      key: "ngayHoanThanhDukien",
      align: "center",
    },
    {
      title: "Ngày hàng về",
      dataIndex: "ngayHangVe",
      key: "ngayHangVe",
      align: "center",
    },
    {
      title: "Người đặt hàng",
      dataIndex: "tenNguoiYeuCau",
      key: "tenNguoiYeuCau",
      align: "center",
    },
    {
      title: "CV Thu mua",
      dataIndex: "tenNguoiYeuCau",
      key: "tenNguoiYeuCau",
      align: "center",
    },
    {
      title: "Số lượng mua",
      dataIndex: "soLuongMua",
      key: "soLuongMua",
      align: "center",
    },
    {
      title: "Số lượng nhận",
      dataIndex: "soLuongNhan",
      key: "soLuongNhan",
      align: "center",
    },
    {
      title: "Số lượng còn thiếu",
      dataIndex: "soLuongConThieu",
      key: "soLuongConThieu",
      align: "center",
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
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

  function hanldeRemoveSelected(device) {
    const newDevice = remove(selectedDevice, (d) => {
      return d.key !== device.key;
    });
    const newKeys = remove(selectedKeys, (d) => {
      return d !== device.key;
    });
    setSelectedDevice(newDevice);
    setSelectedKeys(newKeys);
  }

  const handleOnSelectBanPhong = (val) => {
    setBanPhong(val);
    setPage(1);
    loadData(keyword, val, FromDate, ToDate, 1, LoaiDonHang);
  };
  const handleClearBanPhong = (val) => {
    setBanPhong("");
    setPage(1);
    loadData(keyword, "", FromDate, ToDate, 1, LoaiDonHang);
  };
  const handleOnSelectLoaiDonHang = (val) => {
    setLoaiDonHang(val);
    setPage(1);
    loadData(keyword, BanPhong, FromDate, ToDate, 1, val);
  };
  const handleClearLoaiDonHang = (val) => {
    setLoaiDonHang("");
    setPage(1);
    loadData(keyword, BanPhong, FromDate, ToDate, 1, "");
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    loadData(keyword, BanPhong, dateString[0], dateString[1], 1, LoaiDonHang);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Theo dõi đơn hàng"
        description="Theo dõi đơn hàng"
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Loại đơn hàng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={[
                { id: "true", name: "Phiếu đề nghị mua hàng" },
                { id: "false", name: "Phiếu đặt hàng nội bộ" },
              ]}
              placeholder="Chọn loại đơn hàng"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectLoaiDonHang}
              value={LoaiDonHang}
              allowClear
              onClear={handleClearLoaiDonHang}
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
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListBanPhong ? ListBanPhong : []}
              placeholder="Chọn xưởng sản xuất"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectBanPhong}
              value={BanPhong}
              allowClear
              onClear={handleClearBanPhong}
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
            <h5>Tìm kiếm mã đơn hàng:</h5>
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
          scroll={{ x: 1300, y: "70vh" }}
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

export default TheoDoiDonHang;
