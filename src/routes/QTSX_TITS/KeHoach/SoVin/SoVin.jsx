import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Row } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { reDataForTable, removeDuplicates } from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Table,
  Toolbar,
  Select,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import ChiTietSoLo from "./ChiTietSoLo";
const { EditableRow, EditableCell } = EditableTableRow;
function SoVin({ match, permission, history }) {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(({ common }) => common).toJS();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [DonHang, setDonHang] = useState("");
  const [SoLo, setSoLo] = useState("");

  const [infoChiTietMaNoiBo, setInfoChiTietMaNoiBo] = useState([]);

  const [ActiveModal, setActiveModal] = useState(false);
  const { totalRow, pageSize } = data;
  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, page, DonHang);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   * Get menu list
   *
   */
  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getListData = (
    keyword,
    page,
    tits_qtsx_DonHang_Id,
    tits_qtsx_SoLo_Id
  ) => {
    let param = convertObjectToUrlParams({
      tits_qtsx_DonHang_Id,
      tits_qtsx_SoLo_Id,
      page,
      keyword,
    });
    dispatch(fetchStart(`tits_qtsx_SoVin?${param}`, "GET", null, "LIST"));
  };

  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(keyword, pagination, DonHang);
  };
  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchSoLot = () => {
    getListData(keyword, page, DonHang);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, page);
    }
  };
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "số lô";
    ModalDeleteConfirm(deleteItemAction, item, item.tenSoLo, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_SoLo/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(keyword, page, DonHang);
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
            pathname: `${match.url}/${item.tits_qtsx_SoLo_Id}/chinh-sua`,
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
      permission && permission.del && !item.isUsed
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

  let dataList = reDataForTable(data.datalist, page, pageSize);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Mã số lô",
      dataIndex: "maSoLo",
      key: "maSoLo",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maSoLo,
            value: d.maSoLo,
          };
        })
      ),
      onFilter: (value, record) => record.maSoLo.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên số lô",
      dataIndex: "tenSoLo",
      key: "tenSoLo",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenSoLo,
            value: d.tenSoLo,
          };
        })
      ),
      onFilter: (value, record) => record.tenSoLo.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieu,
            value: d.maPhieu,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Danh sách số VIN",
      key: "maSanPhamNoiBo",
      align: "center",
      render: (val) => (
        <Button
          type="primary"
          onClick={() => {
            setActiveModal(true);
            setInfoChiTietMaNoiBo(JSON.parse(val.tits_qtsx_SoVinChiTiets));
          }}
        >
          Xem chi tiết
        </Button>
      ),
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
  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };
  const refeshData = () => {
    getListData(keyword, page, DonHang, SoLo);
  };

  const handleOnSelectDonHang = (val) => {
    setDonHang(val);
    setPage(1);
    getListData(keyword, 1, val);
  };
  const handleOnSelectSoLo = (val) => {
    setSoLo(val);
    setPage(1);
    getListData(keyword, 1, DonHang, val);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục số VIN"}
        description="Danh mục số VIN"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
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
            <h5>Đơn hàng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={data.datalist ? data.datalist : []}
              placeholder={"Chọn đơn hàng"}
              optionsvalue={["tits_qtsx_DonHang_Id", "maPhieu"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectDonHang}
              value={DonHang}
              allowClear
              onClear={() => {
                setDonHang("");
                setSoLo("");
                setPage(1);
                getListData(keyword, 1, "", "");
              }}
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
            <h5>Số lô:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={data.datalist ? data.datalist : []}
              placeholder={"Chọn số lô"}
              optionsvalue={["tits_qtsx_SoLo_Id", "tenSoLo"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectSoLo}
              value={SoLo}
              allowClear
              onClear={() => {
                setSoLo("");
                setPage(1);
                getListData(keyword, 1, DonHang, "");
              }}
            />
          </Col>
          <Col xxl={6} xl={8} lg={12} md={12} sm={24} xs={24}>
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchSoLot,
                onSearch: onSearchSoLot,
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
          columns={columns}
          scroll={{ x: 300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
      <ChiTietSoLo
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        data={infoChiTietMaNoiBo}
        refesh={refeshData}
      />
    </div>
  );
}

export default SoVin;
