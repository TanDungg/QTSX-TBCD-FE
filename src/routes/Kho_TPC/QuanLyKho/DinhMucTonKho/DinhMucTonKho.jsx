import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col } from "antd";
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
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;
function DinhMucTonKho({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [Kho_Id, setKho_Id] = useState();
  const [ListLoaiDinhMucTonKho, setListLoaiDinhMucTonKho] = useState([]);
  const [ListKho, setListKho] = useState([]);

  const [LoaiDinhMucTonKho, setLoaiDinhMucTonKho] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      getLoaiDinhMucTonKho();
      getKho();
      loadData(keyword, LoaiDinhMucTonKho, Kho_Id, page);
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
  const loadData = (keyword, loaiDinhMucTonKho_Id, kho_Id, page) => {
    const param = convertObjectToUrlParams({
      loaiDinhMucTonKho_Id,
      kho_Id,
      keyword,
      page,
    });
    dispatch(fetchStart(`lkn_DinhMucTonKho?${param}`, "GET", null, "LIST"));
  };
  const getLoaiDinhMucTonKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `LoaiDinhMucTonKho?page=-1`,
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
          setListLoaiDinhMucTonKho(res.data);
        } else {
          setListLoaiDinhMucTonKho([]);
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
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchDeNghiMuaHang = () => {
    loadData(keyword, LoaiDinhMucTonKho, Kho_Id, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, LoaiDinhMucTonKho, Kho_Id, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    // const detailItem =
    //   permission && permission.cof ? (
    //     <Link
    //       to={{
    //         pathname: `${match.url}/${item.id}/xac-nhan`,
    //         state: { itemData: item, permission },
    //       }}
    //       title="Xác nhận"
    //     >
    //       <EyeOutlined />
    //     </Link>
    //   ) : (
    //     <span disabled title="Xác nhận">
    //       <EyeInvisibleOutlined />
    //     </span>
    //   );
    const editItem =
      permission && permission.edit ? (
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
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {/* {detailItem}
        <Divider type="vertical" /> */}
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
    ModalDeleteConfirm(deleteItemAction, item, "", "định mức tồn kho");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_dinhmuctonkho/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, LoaiDinhMucTonKho, Kho_Id, page);
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
    loadData(keyword, LoaiDinhMucTonKho, Kho_Id, pagination);
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

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã vật tư",
      key: "maVatTu",
      dataIndex: "maVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maVatTu,
            value: d.maVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên vật tư",
      key: "tenVatTu",
      dataIndex: "tenVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenVatTu,
            value: d.tenVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Loại định mức tồn kho",
      dataIndex: "tenLoaiDinhMucTonKho",
      key: "tenLoaiDinhMucTonKho",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLoaiDinhMucTonKho,
            value: d.tenLoaiDinhMucTonKho,
          };
        })
      ),
      onFilter: (value, record) => record.tenLoaiDinhMucTonKho.includes(value),
      filterSearch: true,
    },
    {
      title: "SL tồn kho tối thiếu",
      dataIndex: "sLTonKhoToiThieu",
      key: "sLTonKhoToiThieu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.sLTonKhoToiThieu,
            value: d.sLTonKhoToiThieu,
          };
        })
      ),
      onFilter: (value, record) => record.sLTonKhoToiThieu.includes(value),
      filterSearch: true,
    },
    {
      title: "SL tồn kho tối đa",
      dataIndex: "sLTonKhoToiDa",
      key: "sLTonKhoToiDa",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.sLTonKhoToiDa,
            value: d.sLTonKhoToiDa,
          };
        })
      ),
      onFilter: (value, record) => record.sLTonKhoToiDa.includes(value),
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

  const handleOnSelectLoaiDinhMucTonKho = (val) => {
    setLoaiDinhMucTonKho(val);
    setPage(1);
    loadData(keyword, val, Kho_Id, 1);
  };
  const handleClearLoaiDinhMucTonKho = (val) => {
    setLoaiDinhMucTonKho("");
    setPage(1);
    loadData(keyword, "", Kho_Id, 1);
  };
  const handleOnSelectKho = (val) => {
    setKho_Id(val);
    setPage(1);
    loadData(keyword, LoaiDinhMucTonKho, val, 1);
  };
  const handleClearKho = (val) => {
    setKho_Id("");
    setPage(1);
    loadData(keyword, LoaiDinhMucTonKho, "", 1);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Định mức tồn kho vật tư"
        description="Định mức tồn kho vật tư"
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
            <h5>Loại định mức:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiDinhMucTonKho ? ListLoaiDinhMucTonKho : []}
              placeholder="Chọn Loại định mức"
              optionsvalue={["id", "tenLoaiDinhMucTonKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectLoaiDinhMucTonKho}
              value={LoaiDinhMucTonKho}
              onChange={(value) => setLoaiDinhMucTonKho(value)}
              allowClear
              onClear={handleClearLoaiDinhMucTonKho}
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
            <h5>Kho:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKho ? ListKho : []}
              placeholder="Chọn kho"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKho}
              value={Kho_Id}
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
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default DinhMucTonKho;
