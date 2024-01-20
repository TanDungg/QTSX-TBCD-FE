import React, { useState, useEffect } from "react";
import { Card, Button, Divider, Row, Col } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import ImportCanBoNhanVien from "./ImportCanBoNhanVien";
import ModalNghiViec from "./ModalNghiViec";
import {
  ModalDeleteConfirm,
  Table,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  exportExcel,
  getLocalStorage,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

function CanBoNhanVien({ match, history, permission }) {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [ActiveModal, setActiveModal] = useState(false);
  const [donViSelect, setDonViSelect] = useState([]);
  const [donVi, setDonVi] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [NhanSuNghi, setNhanSuNghi] = useState();
  const [data, setData] = useState([]);
  const { totalRow, pageSize } = data;
  const dataList = reDataForTable(data.datalist, page, pageSize);
  useEffect(() => {
    if (permission && permission.view) {
      getDonVi();
    } else if (permission && !permission.view) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getListData = (donviId, page, keyword) => {
    let param = convertObjectToUrlParams({ donviId, page, keyword });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${param}`,
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
          const newData = res.data;
          setData(newData);
        } else {
          setData([]);
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
    getListData(donVi, pagination, keyword);
  };

  const getDonVi = () => {
    const donVi_Id = getLocalStorage("menu").donVi_Id;
    const url = `DonVi/${donVi_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "GET", null, "DETAIL", "", resolve, reject));
    })
      .then((res) => {
        if (res && res.data) {
          const Data = [{ id: res.data.id, tenDonVi: res.data.tenDonVi }];
          setDonViSelect(Data);
          setDonVi(res.data.id);
          getListData(res.data.id, page, keyword);
        } else {
          setDonViSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Chuyển tới trang thêm mới người dùng
   *
   */
  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  /**
   * ActionContent: Hành động trên bảng
   *
   * @param {*} item
   * @returns View
   */
  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}_${item.chiTiet_Id}/chinh-sua`,
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
    // const nhanSuNghiItemVal =
    //   permission && permission.edit
    //     ? {
    //         onClick: () => {
    //           setIsModalOpen(true);
    //           setNhanSuNghi(item);
    //         },
    //       }
    //     : { disabled: true };
    const deleteItemVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <React.Fragment>
        {editItem}
        {/* <Divider type="vertical" />
        <a {...nhanSuNghiItemVal} title="Nghỉ việc">
          <CloseCircleOutlined />
        </a> */}
        <Divider type="vertical" />
        <a {...deleteItemVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </React.Fragment>
    );
  };

  /**
   * deleteItem: Xoá item theo item
   *
   * @param {number} item
   * @returns
   */
  const deleteItemFunc = async (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.fullName,
      "cán bộ nhân viên"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const params = convertObjectToUrlParams({
      chiTiet_Id: item.chiTiet_Id,
      user_Id: item.id,
      tapDoan_Id: item.tapDoan_Id,
      donVi_Id: item.donVi_Id,
    });
    let url = `Account/delete-don-vi-cbnv?${params}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        getListData(donVi, page, keyword);
      })
      .catch((error) => console.error(error));
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchNguoiDung = () => {
    getListData(donVi, page, keyword);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(donVi, page, val.target.value);
    }
  };

  /**
   * Hiển thị bảng
   *
   * @returns
   */
  const header = () => {
    let renderHead = [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 50,
        align: "center",
        fixed: width > 700 && "left",
      },
      {
        title: "Mã nhân viên",
        dataIndex: "maNhanVien",
        key: "maNhanVien",
        align: "center",
        width: 100,
      },
      {
        title: "Họ tên",
        dataIndex: "fullName",
        key: "fullName",
        align: "center",
        width: 150,
        sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        align: "center",
        width: 210,
      },
      {
        title: "SĐT",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        width: 100,
        align: "center",
      },
      {
        title: "Chức vụ",
        dataIndex: "tenChucVu",
        key: "tenChucVu",
        align: "center",
        filters: removeDuplicates(
          map(data.datalist, (d) => {
            return {
              text: d.tenChucVu,
              value: d.tenChucVu,
            };
          })
        ),
        onFilter: (value, record) => record.tenChucVu.includes(value),
        filterSearch: true,
      },
      {
        title: "Bộ phận",
        dataIndex: "tenBoPhan",
        key: "tenBoPhan",
        align: "center",
        width: 130,
        filters: removeDuplicates(
          map(data.datalist, (d) => {
            return {
              text: d.tenBoPhan,
              value: d.tenBoPhan,
            };
          })
        ),
        onFilter: (value, record) => record.tenBoPhan.includes(value),
        filterSearch: true,
      },
      {
        title: "Phòng ban",
        dataIndex: "tenPhongBan",
        key: "tenPhongBan",
        align: "center",
        width: 130,
        filters: removeDuplicates(
          map(data.datalist, (d) => {
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
        title: "Đơn vị",
        dataIndex: "tenDonVi",
        key: "tenDonVi",
        align: "center",
        width: 200,
        filters: removeDuplicates(
          map(data.datalist, (d) => {
            return {
              text: d.tenDonVi,
              value: d.tenDonVi,
            };
          })
        ),
        onFilter: (value, record) => record.tenDonVi.includes(value),
        filterSearch: true,
      },
      {
        title: "Đơn vị trả lương",
        dataIndex: "tenDonViTraLuong",
        key: "tenDonViTraLuong",
        align: "center",
        width: 200,
        filters: removeDuplicates(
          map(data.datalist, (d) => {
            return {
              text: d.tenDonViTraLuong,
              value: d.tenDonViTraLuong,
            };
          })
        ),
        onFilter: (value, record) => record.tenDonViTraLuong.includes(value),
        filterSearch: true,
      },
    ];

    renderHead = [
      ...renderHead,
      {
        title: "Chức năng",
        key: "action",
        align: "center",
        width: 100,
        render: (value) => actionContent(value),
        fixed: width > 700 && "right",
      },
    ];
    return renderHead;
  };

  // const handleImport = () => {
  //   setActiveModal(true);
  // };

  //Xuất phiếu bàn giao
  const XuatExcel = () => {
    const newData = dataList.map((d) => {
      return {
        maNhanVien: d.maNhanVien,
        hoten: d.fullName,
        email: d.email,
        sdt: d.phoneNumber,
        chucVu: d.tenChucVu,
        boPhan: d.tenBoPhan,
        phongBan: d.tenPhongBan,
        donVi: d.tenDonVi,
        donViTraLuong: d.tenDonViTraLuong,
      };
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/ExportListExcel_DanhSachCBNV`,
          "POST",
          newData,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("DanhSachCBNV", res.data.dataexcel);
    });
  };

  /**
   * Hiển thị button thêm
   *
   * @returns
   */
  const addButtonRender = () => {
    return (
      <>
        {/* <Button
          icon={<UploadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleImport}
          disabled={permission && !permission.add}
        >
          Import
        </Button> */}
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={XuatExcel}
          disabled={(permission && !permission.view) || dataList.length === 0}
        >
          Xuất Excel
        </Button>
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
  const handleOnSelectCBNV = (value) => {
    getListData(value, page, keyword);
  };
  const refeshData = () => {
    getListData(donVi, page, keyword);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Cán bộ nhân viên"
        description="Danh sách Cán bộ nhân viên"
        buttons={addButtonRender()}
        classCss="gx-position-button-cbnv"
      />
      <Card className="th-card-margin-bottom">
        <Row style={{ paddingLeft: 10 }}>
          <Col
            xxl={12}
            xl={12}
            lg={16}
            md={16}
            sm={20}
            xs={24}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ width: "80px" }}>Đơn vị:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={donViSelect ? donViSelect : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "calc(100% - 80px)" }}
              onSelect={handleOnSelectCBNV}
              value={donVi}
              onChange={(value) => setDonVi(value)}
            />
          </Col>
          <Col
            xxl={8}
            xl={12}
            lg={16}
            md={16}
            sm={20}
            xs={24}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: "80px",
              }}
            >
              Tìm kiếm:
            </span>
            <div
              style={{
                flex: 1,
                alignItems: "center",
                marginTop: width < 576 ? 10 : 0,
              }}
            >
              <Toolbar
                count={1}
                search={{
                  loading,
                  value: keyword,
                  onChange: onChangeKeyword,
                  onPressEnter: onSearchNguoiDung,
                  onSearch: onSearchNguoiDung,
                  placeholder: "Tìm kiếm",
                  allowClear: true,
                }}
              />
            </div>
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1500, y: "50vh" }}
          columns={header()}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
        <ImportCanBoNhanVien
          openModal={ActiveModal}
          openModalFS={setActiveModal}
          refesh={refeshData}
        />
        <ModalNghiViec
          openModal={isModalOpen}
          openModalFS={setIsModalOpen}
          // data={NhanSuNghi}
          refesh={refeshData}
        />
      </Card>
    </div>
  );
}

export default CanBoNhanVien;
