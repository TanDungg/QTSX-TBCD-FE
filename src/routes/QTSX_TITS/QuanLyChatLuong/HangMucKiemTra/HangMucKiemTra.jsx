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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
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

function HangMucSuDung({ match, history, permission }) {
  const { loading, data, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [DisabledModal, setDisabledModal] = useState(false);
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [LoaiSanPham, setLoaiSanPham] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [CongDoan, setCongDoan] = useState(null);
  const [DataChiTiet, setDataChiTiet] = useState([]);
  const [ChiTiet, setChiTiet] = useState([]);

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

  /**
   * Lấy dữ liệu về
   *
   */
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
    dispatch(
      fetchStart(`tits_qtsx_HangMucKiemTra?${param}`, "GET", null, "LIST")
    );
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
    const editItem =
      permission && permission.edit && item.nguoiTao_Id === INFO.user_Id ? (
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
      permission && permission.del && item.nguoiTao_Id === INFO.user_Id
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
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
    ModalDeleteConfirm(deleteItemAction, item, item.maChiTiet, "chi tiết");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_HangMucKiemTra/${item.id}`;
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
  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(data.datalist, page, pageSize);

  const XemChiTiet = (record) => {
    setChiTiet(record);
    setDataChiTiet(
      reDataForTable(record.ChiTietChild && JSON.parse(record.ChiTietChild))
    );
    setDisabledModal(true);
  };

  const renderDetail = (record) => {
    return (
      <div>
        <a onClick={() => XemChiTiet(record)}>{record && record.maChiTiet}</a>
      </div>
    );
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
      title: "Mã chi tiết",
      key: "maChiTiet",
      align: "center",
      render: (record) => renderDetail(record),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maChiTiet,
            value: d.maChiTiet,
          };
        })
      ),
      onFilter: (value, record) => record.maChiTiet.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenChiTiet,
            value: d.tenChiTiet,
          };
        })
      ),
      onFilter: (value, record) => record.tenChiTiet.includes(value),
      filterSearch: true,
    },
    {
      title: "Thông số",
      dataIndex: "thongSoKyThuat",
      key: "thongSoKyThuat",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thongSoKyThuat,
            value: d.thongSoKyThuat,
          };
        })
      ),
      onFilter: (value, record) => record.thongSoKyThuat.includes(value),
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
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
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
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 100, maxHeight: 100 }}
            />
          </span>
        ),
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "center",
      render: (value) =>
        value && (
          <a
            href={BASE_URL_API + value}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value && value.split("/")[5]}
          </a>
        ),
    },
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

  let colChiTiet = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      align: "center",
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
    },
    {
      title: "Thông số",
      dataIndex: "thongSoKyThuat",
      key: "thongSoKyThuat",
      align: "center",
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 100, maxHeight: 100 }}
            />
          </span>
        ),
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "center",
      render: (value) =>
        value && (
          <a
            href={BASE_URL_API + value}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value && value.split("/")[5]}
          </a>
        ),
    },
  ];

  const componentschitiet = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columnschitiet = map(colChiTiet, (col) => {
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
    getSanPham(value);
    getListData(value, null, null, keyword, 1);
  };

  const handleClearLoaiSanPham = (value) => {
    setLoaiSanPham(null);
    getSanPham();
    getListData(null, null, null, keyword, 1);
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    // getSanPham(value);
    getListData(value, null, null, keyword, 1);
  };

  const handleClearSanPham = (value) => {
    setSanPham(null);
    // getSanPham();
    getListData(null, null, null, keyword, 1);
  };

  const title = (
    <span>
      Hạng mục kiểm tra của{" "}
      <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
        {ChiTiet && ChiTiet.tenChiTiet}
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
              // onSelect={handleOnSelectCongDoan}
              optionFilterProp="name"
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
        <Table
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
      <AntModal
        title={title}
        className="th-card-reset-margin"
        open={DisabledModal}
        width={width > 786 ? `80%` : "100%"}
        closable={true}
        onCancel={() => setDisabledModal(false)}
        footer={null}
      >
        <Table
          bordered
          columns={columnschitiet}
          components={componentschitiet}
          scroll={{ x: 1200, y: "55vh" }}
          className="gx-table-responsive"
          dataSource={DataChiTiet}
          size="small"
          loading={loading}
          pagination={false}
        />
      </AntModal>
    </div>
  );
}

export default HangMucSuDung;
