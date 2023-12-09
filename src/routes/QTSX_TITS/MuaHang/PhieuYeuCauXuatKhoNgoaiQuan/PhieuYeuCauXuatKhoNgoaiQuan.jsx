import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
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
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function PhieuYeuCauXuatKhoNgoaiQuan({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());

  useEffect(() => {
    if (permission && permission.view) {
      loadData(keyword, FromDate, ToDate, page);
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
  const loadData = (keyword, NgayBatDau, NgayKetThuc, page) => {
    const param = convertObjectToUrlParams({
      keyword,
      NgayBatDau,
      NgayKetThuc,
      page,
    });
    dispatch(
      fetchStart(
        `tits_qtsx_PhieuYeuCauXuatKhoNgoaiQuan?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchPhieuNhanHang = () => {
    loadData(keyword, FromDate, ToDate, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, FromDate, ToDate, page);
    }
  };

  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItem =
      permission &&
      permission.edit &&
      item.nguoiYeuCau_Id === INFO.user_Id &&
      moment(item.ngayYeuCau, "DD/MM/YYYY") >=
        moment(getDateNow(-1), "DD/MM/YYYY") ? (
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
      item.nguoiYeuCau_Id === INFO.user_Id &&
      moment(item.ngayYeuCau, "DD/MM/YYYY") >=
        moment(getDateNow(-1), "DD/MM/YYYY")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
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
      item.maPhieu,
      "phiếu xuất kho ngoại quan"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_PhieuYeuCauXuatKhoNgoaiQuan?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, FromDate, ToDate, page);
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
    loadData(keyword, FromDate, ToDate, pagination);
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
          Tạo phiếu
        </Button>
      </>
    );
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
        >
          {val.maPhieu}
        </Link>
      ) : (
        <span disabled>{val.maPhieu}</span>
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
      title: "Mã phiếu yêu cầu",
      key: "maPhieu",
      align: "center",
      render: (val) => renderDetail(val),
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
      title: "Đơn vị yêu cầu",
      dataIndex: "donViYeuCau",
      key: "donViYeuCau",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.donViYeuCau,
            value: d.donViYeuCau,
          };
        })
      ),
      onFilter: (value, record) => record.donViYeuCau.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị nhận yêu cầu",
      dataIndex: "donViNhanYeuCau",
      key: "donViNhanYeuCau",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.donViNhanYeuCau,
            value: d.donViNhanYeuCau,
          };
        })
      ),
      onFilter: (value, record) => record.donViNhanYeuCau.includes(value),
      filterSearch: true,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "nguoiYeuCau",
      key: "nguoiYeuCau",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.nguoiYeuCau,
            value: d.nguoiYeuCau,
          };
        })
      ),
      onFilter: (value, record) => record.nguoiYeuCau.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày tạo phiếu",
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

  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    loadData(keyword, dateString[0], dateString[1], 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phiếu yêu cầu xuất kho ngoại quan"
        description="Phiếu yêu cầu xuất kho ngoại quan"
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
                onPressEnter: onSearchPhieuNhanHang,
                onSearch: onSearchPhieuNhanHang,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom">
        <Table
          bordered
          scroll={{ x: 700, y: "55vh" }}
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

export default PhieuYeuCauXuatKhoNgoaiQuan;
