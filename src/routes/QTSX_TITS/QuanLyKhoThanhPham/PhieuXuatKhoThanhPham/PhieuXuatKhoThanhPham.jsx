import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker, Tag } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { isEmpty, map } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Select,
  Toolbar,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
  exportExcel,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import Helpers from "src/helpers";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function XuatKhoThanhPham({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [ListXuongSanXuat, setListXuongSanXuat] = useState([]);
  const [KhoThanhPham, setKhoThanhPham] = useState(null);
  const [keyword, setKeyword] = useState(null);
  const [TuNgay, setTuNgay] = useState(getDateNow(-7));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [SelectedPhieu, setSelectedPhieu] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getXuongSanXuat();
      getListData(keyword, KhoThanhPham, TuNgay, DenNgay, page);
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
  const getListData = (keyword, tits_qtsx_Xuong_Id, tuNgay, denNgay, page) => {
    const param = convertObjectToUrlParams({
      keyword,
      tits_qtsx_Xuong_Id,
      donVi_Id: INFO.donVi_Id,
      tuNgay,
      denNgay,
      page,
    });
    dispatch(
      fetchStart(
        `tits_qtsx_PhieuXuatKhoThanhPham?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  const getXuongSanXuat = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Xuong?page=-1`,
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
          setListXuongSanXuat(res.data);
        } else {
          setListXuongSanXuat([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const detailItem =
      permission && permission.cof && item.tinhTrang === "Chưa duyệt" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/xac-nhan`,
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
      permission &&
      permission.edit &&
      item.nguoiTao_Id === INFO.user_Id &&
      item.tinhTrang === "Chưa duyệt" ? (
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
      item.nguoiTao_Id === INFO.user_Id &&
      item.tinhTrang === "Chưa duyệt"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {detailItem}
        <Divider type="vertical" />
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
      "phiếu xuất kho thành phẩm"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_PhieuXuatKhoThanhPham/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(keyword, KhoThanhPham, TuNgay, DenNgay, page);
        }
      })
      .catch((error) => console.error(error));
  };

  const onSearchXuatKhoThanhPham = () => {
    getListData(keyword, KhoThanhPham, TuNgay, DenNgay, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, KhoThanhPham, TuNgay, DenNgay, page);
    }
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(keyword, KhoThanhPham, TuNgay, DenNgay, pagination);
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
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 120,
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
      title: "Mã phiếu xuất",
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
      title: "Kho xuất",
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
      title: "Người lập",
      dataIndex: "tenNguoiTao",
      key: "tenNguoiTao",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiTao,
            value: d.tenNguoiTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày xuất kho",
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
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
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
      render: (value) => (
        <div>
          {value && (
            <Tag
              color={
                value === "Chưa duyệt"
                  ? "orange"
                  : value === "Đã duyệt"
                  ? "blue"
                  : value === "Bị từ chối"
                  ? "red"
                  : "cyan"
              }
              style={{
                fontSize: 13,
              }}
            >
              {value}
            </Tag>
          )}
        </div>
      ),
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

  const handleXuatExcel = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuXuatKhoThanhPham/${SelectedPhieu[0].id}?donVi_Id=${INFO.donVi_Id}`,
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
          const data = res.data;
          const newData = {
            ...data,
            list_ThanhPhams:
              data.list_ThanhPhams && JSON.parse(data.list_ThanhPhams),
          };
          new Promise((resolve, reject) => {
            dispatch(
              fetchStart(
                `tits_qtsx_PhieuXuatKhoThanhPham/export-excel`,
                "POST",
                newData,
                "",
                "",
                resolve,
                reject
              )
            );
          }).then((res) => {
            exportExcel("PhieuXuatKhoThanhPham", res.data.dataexcel);
          });
        }
      })
      .catch((error) => console.error(error));
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
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleXuatExcel}
          disabled={SelectedPhieu.length === 0}
        >
          Xuất excel
        </Button>
      </>
    );
  };

  const handleOnSelectKhoThanhPham = (value) => {
    setKhoThanhPham(value);
    setPage(1);
    getListData(keyword, value, TuNgay, DenNgay, 1);
  };

  const handleClearKhoThanhPham = () => {
    setKhoThanhPham(null);
    setPage(1);
    getListData(keyword, null, TuNgay, DenNgay, 1);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setPage(1);
    getListData(keyword, KhoThanhPham, dateString[0], dateString[1], 1);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedPhieu,

    onChange: (selectedRowKeys, selectedRows) => {
      const row =
        SelectedPhieu.length > 0
          ? selectedRows.filter((d) => d.key !== SelectedPhieu[0].key)
          : [...selectedRows];

      const key =
        SelectedKeys.length > 0
          ? selectedRowKeys.filter((d) => d !== SelectedKeys[0])
          : [...selectedRowKeys];
      if (row.length && row[0].tinhTrang === "Bị từ chối") {
        Helpers.alertError("Không được chọn phiếu đã bị từ chối");
      } else {
        setSelectedPhieu(row);
        setSelectedKeys(key);
      }
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phiếu xuất kho thành phẩm"
        description="Danh sách phiếu xuất kho thành phẩm"
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
            <h5>Xưởng sản xuất</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuongSanXuat ? ListXuongSanXuat : []}
              placeholder="Chọn kho"
              optionsvalue={["id", "tenXuong"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKhoThanhPham}
              value={KhoThanhPham}
              allowClear
              onClear={handleClearKhoThanhPham}
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
          <Col xxl={6} xl={8} lg={12} md={12} sm={24} xs={24}>
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchXuatKhoThanhPham,
                onSearch: onSearchXuatKhoThanhPham,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1200, y: "55vh" }}
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
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: false,
            selectedRowKeys: SelectedKeys,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default XuatKhoThanhPham;
