import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Tag, Col, Row } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
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
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;

function BOMThep({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [IsDuyet, setIsDuyet] = useState("");
  const [IsThepTam, setIsThepTam] = useState("false");
  useEffect(() => {
    if (permission && permission.view) {
      getSanPham();
      getListData(SanPham, IsDuyet, IsThepTam, keyword, page);
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
    tits_qtsx_SanPham_Id,
    isDuyet,
    isThepTam,
    keyword,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_SanPham_Id,
      keyword,
      isDuyet:
        isDuyet === "true" ? true : isDuyet === "false" ? false : undefined,
      isThepTam: isThepTam === "true",
      page,
    });
    dispatch(
      fetchStart(`tits_qtsx_DinhMucVatTuThep?${param}`, "GET", null, "LIST")
    );
  };

  const getSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_SanPham?page=-1",
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

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchBOM = () => {
    getListData(SanPham, IsDuyet, IsThepTam, keyword, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(SanPham, IsDuyet, IsThepTam, val.target.value, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const confirmItem =
      permission && permission.cof && item.tinhTrang === "Chưa duyệt" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.tits_qtsx_DinhMucVatTuThep_Id}/xac-nhan`,
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
            pathname: `${match.url}/${item.tits_qtsx_DinhMucVatTuThep_Id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa định mức vật tư thép"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa định mức vật tư thép">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del && item.tinhTrang === "Chưa duyệt"
        ? { onClick: () => deleteItemFunc(item, "BOM") }
        : { disabled: true };
    return (
      <div>
        {confirmItem}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa định mức vật tư thép">
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
  const deleteItemFunc = (item, title) => {
    ModalDeleteConfirm(deleteItemAction, item, item.maDinhMucVatTuThep, title);
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_DinhMucVatTuThep/${item.tits_qtsx_DinhMucVatTuThep_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(SanPham, IsDuyet, IsThepTam, keyword, page);
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
    getListData(SanPham, IsDuyet, IsThepTam, keyword, pagination);
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
  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.tits_qtsx_DinhMucVatTuThep_Id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maDinhMucVatTuThep}
        </Link>
      ) : (
        <span disabled>{val.maDinhMucVatTuThep}</span>
      );
    return <div>{detail}</div>;
  };
  let dataList = reDataForTable(data.datalist, page, pageSize);
  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
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
      title: "Mã định mức",
      // dataIndex: "maBOM",
      key: "maDinhMucVatTuThep",
      align: "center",
      render: (val) => renderDetail(val),

      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maDinhMucVatTuThep,
            value: d.maDinhMucVatTuThep,
          };
        })
      ),
      onFilter: (value, record) => record.maDinhMucVatTuThep.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên định mức",
      dataIndex: "tenDinhMucVatTuThep",
      key: "tenDinhMucVatTuThep",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDinhMucVatTuThep,
            value: d.tenDinhMucVatTuThep,
          };
        })
      ),
      onFilter: (value, record) => record.tenDinhMucVatTuThep.includes(value),
      filterSearch: true,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
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
      title: "Lần ban hành",
      dataIndex: "lanBanHanh",
      key: "lanBanHanh",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.lanBanHanh,
            value: d.lanBanHanh,
          };
        })
      ),
      onFilter: (value, record) => record.lanBanHanh.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày ban hành",
      dataIndex: "ngayBanHanh",
      key: "ngayBanHanh",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayBanHanh,
            value: d.ngayBanHanh,
          };
        })
      ),
      onFilter: (value, record) => record.ngayBanHanh.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày áp dụng",
      dataIndex: "ngayApDung",
      key: "ngayApDung",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayApDung,
            value: d.ngayApDung,
          };
        })
      ),
      onFilter: (value, record) => record.ngayApDung.includes(value),
      filterSearch: true,
    },
    {
      title: "Người kiểm tra",
      dataIndex: "tenNguoiKiemTra",
      key: "tenNguoiKiemTra",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiKiemTra,
            value: d.tenNguoiKiemTra,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiKiemTra.includes(value),
      filterSearch: true,
    },
    {
      title: "Người phê duyệt",
      dataIndex: "tenNguoiPheDuyet",
      key: "tenNguoiPheDuyet",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiPheDuyet,
            value: d.tenNguoiPheDuyet,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiPheDuyet.includes(value),
      filterSearch: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      render: (val) => {
        return (
          <Tag
            color={
              val === "Đã duyệt"
                ? "green"
                : val === "Chưa duyệt"
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const handleOnSelectSanPham = (value) => {
    if (SanPham !== value) {
      setSanPham(value);
      setPage(1);
      getListData(value, IsDuyet, IsThepTam, keyword, 1);
    }
  };
  const handleOnSelectLoaiDinhMuc = (value) => {
    if (IsThepTam !== value) {
      setIsThepTam(value);
      setPage(1);
      getListData(SanPham, IsDuyet, value, keyword, 1);
    }
  };
  const handleOnSelectTrangThai = (value) => {
    if (IsDuyet !== value) {
      setIsDuyet(value);
      setPage(1);
      getListData(SanPham, value, IsThepTam, keyword, 1);
    }
  };
  const handleClearSanPham = (value) => {
    setSanPham(null);
    setPage(1);
    getListData("", IsDuyet, IsThepTam, keyword, 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Định mức vật tư thép"
        description="Danh sách Định mức vật tư thép"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
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
            <h5>Loại định mức:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={[
                {
                  id: "true",
                  name: "Định mức vật tư thép tấm",
                },
                {
                  id: "false",
                  name: "Định mức vật tư thép H",
                },
              ]}
              placeholder="Chọn loại định mức"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectLoaiDinhMuc}
              optionFilterProp="name"
              value={IsThepTam}
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
            <h5>Trạng thái:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={[
                {
                  id: "true",
                  name: "Đã duyệt",
                },
                {
                  id: "false",
                  name: "Chưa duyệt",
                },
              ]}
              placeholder="Chọn trạng thái"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectTrangThai}
              optionFilterProp="name"
              value={IsDuyet}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              alignItems: "center",
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
              onSelect={handleOnSelectSanPham}
              optionFilterProp="name"
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
            sm={24}
            xs={24}
            style={{
              alignItems: "center",
            }}
          >
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchBOM,
                onSearch: onSearchBOM,
                placeholder: "Nhập từ khóa",
                allowClear: true,
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
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default BOMThep;
