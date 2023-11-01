import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
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

function XuatKhoVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [DataXuatExcel, setDataXuatExcel] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [Kho, setKho] = useState(null);
  const [TuNgay, setTuNgay] = useState(getDateNow(-7));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [SelectedDevice, setSelectedDevice] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    if (permission && permission.view) {
      getKho();
      getListData(Kho, TuNgay, DenNgay, page);
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
  const getListData = (PhongBan_Id, tuNgay, denNgay, page) => {
    const param = convertObjectToUrlParams({
      PhongBan_Id,
      tuNgay,
      denNgay,
      page,
    });
    dispatch(fetchStart(`lkn_PhieuXuatKhoVatTu?${param}`, "GET", null, "LIST"));
    const paramXuat = convertObjectToUrlParams({
      PhongBan_Id,
      tuNgay,
      denNgay,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuXuatKhoVatTu?${paramXuat}`,
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
          setDataXuatExcel(res.data);
        } else {
          setDataXuatExcel([]);
        }
      })
      .catch((error) => console.error(error));
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
        } else {
          setListKho([]);
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
        item.userNhan_Id === INFO.user_Id &&
        item.tinhTrang === "Đã xác nhận bởi Bên duyệt và Phụ trách bộ phận") ||
      (permission &&
        permission.cof &&
        item.userDuyet_Id === INFO.user_Id &&
        item.tinhTrang === "Đã xác nhận bởi bên Phụ trách bộ phận") ||
      (permission &&
        permission.cof &&
        item.userPhuTrachBoPhan_Id === INFO.user_Id &&
        item.tinhTrang === "Chưa duyệt") ? (
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
      item.userLapPhieu_Id === INFO.user_Id &&
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
      item.userLapPhieu_Id === INFO.user_Id &&
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
          getListData(Kho, TuNgay, DenNgay, page);
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
    getListData(Kho, TuNgay, DenNgay, pagination);
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
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuXuatKhoVatTu,
            value: d.maPhieuXuatKhoVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieuXuatKhoVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Xưởng sản xuất",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenPhongBan,
            value: d.tenPhongBan,
          };
        })
      ),
      onFilter: (value, record) => record.tenPhongBan.includes(value),
      filterSearch: true,
    },
    {
      title: "Mã phiếu đề nghị cấp vật tư",
      dataIndex: "maPhieuDeNghiCapVatTu",
      key: "maPhieuDeNghiCapVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuDeNghiCapVatTu,
            value: d.maPhieuDeNghiCapVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieuDeNghiCapVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Người lập",
      dataIndex: "userLapPhieu",
      key: "userLapPhieu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.userLapPhieu,
            value: d.userLapPhieu,
          };
        })
      ),
      onFilter: (value, record) => record.userLapPhieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày xuất kho",
      dataIndex: "ngayXuatKho",
      key: "ngayXuatKho",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayXuatKho,
            value: d.ngayXuatKho,
          };
        })
      ),
      onFilter: (value, record) => record.ngayXuatKho.includes(value),
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
          `lkn_PhieuXuatKhoVatTu/${SelectedDevice[0].id}?${params}`,
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
          const listVatTu =
            res.data.chiTiet_PhieuXuatKhoVatTus &&
            JSON.parse(res.data.chiTiet_PhieuXuatKhoVatTus).map((list) => {
              const SoLuong = list.chiTiet_LuuVatTus.reduce(
                (tong, sl) => tong + sl.soLuongThucXuat,
                0
              );
              return {
                ...list,
                soLuongThucXuat: SoLuong,
              };
            });
          const newData = {
            ...res.data,
            boPhan: res.data.tenPhongBan,
            lstpxkvtct: listVatTu,
          };

          new Promise((resolve, reject) => {
            dispatch(
              fetchStart(
                `lkn_PhieuXuatKhoVatTu/export-pdf`,
                "POST",
                newData,
                "",
                "",
                resolve,
                reject
              )
            );
          }).then((res) => {
            exportPDF("PhieuXuatKhoVatTu", res.data.datapdf);
            setSelectedDevice([]);
            setSelectedKeys([]);
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const handleXuatExcel = () => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    const fetchAllData = DataXuatExcel.map((data) => {
      return new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuXuatKhoVatTu/${data.id}?${params}`,
            "GET",
            null,
            "DETAIL",
            "",
            resolve,
            reject
          )
        );
      });
    });

    Promise.all(fetchAllData)
      .then((responses) => {
        const DataXuat = responses.map((res) => {
          if (res && res.data) {
            return {
              ...res.data,
              chiTiet_PhieuXuatKhoVatTus: res.data.chiTiet_PhieuXuatKhoVatTus
                ? JSON.parse(res.data.chiTiet_PhieuXuatKhoVatTus)
                : null,
            };
          }
        });
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `lkn_PhieuXuatKhoVatTu/export-file-excel-xuat-kho`,
              "POST",
              DataXuat,
              "",
              "",
              resolve,
              reject
            )
          );
        }).then((res) => {
          exportExcel("PhieuXuatKhoVatTu", res.data.dataexcel);
        });
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
          icon={<PrinterOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handlePrint}
          disabled={
            (permission && !permission.print) ||
            SelectedKeys.length === 0 ||
            (SelectedDevice.length > 0 &&
              (SelectedDevice[0].tinhTrang === "Chưa duyệt" ||
                SelectedDevice[0].tinhTrang.startsWith("Đã từ chối")))
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

  const handleOnSelectKho = (value) => {
    setKho(value);
    setPage(1);
    getListData(value, TuNgay, DenNgay, 1);
  };

  const handleClearKho = () => {
    setKho(null);
    setPage(1);
    getListData(null, TuNgay, DenNgay, 1);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setPage(1);
    getListData(Kho, dateString[0], dateString[1], 1);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedDevice,

    onChange: (selectedRowKeys, selectedRows) => {
      const row =
        SelectedDevice.length > 0
          ? selectedRows.filter((d) => d.key !== SelectedDevice[0].key)
          : [...selectedRows];

      const key =
        SelectedKeys.length > 0
          ? selectedRowKeys.filter((d) => d !== SelectedKeys[0])
          : [...selectedRowKeys];

      setSelectedDevice(row);
      setSelectedKeys(key);
    },
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

export default XuatKhoVatTu;
