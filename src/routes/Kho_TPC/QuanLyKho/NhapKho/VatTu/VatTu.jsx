import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker, Tag } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  DownloadOutlined,
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
  exportPDF,
  removeDuplicates,
  exportExcel,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function VatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [Kho, setKho] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      getKho();
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
  const loadData = (keyword, cauTrucKho_Id, tuNgay, denNgay, page) => {
    const param = convertObjectToUrlParams({
      cauTrucKho_Id,
      tuNgay,
      denNgay,
      keyword,
      page,
      donVi_Id: INFO.donVi_Id,
    });
    dispatch(fetchStart(`lkn_PhieuNhapKhoVatTu?${param}`, "GET", null, "LIST"));
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
    })
      .then((res) => {
        if (res && res.data) {
          setListKho(res.data);
          setKho(res.data[0].id);
          loadData(keyword, res.data[0].id, FromDate, ToDate, page);
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
    loadData(keyword, Kho, FromDate, ToDate, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, Kho, FromDate, ToDate, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const xacNhanItem =
      permission &&
      permission.cof &&
      !item.isDuyet &&
      item.tinhTrang === "Chưa xử lý" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/xac-nhan`,
            state: { itemData: item },
          }}
          title="Duyệt phiếu"
        >
          <CheckCircleOutlined />
        </Link>
      ) : (
        <span disabled title="Duyệt phiếu">
          <CheckCircleOutlined />
        </span>
      );
    const editItem =
      permission &&
      permission.edit &&
      item.isDuyet &&
      item.tinhTrang === "Phiếu đã được duyệt" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa phiếu"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa phiếu">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission &&
      permission.del &&
      !item.isDuyet &&
      item.tinhTrang === "Chưa xử lý"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {xacNhanItem}
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
      item.maPhieuNhapKhoVatTu,
      "phiếu nhập kho"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_PhieuNhapKhoVatTu/delete-phieu-nhap-kho-vat-tu?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, Kho, FromDate, ToDate, page);
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
    loadData(keyword, Kho, FromDate, ToDate, pagination);
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

  const handlePrint = () => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoVatTu/${selectedDevice[0].id}?${params}`,
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
          const newData = {
            ...res.data,
            ngayNhan: res.data.ngayNhan.split(" ")[0],
            lstpnkvtct:
              res.data.chiTietVatTu && JSON.parse(res.data.chiTietVatTu),
          };
          new Promise((resolve, reject) => {
            dispatch(
              fetchStart(
                `lkn_PhieuNhapKhoVatTu/export-pdf-nhap-kho`,
                "POST",
                newData,
                "",
                "",
                resolve,
                reject
              )
            );
          }).then((res) => {
            exportPDF("PhieuNhapKhoVatTu", res.data.datapdf);
            setSelectedDevice([]);
            setSelectedKeys([]);
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const handleXuatExcel = () => {
    const params = convertObjectToUrlParams({
      keyword: keyword,
      cauTrucKho_Id: Kho,
      tuNgay: FromDate,
      denNgay: ToDate,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoVatTu/export-file-excel-nhap-kho?${params}`,
          "POST",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("PhieuNhapKhoVatTu", res.data.dataexcel);
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
        <Button
          icon={<PrinterOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handlePrint}
          disabled={
            (permission && !permission.print) || selectedDevice.length === 0
          }
        >
          In phiếu
        </Button>
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleXuatExcel}
          disabled={data.length === 0}
        >
          Xuất excel
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
          {val.maPhieuNhapKhoVatTu}
        </Link>
      ) : (
        <span disabled>{val.maPhieuNhapKhoVatTu}</span>
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
      title: "Mã phiếu nhập",
      key: "maPhieuNhapKhoVatTu",
      align: "center",
      render: (val) => renderDetail(val),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuNhapKhoVatTu,
            value: d.maPhieuNhapKhoVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieuNhapKhoVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Kho",
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
      title: "Người nhập",
      dataIndex: "tenNguoiYeuCau",
      key: "tenNguoiYeuCau",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiYeuCau,
            value: d.tenNguoiYeuCau,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiYeuCau.includes(value),
      filterSearch: true,
    },
    {
      title: "Người duyệt",
      dataIndex: "tenNguoiDuyet",
      key: "tenNguoiDuyet",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiDuyet,
            value: d.tenNguoiDuyet,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiDuyet.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày nhập",
      dataIndex: "ngayNhan",
      key: "ngayNhan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayNhan,
            value: d.ngayNhan,
          };
        })
      ),
      onFilter: (value, record) => record.ngayNhan.includes(value),
      filterSearch: true,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "tenNhaCungCap",
      key: "tenNhaCungCap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNhaCungCap,
            value: d.tenNhaCungCap,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenNhaCungCap && record.tenNhaCungCap.includes(value),
      filterSearch: true,
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      render: (val) => {
        return (
          <Tag
            color={
              val === "Phiếu đã được duyệt"
                ? "green"
                : val === "Chưa xử lý"
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

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedDevice,

    onChange: (selectedRowKeys, selectedRows) => {
      if (
        (selectedRows.length > 0 && selectedRows[0].isDuyet) ||
        selectedRows.length === 0
      ) {
        const row =
          selectedDevice.length > 0
            ? selectedRows.filter(
                (d) => d.key !== selectedDevice[0].key && d.isDuyet === true
              )
            : [...selectedRows];
        const key = row.map((r) => {
          return r.key;
        });
        setSelectedDevice(row);
        setSelectedKeys(key);
      }
    },
  };

  const handleOnSelectKho = (val) => {
    setKho(val);
    setPage(1);
    loadData(keyword, val, FromDate, ToDate, 1);
  };
  const handleClearKho = (val) => {
    setKho("");
    setPage(1);
    loadData(keyword, "", FromDate, ToDate, 1);
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    loadData(keyword, Kho, dateString[0], dateString[1], 1);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Nhập kho vật tư"
        description="Nhập kho vật tư"
        buttons={addButtonRender()}
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <h5>Kho:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKho ? ListKho : []}
              placeholder="Chọn Kho"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKho}
              value={Kho}
              onChange={(value) => setKho(value)}
              // allowClear
              // onClear={handleClearKho}
            />
          </Col>

          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
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
          <Col xl={6} lg={24} md={24} xs={24}>
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
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: false,
            selectedRowKeys: selectedKeys,
          }}
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

export default VatTu;
