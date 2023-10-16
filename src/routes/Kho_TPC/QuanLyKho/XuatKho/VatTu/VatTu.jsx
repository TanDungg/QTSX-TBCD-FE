import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, find, isEmpty, remove } from "lodash";
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
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function XuatKhoVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [ListXuongSanXuat, setListXuongSanXuat] = useState([]);
  const [XuongSanXuat, setXuongSanXuat] = useState(null);
  const [TuNgay, setTuNgay] = useState(getDateNow(7));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [SelectedDNCVT, setSelectedDNCVT] = useState(null);
  const [SelectedKeys, setSelectedKeys] = useState(null);
  useEffect(() => {
    if (permission && permission.view) {
      getXuongSanXuat();
      getListData(XuongSanXuat, TuNgay, DenNgay, page);
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
  const getListData = (XuongSanXuat_Id, tuNgay, denNgay, page) => {
    const param = convertObjectToUrlParams({
      XuongSanXuat_Id,
      tuNgay,
      denNgay,
      page,
    });
    dispatch(fetchStart(`lkn_PhieuXuatKhoVatTu?${param}`, "GET", null, "LIST"));
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
          setListXuongSanXuat(xuongsx);
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
      (permission &&
        permission.cof &&
        item.userKhoVatTu_Id === INFO.user_Id &&
        item.tinhTrang === "Chưa duyệt") ||
      (permission &&
        permission.cof &&
        item.userKiemTra_Id === INFO.user_Id &&
        item.tinhTrang === "Đã xác nhận bởi Kho vật tư") ||
      (permission &&
        permission.cof &&
        item.userDuyet_Id === INFO.user_Id &&
        item.tinhTrang === "Đã xác nhận bởi Kiểm tra và Kho vật tư") ? (
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
      permission && permission.edit && item.tinhTrang === "Chưa duyệt" ? (
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
      permission && permission.del && item.tinhTrang === "Chưa duyệt"
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
      item.maPhieuXuatKhoVatTu,
      "phiếu xuất kho vật tư"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_PhieuXuatKhoVatTu?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(XuongSanXuat, TuNgay, DenNgay, page);
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
    getListData(XuongSanXuat, TuNgay, DenNgay, pagination);
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
          `lkn_PhieuDeNghiCapVatTu/${SelectedDNCVT.id}?${params}`,
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
            nguoiNhanHang: res.data.userLapPhieu,
            boPhan: res.data.tenPhongBan,
            lstpdncvtct:
              res.data.lst_ChiTietPhieuDeNghiCapVatTu &&
              JSON.parse(res.data.lst_ChiTietPhieuDeNghiCapVatTu),
          };
          new Promise((resolve, reject) => {
            dispatch(
              fetchStart(
                `lkn_PhieuDeNghiCapVatTu/export-pdf`,
                "POST",
                newData,
                "",
                "",
                resolve,
                reject
              )
            );
          }).then((res) => {
            exportPDF("PhieuDeNghiCapVatTu", res.data.datapdf);
            setSelectedDNCVT(null);
            setSelectedKeys(null);
          });
        }
      })
      .catch((error) => console.error(error));
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
          {val.maPhieuXuatKhoVatTu}
        </Link>
      ) : (
        <span disabled>{val.maPhieuXuatKhoVatTu}</span>
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
      title: "Mã phiếu xuất",
      key: "maPhieuXuatKhoVatTu",
      align: "center",
      render: (val) => renderDetail(val),
    },
    {
      title: "Xưởng sản xuất",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "center",
    },
    {
      title: "Mã phiếu đề nghị cấp vật tư",
      dataIndex: "maPhieuDeNghiCapVatTu",
      key: "maPhieuDeNghiCapVatTu",
      align: "center",
    },
    {
      title: "Người lập",
      dataIndex: "userLapPhieu",
      key: "userLapPhieu",
      align: "center",
    },
    {
      title: "Ngày xuất kho",
      dataIndex: "ngayXuatKho",
      key: "ngayXuatKho",
      align: "center",
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 120,
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
          disabled={(permission && !permission.print) || SelectedDNCVT === null}
        >
          In phiếu
        </Button>
      </>
    );
  };

  const handleOnSelectXuongSanXuat = (value) => {
    setXuongSanXuat(value);
    setPage(1);
    getListData(value, TuNgay, DenNgay, 1);
  };

  const handleClearXuongSanXuat = () => {
    setXuongSanXuat(null);
    setPage(1);
    getListData(null, TuNgay, DenNgay, 1);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setPage(1);
    getListData(XuongSanXuat, dateString[0], dateString[1], 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phiếu xuất kho vật tư"
        description="Danh sách phiếu xuất kho vật tư"
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
            <h5>Xưởng sản xuất:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuongSanXuat ? ListXuongSanXuat : []}
              placeholder="Chọn xưởng sản xuất"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectXuongSanXuat}
              value={XuongSanXuat}
              onChange={(value) => setXuongSanXuat(value)}
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
          rowSelection={{
            type: "radio",
            selectedRowKeys: SelectedKeys ? [SelectedKeys] : [],
            onChange: (selectedRowKeys, selectedRows) => {
              if (
                (selectedRows.length > 0 &&
                  selectedRows[0].tinhTrang === "Chưa duyệt") ||
                selectedRows[0].tinhTrang.startsWith("Đã từ chối")
              ) {
                setSelectedDNCVT(SelectedDNCVT);
                setSelectedKeys(SelectedKeys);
              } else {
                setSelectedDNCVT(selectedRows[0]);
                setSelectedKeys(selectedRows[0].key);
              }
            },
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (e) => {
                if (SelectedKeys === record.key) {
                  setSelectedDNCVT(null);
                  setSelectedKeys(null);
                } else {
                  if (
                    record.tinhTrang === "Chưa duyệt" ||
                    record.tinhTrang.startsWith("Đã từ chối")
                  ) {
                    setSelectedDNCVT(SelectedDNCVT);
                    setSelectedKeys(SelectedKeys);
                  } else {
                    setSelectedDNCVT(record);
                    setSelectedKeys(record.key);
                  }
                }
              },
            };
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default XuatKhoVatTu;
