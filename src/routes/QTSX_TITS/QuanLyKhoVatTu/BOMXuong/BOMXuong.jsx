import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Tag, Col, Row, DatePicker } from "antd";
import {
  PlusOutlined,
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
  getDateNow,
  reDataForTable,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
const { RangePicker } = DatePicker;
const { EditableRow, EditableCell } = EditableTableRow;

function BOMXuong({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [ListXuong, setListXuong] = useState([]);
  const [Xuong, setXuong] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [TuNgay, setTuNgay] = useState(getDateNow(-7));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  useEffect(() => {
    if (permission && permission.view) {
      getXuong();
      getListData(Xuong, TuNgay, DenNgay, keyword, page);
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
  const getListData = (
    tits_qtsx_Xuong_Id,
    ngayBatDau,
    ngayKetThuc,
    keyword,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Xuong_Id,
      keyword,
      ngayBatDau,
      ngayKetThuc,
      page,
    });
    dispatch(fetchStart(`tits_qtsx_BOMXuong?${param}`, "GET", null, "LIST"));
  };

  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_Xuong?page=-1",
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListXuong(res.data);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchBOM = () => {
    getListData(Xuong, TuNgay, DenNgay, keyword, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(Xuong, TuNgay, DenNgay, val.target.value, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const confirmItem =
      permission && permission.cof && item.tinhTrang === "Chưa duyệt" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.tits_qtsx_BOMXuong_Id}/xac-nhan`,
            state: { itemData: item, permission },
          }}
          title="Xác nhận"
        >
          <CheckCircleOutlined />
        </Link>
      ) : (
        <span disabled title="Xác nhận">
          <CheckCircleOutlined />
        </span>
      );
    const editItem =
      permission && permission.edit && item.tinhTrang === "Chưa duyệt" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.tits_qtsx_BOMXuong_Id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa định mức vật tư thép"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa định mức vật tư thép">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del && item.tinhTrang === "Chưa duyệt"
        ? { onClick: () => deleteItemFunc(item, "BOM") }
        : { disabled: true };
    return (
      <div>
        {confirmItem}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa định mức vật tư thép">
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
  const deleteItemFunc = (item, title) => {
    ModalDeleteConfirm(deleteItemAction, item, item.maBOMXuong, title);
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_BOMXuong/${item.tits_qtsx_BOMXuong_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(Xuong, TuNgay, DenNgay, keyword, page);
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
    getListData(Xuong, TuNgay, DenNgay, keyword, pagination);
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
          Thêm mới
        </Button>
      </>
    );
  };
  const { totalRow, pageSize } = data;
  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maBOMXuong}
        </Link>
      ) : (
        <span disabled>{val.maBOMXuong}</span>
      );
    return <div>{detail}</div>;
  };
  let dataList = reDataForTable(data.datalist, page, pageSize);
  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
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
      title: "Mã định mức",
      // dataIndex: "maBOM",
      key: "maBOMXuong",
      align: "center",
      render: (val) => renderDetail(val),

      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maBOMXuong,
            value: d.maBOMXuong,
          };
        })
      ),
      onFilter: (value, record) => record.maBOMXuong.includes(value),
      filterSearch: true,
    },
    {
      title: "Xưởng",
      dataIndex: "tenXuong",
      key: "tenXuong",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenXuong,
            value: d.tenXuong,
          };
        })
      ),
      onFilter: (value, record) => record.tenXuong.includes(value),
      filterSearch: true,
    },
    {
      title: "Người lập phiếu",
      dataIndex: "ngayApDung",
      key: "ngayApDung",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayApDung,
            value: d.ngayApDung,
          };
        })
      ),
      onFilter: (value, record) => record.ngayApDung.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày lập phiếu",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngay,
            value: d.ngay,
          };
        })
      ),
      onFilter: (value, record) => record.ngay.includes(value),
      filterSearch: true,
    },

    {
      title: "Trạng thái",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      render: (val) => {
        return (
          <Tag
            color={
              val === "Đã duyệt"
                ? "green"
                : val === "Chưa duyệt"
                ? "blue"
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const handleOnSelectXuong = (value) => {
    if (Xuong !== value) {
      setXuong(value);
      setPage(1);
      getListData(value, TuNgay, DenNgay, keyword, 1);
    }
  };
  const handleOnSelectLoaiDinhMuc = (value) => {
    if (DenNgay !== value) {
      setDenNgay(value);
      setPage(1);
      getListData(Xuong, TuNgay, value, keyword, 1);
    }
  };
  const handleOnSelectTrangThai = (value) => {
    if (TuNgay !== value) {
      setTuNgay(value);
      setPage(1);
      getListData(Xuong, value, DenNgay, keyword, 1);
    }
  };
  const handleClearXuong = (value) => {
    setXuong(null);
    setPage(1);
    getListData("", TuNgay, DenNgay, keyword, 1);
  };
  const handleChangeNgay = (dateString) => {
    if (TuNgay !== dateString[0] && DenNgay !== dateString[1]) {
      setTuNgay(dateString[0]);
      setDenNgay(dateString[1]);
      setPage(1);
      getListData(Xuong, dateString[0], dateString[1], keyword, 1);
    }
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Định mức BOM xưởng"
        description="Danh sách Định mức BOM xưởng"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              alignItems: "center",
            }}
          >
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn Xưởng"
              optionsvalue={["id", "tenXuong"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectXuong}
              optionFilterProp="name"
              allowClear
              onClear={handleClearXuong}
              value={Xuong}
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
            style={{
              alignItems: "center",
            }}
          >
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchBOM,
                onSearch: onSearchBOM,
                placeholder: "Nhập từ khóa",
                allowClear: true,
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
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

export default BOMXuong;
