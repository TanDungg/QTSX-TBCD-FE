import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEmpty } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
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

function PhieuKiemKe({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [Data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [TuNgay, setTuNgay] = useState(getDateNow(-14));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [SelectedPhieu, setSelectedPhieu] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, TuNgay, DenNgay, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (keyword, ngayBatDau, ngayKetThuc, page) => {
    const param = convertObjectToUrlParams({
      keyword,
      ngayBatDau,
      ngayKetThuc,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BienBanBanGiaoXe?${param}`,
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
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onSearchPhieuKiemKe = () => {
    getListData(keyword, TuNgay, DenNgay, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, TuNgay, DenNgay, page);
    }
  };

  const actionContent = (item) => {
    const duyet =
      permission && permission.cof && item.tinhTrang === "Chưa duyệt" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/duyet`,
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
      item.nguoiLapPhieu_Id === INFO.user_Id &&
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
      item.nguoiLapPhieu_Id === INFO.user_Id &&
      item.tinhTrang === "Chưa duyệt"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {duyet}
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
      item.maBBBGX,
      "biên bản bàn giao xe"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_BienBanBanGiaoXe/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(keyword, TuNgay, DenNgay, page);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(keyword, TuNgay, DenNgay, pagination);
  };

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const handleXuatExcel = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BienBanBanGiaoXe/${SelectedPhieu[0].id}?donVi_Id=${INFO.donVi_Id}`,
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
            list_HoiDongKiemKe:
              data.list_HoiDongKiemKe && JSON.parse(data.list_HoiDongKiemKe),
            tits_qtsx_BienBanBanGiaoXeChiTiets:
              data.tits_qtsx_BienBanBanGiaoXeChiTiets &&
              JSON.parse(data.tits_qtsx_BienBanBanGiaoXeChiTiets),
          };
          new Promise((resolve, reject) => {
            dispatch(
              fetchStart(
                `tits_qtsx_BienBanBanGiaoXe/export-file-phieu-kiem-ke-thanh-pham`,
                "POST",
                newData,
                "",
                "",
                resolve,
                reject
              )
            );
          }).then((res) => {
            exportExcel("PhieuKiemKeThanhPham", res.data.dataexcel);
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
          Xuất phiếu
        </Button>
      </>
    );
  };
  const { totalRow, pageSize } = Data;

  let dataList = reDataForTable(Data.datalist, page, pageSize);

  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maBBBGX}
        </Link>
      ) : (
        <span disabled>{val.maBBBGX}</span>
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
      title: "Mã biên bản",
      key: "maBBBGX",
      align: "center",
      render: (val) => renderDetail(val),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maBBBGX,
            value: d.maBBBGX,
          };
        })
      ),
      onFilter: (value, record) => record.maBBBGX.includes(value),
      filterSearch: true,
    },
    {
      title: "Yêu cầu giao xe số",
      dataIndex: "canCuYeuCauGiaoXe",
      key: "canCuYeuCauGiaoXe",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.canCuYeuCauGiaoXe,
            value: d.canCuYeuCauGiaoXe,
          };
        })
      ),
      onFilter: (value, record) => record.canCuYeuCauGiaoXe.includes(value),
      filterSearch: true,
    },
    {
      title: "Số",
      dataIndex: "so",
      key: "so",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.so,
            value: d.so,
          };
        })
      ),
      onFilter: (value, record) => record.so.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày lập phiếu",
      dataIndex: "ngayTao",
      key: "ngayTao",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayTao,
            value: d.ngayTao,
          };
        })
      ),
      onFilter: (value, record) => record.ngayTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Người tạo phiếu",
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
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setPage(1);
    getListData(keyword, dateString[0], dateString[1], 1);
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
      if (row.length && row[0].tinhTrang === "Đã từ chối") {
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
        title="Biên bản bàn giao xe"
        description="Danh sách biên bản bàn giao xe"
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
            style={{ marginBottom: 8 }}
          >
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchPhieuKiemKe,
                onSearch: onSearchPhieuKiemKe,
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
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: false,
            selectedRowKeys: SelectedKeys,
          }}
        />
      </Card>
    </div>
  );
}

export default PhieuKiemKe;
