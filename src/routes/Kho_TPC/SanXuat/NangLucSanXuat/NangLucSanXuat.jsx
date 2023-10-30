import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker, Divider } from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { getDateNow, reDataForTable } from "src/util/Common";
import { Link } from "react-router-dom";
import {
  EditableTableRow,
  Table,
  Select,
  ModalDeleteConfirm,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import moment from "moment";
const { RangePicker } = DatePicker;

const { EditableRow, EditableCell } = EditableTableRow;

function NangLucSanXuat({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [ListNguoiLap, setListNguoiLap] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState("");

  const [user_Id, setUser_Id] = useState();
  const [NangLucSanXuat, setNangLucSanXuat] = useState([]);
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [data, setData] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getNangLucSanXuat(SanPham, "", FromDate, ToDate, page);
      getListSanPham();
      getListNguoiLap();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNangLucSanXuat = (sanPham_Id, userid, tungay, denngay, page) => {
    let param = convertObjectToUrlParams({
      sanPham_Id,
      page,
      userid,
      tungay,
      denngay,
    });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `NangLucSanXuat?${param}`,
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
          setNangLucSanXuat(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Load danh sách sản phẩm
   */
  const getListSanPham = () => {
    let param = convertObjectToUrlParams({ page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `SanPham?${param}`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Load danh sách người lập
   */
  const getListNguoiLap = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `NangLucSanXuat/list-user-lap-nlsx`,
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
          setListNguoiLap(res.data);
        } else {
          setListNguoiLap([]);
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
    getNangLucSanXuat(SanPham, user_Id, FromDate, ToDate, pagination);
  };

  //Lọc các tên giống nhau trong filter
  function removeDuplicates(arr) {
    const uniqueObjects = [];
    arr.forEach((obj) => {
      const isDuplicate = uniqueObjects.some((item) => {
        return item.text === obj.text && item.value === obj.value;
      });
      if (!isDuplicate) {
        uniqueObjects.push(obj);
      }
    });
    return uniqueObjects;
  }
  const { totalRow, pageSize } = data;
  //Lấy thông tin thiết bị
  const dataList = reDataForTable(
    NangLucSanXuat.datalist,
    page === 1 ? page : pageSize * (page - 1) + 2
  );
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "phiếu định mức vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.maNangLucSanXuat, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `NangLucSanXuat/${item.nangLucSanXuat_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res && res.status !== 409) {
          getNangLucSanXuat(SanPham, user_Id, FromDate, ToDate, page);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.nangLucSanXuat_Id}/chinh-sua`,
            state: { itemData: item, permission },
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
    const deleteItemVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  //tạo bảng
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 40,
      align: "center",
    },
    {
      title: "Mã năng lực sản xuất",
      key: "maNangLucSanXuat",
      dataIndex: "maNangLucSanXuat",
      align: "center",
      width: 170,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maNangLucSanXuat,
            value: d.maNangLucSanXuat,
          };
        })
      ),
      onFilter: (value, record) => record.maNangLucSanXuat.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.tenSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "tenThietBi",
      key: "tenThietBi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenThietBi,
            value: d.tenThietBi,
          };
        })
      ),
      onFilter: (value, record) => record.tenThietBi.includes(value),
      filterSearch: true,
    },
    {
      title: "SL nhân sự",
      dataIndex: "chiTietNLSX",
      key: "slNhanSu",
      align: "center",
      render: (val) => <span>{val && JSON.parse(val)[0].slnhanSu}</span>,
    },
    {
      title: "SL sản phẩm",
      dataIndex: "chiTietNLSX",
      key: "slSanPham",
      align: "center",
      render: (val) => <span>{val && JSON.parse(val)[0].soLuongSanPham}</span>,
    },
    {
      title: "Thời gian",
      dataIndex: "chiTietNLSX",
      key: "thoiGian",
      align: "center",
      render: (val) => <span>{val && JSON.parse(val)[0].thoiGian}</span>,
    },
    {
      title: "Năng suất",
      dataIndex: "chiTietNLSX",
      key: "nangSuat",
      align: "center",
      render: (val) => <span>{val && JSON.parse(val)[0].nangXuat}</span>,
    },
    {
      title: "Ngày lập",
      dataIndex: "ngayLap",
      key: "ngayLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayLap,
            value: d.ngayLap,
          };
        })
      ),
      onFilter: (value, record) => record.ngayLap.includes(value),
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
      title: "Ghi chú",
      dataIndex: "chiTietNLSX",
      key: "ghiChu",
      align: "center",
      render: (val) => <span>{val && JSON.parse(val)[0].ghiChu}</span>,
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
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

  const handleTaoPhieu = () => {
    history.push(`${match.url}/them-moi`);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleTaoPhieu}
          disabled={permission && !permission.add}
        >
          Tạo phiếu
        </Button>
      </>
    );
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    setPage(1);
    getNangLucSanXuat(value, user_Id, FromDate, ToDate, 1);
  };

  const handleOnSelectNguoiLap = (value) => {
    setPage(1);
    setUser_Id(value);
    getNangLucSanXuat(SanPham, value, FromDate, ToDate, 1);
  };

  const handleClearSanPham = () => {
    setSanPham(null);
    setPage(1);
    getNangLucSanXuat(null, user_Id, FromDate, ToDate, 1);
  };

  const handleClearNguoiLap = () => {
    setPage(1);
    setUser_Id(null);
    getNangLucSanXuat(SanPham, null, FromDate, ToDate, 1);
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    getNangLucSanXuat(SanPham, user_Id, dateString[0], dateString[1], 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Năng lực sản xuất"}
        description="Danh sách năng lực sản xuất"
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
            <h5>Sản phẩm</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectSanPham}
              value={SanPham}
              onChange={(value) => setSanPham(value)}
              allowClear
              onClear={handleClearSanPham}
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
            <h5>Người lập:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNguoiLap ? ListNguoiLap : []}
              placeholder="Chọn người lập"
              optionsvalue={["nguoiLap_Id", "tennguoiLap"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectNguoiLap}
              value={user_Id}
              onChange={(value) => setUser_Id(value)}
              allowClear
              onClear={handleClearNguoiLap}
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
            <h5>Ngày lập:</h5>
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
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          loading={loading}
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
}

export default NangLucSanXuat;
