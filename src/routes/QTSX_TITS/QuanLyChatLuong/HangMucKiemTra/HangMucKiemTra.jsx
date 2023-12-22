import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Divider,
  Row,
  Col,
  Modal as AntModal,
  Image,
  Tag,
  Checkbox,
  Empty,
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
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
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function HangMucKiemTra({ match, history, permission }) {
  const { loading, data, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [LoaiSanPham, setLoaiSanPham] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [CongDoan, setCongDoan] = useState(null);
  const [DisabledModal, setDisabledModal] = useState(false);
  const [ListHinhAnh, setListHinhAnh] = useState([]);
  const [HangMuc, setHangMuc] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [Data, setData] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getLoaiSanPham();
      getSanPham();
      getCongDoan();
      getListData(LoaiSanPham, SanPham, CongDoan, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    tits_qtsx_LoaiSanPham_Id,
    tits_qtsx_SanPham_Id,
    tits_qtsx_CongDoan_Id,
    keyword,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_LoaiSanPham_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_CongDoan_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra?${param}`,
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
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getLoaiSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_LoaiSanPham?page=-1",
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
          setListLoaiSanPham(res.data);
        } else {
          setListLoaiSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getSanPham = (tits_qtsx_LoaiSanPham_Id) => {
    let param = convertObjectToUrlParams({
      tits_qtsx_LoaiSanPham_Id,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham?${param}`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getCongDoan = () => {
    let param = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CongDoan?${param}`,
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
          setListCongDoan(res.data);
        } else {
          setListCongDoan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchPhieuNhanHang = () => {
    getListData(LoaiSanPham, SanPham, CongDoan, keyword, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(LoaiSanPham, SanPham, CongDoan, val.target.value, page);
    }
  };

  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${item.tits_qtsx_HangMucKiemTra_Id}/chi-tiet`,
            state: { itemData: item },
          }}
          title="Chi tiết"
        >
          <SearchOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <SearchOutlined />
        </span>
      );

    const editItem =
      permission && permission.edit ? (
        // &&
        // item.nguoiTao_Id === INFO.user_Id
        <Link
          to={{
            pathname: `${match.url}/${item.tits_qtsx_HangMucKiemTra_Id}/chinh-sua`,
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
      permission && permission.del && item.nguoiTao_Id === INFO.user_Id
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {detail}
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
      item.tenHangMucKiemTra,
      "hạng mục kiểm tra "
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_HangMucKiemTra/${item.tits_qtsx_HangMucKiemTra_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(LoaiSanPham, SanPham, CongDoan, keyword, page);
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
    getListData(LoaiSanPham, SanPham, CongDoan, keyword, pagination);
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
  const { totalRow, pageSize } = Data;

  const XemChiTiet = (record) => {
    setHangMuc(record);
    setListHinhAnh(record.list_HinhAnhs && JSON.parse(record.list_HinhAnhs));
    setDisabledModal(true);
  };

  const renderCheckbox = (record, value) => {
    return <Checkbox checked={record[value]} disabled={true} />;
  };

  const renderSoLuongHinhAnh = (record) => {
    return (
      <div>
        <a onClick={() => XemChiTiet(record)}>
          {record && record.soLuongHinhAnh}
        </a>
      </div>
    );
  };

  const handleInputChange = (val, item) => {
    const ThuTu = val.target.value;
    if (isEmpty(ThuTu) || Number(ThuTu) <= 0) {
      setEditingRecord([...editingRecord, item]);
      item.message = "Thứ tự phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_HangMucKiemTra_Id !== item.tits_qtsx_HangMucKiemTra_Id
      );
      setEditingRecord(newData);
    }
    const newData = { ...Data };
    newData.datalist.forEach((ct, index) => {
      if (ct.tits_qtsx_HangMucKiemTra_Id === item.tits_qtsx_HangMucKiemTra_Id) {
        ct.thuTu = ThuTu;
      }
    });
    setData(newData);
  };

  const onChangeValue = (val, record) => {
    const newData = {
      tits_qtsx_HangMucKiemTra_Id: record.tits_qtsx_HangMucKiemTra_Id,
      thuTu: val.target.value,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra/doi-thu-tu-hang-muc-kiem-tra`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status !== 409) {
        getListData(LoaiSanPham, SanPham, CongDoan, keyword, 1);
      }
    });
  };

  const renderThuTu = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.tits_qtsx_HangMucKiemTra_Id === item.tits_qtsx_HangMucKiemTra_Id) {
        isEditing = true;
        message = ct.message;
      }
    });
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.thuTu}
          onChange={(val) => handleInputChange(val, item)}
          onBlur={(val) => onChangeValue(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
          return {
            text: d.maSanPham,
            value: d.maSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.maSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
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
      title: "Tên công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
          return {
            text: d.tenCongDoan,
            value: d.tenCongDoan,
          };
        })
      ),
      onFilter: (value, record) => record.tenCongDoan.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên hạng mục kiểm tra",
      dataIndex: "tenHangMucKiemTra",
      key: "tenHangMucKiemTra",
      align: "center",
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
          return {
            text: d.tenHangMucKiemTra,
            value: d.tenHangMucKiemTra,
          };
        })
      ),
      onFilter: (value, record) => record.tenHangMucKiemTra.includes(value),
      filterSearch: true,
    },
    {
      title: "Kiểu đánh giá",
      dataIndex: "kieuDanhGia",
      key: "kieuDanhGia",
      align: "center",
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
          return {
            text: d.kieuDanhGia,
            value: d.kieuDanhGia,
          };
        })
      ),
      onFilter: (value, record) => record.kieuDanhGia.includes(value),
      filterSearch: true,
    },
    {
      title: "Sử dụng",
      key: "isSuDung",
      align: "center",
      width: 80,
      render: (record) => renderCheckbox(record, "isSuDung"),
    },
    {
      title: "File kết quả",
      key: "isFile",
      align: "center",
      width: 80,
      render: (record) => renderCheckbox(record, "isFile"),
    },
    {
      title: "Thứ tự",
      key: "thuTu",
      align: "center",
      width: 100,
      render: (record) => renderThuTu(record),
    },
    {
      title: "Hình ảnh sản phẩm",
      key: "soLuongHinhAnh",
      align: "center",
      width: 80,
      render: (record) => renderSoLuongHinhAnh(record),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
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

  const handleOnSelectLoaiSanPham = (value) => {
    setLoaiSanPham(value);
    setSanPham(null);
    setCongDoan(null);
    getSanPham(value);
    getListData(value, null, null, keyword, 1);
  };

  const handleClearLoaiSanPham = () => {
    setLoaiSanPham(null);
    setSanPham(null);
    setCongDoan(null);
    getListData(null, null, null, keyword, 1);
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    setCongDoan(null);
    getListData(LoaiSanPham, value, CongDoan, keyword, 1);
  };

  const handleClearSanPham = () => {
    setSanPham(null);
    setCongDoan(null);
    getListData(LoaiSanPham, null, CongDoan, keyword, 1);
  };

  const handleOnSelectCongDoan = (value) => {
    setCongDoan(value);
    getListData(LoaiSanPham, SanPham, value, keyword, 1);
  };

  const handleClearCongDoan = () => {
    setCongDoan(null);
    getListData(LoaiSanPham, SanPham, null, keyword, 1);
  };

  const title = (
    <span>
      Hình ảnh của hạng mục kiểm tra{" "}
      <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
        {HangMuc && HangMuc.tenHangMucKiemTra}
      </Tag>
    </span>
  );

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Hạng mục kiểm tra"
        description="Hạng mục kiểm tra"
        buttons={addButtonRender()}
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Loại sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiSanPham ? ListLoaiSanPham : []}
              placeholder="Chọn loại sản phẩm"
              optionsvalue={["id", "tenLoaiSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectLoaiSanPham}
              allowClear
              onClear={handleClearLoaiSanPham}
              value={LoaiSanPham}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectSanPham}
              allowClear
              onClear={handleClearSanPham}
              value={SanPham}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Công đoạn:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListCongDoan ? ListCongDoan : []}
              placeholder="Chọn công đoạn"
              optionsvalue={["id", "tenCongDoan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectCongDoan}
              allowClear
              onClear={handleClearCongDoan}
              value={CongDoan}
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
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1500, y: "55vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data.datalist)}
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
      <AntModal
        title={title}
        className="th-card-reset-margin"
        open={DisabledModal}
        width={width > 786 ? `50%` : "80%"}
        closable={true}
        onCancel={() => setDisabledModal(false)}
        footer={null}
      >
        {ListHinhAnh ? (
          <div
            style={{
              overflowY: "auto",
              maxHeight: "500px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {ListHinhAnh &&
              ListHinhAnh.map((hinhanh) => {
                return (
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      borderRadius: 15,
                      marginRight: 15,
                      marginBottom: 15,
                    }}
                  >
                    <Image
                      width={200}
                      height={200}
                      style={{
                        borderRadius: 15,
                        border: "1px solid #c8c8c8",
                        padding: 8,
                      }}
                      src={BASE_URL_API + hinhanh.hinhAnh}
                    />
                  </div>
                );
              })}
          </div>
        ) : (
          <div>
            <Empty style={{ height: "500px" }} />
          </div>
        )}
      </AntModal>
    </div>
  );
}

export default HangMucKiemTra;
