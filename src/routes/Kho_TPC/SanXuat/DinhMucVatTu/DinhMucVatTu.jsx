import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker, Divider } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { getDateNow, reDataForTable } from "src/util/Common";
import { Link } from "react-router-dom";
import {
  EditableTableRow,
  Table,
  Select,
  Toolbar,
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

function DinhMucVatTu({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [ListUser, setListUser] = useState([]);
  const [user_Id, setUser_Id] = useState("");
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [PhongBan, setPhongBan] = useState("");
  const [DinhMucVatTu, setDinhMucVatTu] = useState([]);
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      getListUser();
      getXuong();
      getDinhMucVatTu(keyword, user_Id, FromDate, ToDate, page, PhongBan);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDinhMucVatTu = (
    keyword,
    userid,
    tungay,
    denngay,
    page,
    phongBan_Id
  ) => {
    let param = convertObjectToUrlParams({
      keyword,
      page,
      userid,
      tungay,
      denngay,
      checkQL: INFO.user_Id,
      phongBan_Id,
    });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu?${param}`,
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
          setDinhMucVatTu(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getListUser = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/list-user-lap-dinh-muc`,
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
          if (permission && permission.cof) {
            setListUser(res.data);
          } else {
            res.data.forEach((us) => {
              if (us.nguoiLap_Id === INFO.user_Id) {
                setListUser([us]);
                setUser_Id(us.nguoiLap_Id);
                getDinhMucVatTu(
                  keyword,
                  us.nguoiLap_Id,
                  FromDate,
                  ToDate,
                  page,
                  PhongBan
                );
              }
            });
          }
        } else {
          setListUser([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getXuong = () => {
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
    }).then((res) => {
      if (res && res.data) {
        const xuong = [];
        res.data.forEach((x) => {
          if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
            xuong.push(x);
          }
        });
        setListPhongBan(xuong);
      } else {
        setListPhongBan([]);
      }
    });
  };
  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setPage(1);
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getDinhMucVatTu(
        val.target.value,
        user_Id,
        FromDate,
        ToDate,
        page,
        PhongBan
      );
    }
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchPhieu = () => {
    getDinhMucVatTu(keyword, user_Id, FromDate, ToDate, page, PhongBan);
  };
  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    getDinhMucVatTu(keyword, user_Id, FromDate, ToDate, pagination, PhongBan);
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
  const { totalRow, pageSize } = DinhMucVatTu;
  //Lấy thông tin thiết bị
  const dataList = reDataForTable(DinhMucVatTu.datalist, page, pageSize);
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "phiếu định mức vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.maDinhMucVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_DinhMucVatTu?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409)
          getDinhMucVatTu(keyword, user_Id, FromDate, ToDate, page, PhongBan);
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
    // const detailItem =
    //   permission &&
    //   permission.cof &&
    //   item.nguoiKy_Id === INFO.user_Id &&
    //   item.isXacNhan === 0 ? (
    //     <Link
    //       to={{
    //         pathname: `${match.url}/${item.id}/xac-nhan`,
    //         state: { itemData: item, permission },
    //       }}
    //       title="Xác nhận"
    //     >
    //       <CheckCircleOutlined />
    //     </Link>
    //   ) : (
    //     <span disabled title="Xác nhận">
    //       <CheckCircleOutlined />
    //     </span>
    //   );
    const editItem =
      permission && permission.edit && item.isXacNhan === 0 ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
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
      permission && permission.del && item.isXacNhan === 0
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <>
          {/* {detailItem}
          <Divider type="vertical" /> */}
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </>
      </div>
    );
  };
  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maDinhMucVatTu}
        </Link>
      ) : (
        <span disabled>{val.maDinhMucVatTu}</span>
      );
    return <div>{detail}</div>;
  };
  //tạo bảng
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã phiếu định mức",
      key: "maDinhMucVatTu",
      align: "center",
      render: (val) => renderDetail(val),

      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maDinhMucVatTu,
            value: d.maDinhMucVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maDinhMucVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Xưởng",
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
      title: "Sản phẩm",
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
      title: "Ngày yêu cầu",
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
      title: "Người lập",
      dataIndex: "tennguoiLap",
      key: "tennguoiLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tennguoiLap,
            value: d.tennguoiLap,
          };
        })
      ),
      onFilter: (value, record) => record.tennguoiLap.includes(value),
      filterSearch: true,
    },
    {
      title: "Người ký",
      dataIndex: "tenNguoiKy",
      key: "tenNguoiKy",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiKy,
            value: d.tenNguoiKy,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiKy.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
    // {
    //   title: "Trạng thái",
    //   dataIndex: "xacNhanDinhMuc",
    //   key: "xacNhanDinhMuc",
    //   align: "center",
    // },
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

  // /**
  //  * Redirect to create new organization
  //  *
  //  * @memberof ChucNang
  //  */
  // const handleInPhieu = () => {
  //   history.push();
  // };

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
          // disabled={(permission && !permission.add) || selectedKeys !== null}
          disabled={permission && !permission.add}
        >
          Tạo phiếu
        </Button>
        {/* <Button
          icon={<PrinterOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleInPhieu}
          disabled={(permission && !permission.print) || selectedKeys === null}
        >
          In phiếu
        </Button> */}
      </>
    );
  };

  const handleOnSelectUser_Id = (value) => {
    if (user_Id !== value) {
      setUser_Id(value);
      setPage(1);
      getDinhMucVatTu(keyword, value, FromDate, ToDate, 1, PhongBan);
    }
  };

  const handleClearUser_Id = () => {
    setUser_Id(null);
    getDinhMucVatTu(keyword, "", FromDate, ToDate, 1, PhongBan);
  };
  const handleOnSelectPhongBan = (value) => {
    if (PhongBan !== value) {
      setPhongBan(value);
      setPage(1);
      getDinhMucVatTu(keyword, user_Id, FromDate, ToDate, 1, value);
    }
  };

  const handleClearPhongBan = () => {
    setPhongBan(null);
    getDinhMucVatTu(keyword, user_Id, FromDate, ToDate, 1, null);
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    getDinhMucVatTu(
      keyword,
      user_Id,
      dateString[0],
      dateString[1],
      1,
      PhongBan
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Định mức vật tư"}
        description="Danh sách định mức vật tư"
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
            <h5>Người lập:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListUser ? ListUser : []}
              placeholder="Chọn người lập"
              optionsvalue={["nguoiLap_Id", "tennguoiLap"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectUser_Id}
              value={user_Id}
              allowClear
              onClear={handleClearUser_Id}
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
              data={ListPhongBan ? ListPhongBan : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectPhongBan}
              value={PhongBan}
              allowClear
              onClear={handleClearPhongBan}
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
            <h5> Ngày yêu cầu:</h5>
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
                onPressEnter: onSearchPhieu,
                onSearch: onSearchPhieu,
                allowClear: true,
                placeholder: "Tìm kiếm phiếu",
              }}
            />
          </Col>
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1000, y: "55vh" }}
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
          // rowSelection={{
          //   type: "radio",
          //   selectedRowKeys: selectedKeys ? [selectedKeys] : [],
          //   onChange: (selectedRowKeys, selectedRows) => {
          //     if (
          //       selectedRows.length > 0 &&
          //       selectedRows[0].xacNhanDinhMuc === "Xác nhận"
          //     ) {
          //       setSelectedDinhMucVatTu(selectedRows[0]);
          //       setSelectedKeys(selectedRows[0].key);
          //     } else {
          //       setSelectedDinhMucVatTu(null);
          //       setSelectedKeys(null);
          //     }
          //   },
          // }}
          // onRow={(record, rowIndex) => {
          //   return {
          //     onClick: (e) => {
          //       if (
          //         selectedKeys === record.key ||
          //         record.xacNhanDinhMuc !== "Xác nhận"
          //       ) {
          //         setSelectedDinhMucVatTu(null);
          //         setSelectedKeys(null);
          //       } else {
          //         setSelectedDinhMucVatTu(record);
          //         setSelectedKeys(record.key);
          //       }
          //     },
          //   };
          // }}
        />
      </Card>
    </div>
  );
}

export default DinhMucVatTu;
