import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
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
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;
function PhieuNhanHang({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [FromDate, setFromDate] = useState(getDateNow(7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [ListUserYeuCau, setListUserYeuCau] = useState([]);
  const [UserYeuCau, setUserYeuCau] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      getUserYeuCau();
      loadData(keyword, UserYeuCau, FromDate, ToDate, page);
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
  const loadData = (keyword, useryeucau_Id, tuNgay, denNgay, page) => {
    const param = convertObjectToUrlParams({
      useryeucau_Id,
      donVi_Id: INFO.donVi_Id,
      tuNgay,
      denNgay,
      keyword,
      page,
    });
    dispatch(fetchStart(`lkn_PhieuNhanHang?${param}`, "GET", null, "LIST"));
  };
  const getUserYeuCau = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhanHang/list-user-lap-phieu-nhan-hang`,
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
          setListUserYeuCau(res.data);
        } else {
          setListUserYeuCau([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchDeNghiMuaHang = () => {
    loadData(keyword, UserYeuCau, FromDate, ToDate, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, UserYeuCau, FromDate, ToDate, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    console.log(item);
    // const detailItem =
    //   permission && permission.cof ? (
    //     <Link
    //       to={{
    //         pathname: `${match.url}/${item.id}/xac-nhan`,
    //         state: { itemData: item, permission },
    //       }}
    //       title="Xác nhận"
    //     >
    //       <EyeOutlined />
    //     </Link>
    //   ) : (
    //     <span disabled title="Xác nhận">
    //       <EyeInvisibleOutlined />
    //     </span>
    //   );
    const editItem =
      permission &&
      permission.edit &&
      moment(item.ngayTaoPhieu, "DD/MM/YYYY") >=
        moment(getDateNow(1, true), "DD/MM/YYYY") ? (
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
      moment(item.ngayTaoPhieu, "DD/MM/YYYY") >=
        moment(getDateNow(1, true), "DD/MM/YYYY")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {/* {detailItem}
        <Divider type="vertical" /> */}
        {editItem}
        <Divider type="vertical" />
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
      item.maPhieuNhanHang,
      "phiếu nhận hàng"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_PhieuNhanHang?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, UserYeuCau, FromDate, ToDate, page);
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
    loadData(keyword, UserYeuCau, FromDate, ToDate, pagination);
  };

  /**
   * Chuyển tới trang thêm mới chức năng
   *
   * @memberof ChucNang
   */
  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Tạo phiếu nhận
        </Button>
      </>
    );
  };
  const { totalRow, totalPage, pageSize } = data;

  let dataList = reDataForTable(
    data.datalist
    // page === 1 ? page : pageSize * (page - 1) + 2
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
          {val.maPhieuNhanHang}
        </Link>
      ) : (
        <span disabled>{val.maPhieuNhanHang}</span>
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
      title: "Mã phiếu nhận hàng",
      key: "maPhieuNhanHang",
      align: "center",
      render: (val) => renderDetail(val),
    },
    {
      title: "Mã phiếu mua hàng",
      dataIndex: "maPhieuYeuCau",
      key: "maPhieuYeuCau",
      align: "center",
    },

    {
      title: "Ngày hàng về",
      dataIndex: "ngayHangVe",
      key: "ngayHangVe",
      align: "center",
    },
    {
      title: "CV Thu mua",
      dataIndex: "tenNguoiYeuCau",
      key: "tenNguoiYeuCau",
      align: "center",
    },
    {
      title: "Người yêu cầu",
      dataIndex: "tenNguoiYeuCau",
      key: "tenNguoiYeuCau",
      align: "center",
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "center",
      render: (val) => (
        <a href={BASE_URL_API + val} target="_blank">
          {val && val.split("/")[5]}
        </a>
      ),
    },

    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContent(value),
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

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedDevice,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedDevice = [...selectedRows];
      const newSelectedKey = [...selectedRowKeys];
      setSelectedDevice(newSelectedDevice);
      setSelectedKeys(newSelectedKey);
    },
  };
  const handleOnSelectUserYeuCau = (val) => {
    setUserYeuCau(val);
    setPage(1);
    loadData(keyword, val, FromDate, ToDate, 1);
  };
  const handleClearUserYeuCau = (val) => {
    setUserYeuCau("");
    setPage(1);
    loadData(keyword, "", FromDate, ToDate, 1);
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    loadData(keyword, UserYeuCau, dateString[0], dateString[1], 1);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phiếu nhận hàng"
        description="Phiếu nhận hàng"
        buttons={addButtonRender()}
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
            <h5>Người yêu cầu:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListUserYeuCau ? ListUserYeuCau : []}
              placeholder="Chọn người yêu cầu"
              optionsvalue={["nguoiLap_Id", "tennguoiLap"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectUserYeuCau}
              value={UserYeuCau}
              allowClear
              onClear={handleClearUserYeuCau}
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
          scroll={{ x: 700, y: "70vh" }}
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

export default PhieuNhanHang;
