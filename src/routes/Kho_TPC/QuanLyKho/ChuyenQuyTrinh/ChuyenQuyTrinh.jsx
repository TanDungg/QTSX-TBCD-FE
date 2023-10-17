import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
const { EditableRow, EditableCell } = EditableTableRow;
function PhieuDeNghiCapVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListSoLot, setListSoLot] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [XuongSanXuat, setXuongSanXuat] = useState(null);
  const [SoLot, setSoLot] = useState();
  const [SelectedDNCVT, setSelectedDNCVT] = useState(null);
  const [SelectedKeys, setSelectedKeys] = useState(null);
  useEffect(() => {
    if (permission && permission.view) {
      getXuongSanXuat();
      getSoLot();
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
  const getListData = (Lkn_QuyTrinhSX_Id, Lot_Id) => {
    const param = convertObjectToUrlParams({
      Lkn_QuyTrinhSX_Id,
      Lot_Id,
    });
    dispatch(
      fetchStart(
        `lkn_PhieuChuyenQuyTrinhSX/list-chi-tiet-by-lotid?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  const getXuongSanXuat = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`lkn_QuyTrinhSX`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListXuong(res.data);
          setXuongSanXuat(res.data[0].id);
          getListData(res.data[0].id, SoLot);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getSoLot = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Lot?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListSoLot(res.data);
        } else {
          setListSoLot([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleChuyen = () => {
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
          onClick={handleChuyen}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  let dataList = reDataForTable(
    data
    // page === 1 ? page : pageSize * (page - 1) + 2
  );

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      align: "center",
    },
    {
      title: "Chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
    },
    {
      title: "Số Lot",
      dataIndex: "soLot",
      key: "soLot",
      align: "center",
    },

    {
      title: "Số lượng",
      dataIndex: "SoLuong",
      key: "SoLuong",
      align: "center",
    },
    {
      title: "Công đoạn",
      dataIndex: "tenQuyTrinhSX",
      key: "tenQuyTrinhSX",
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

  const handleOnSelectXuongSanXuat = (value) => {
    setXuongSanXuat(value);
    getListData(value, SoLot);
  };

  const handleClearXuongSanXuat = () => {
    setXuongSanXuat(null);
    getListData(null, SoLot);
  };
  const handleOnSelectSoLot = (value) => {
    setSoLot(value);
    getListData(XuongSanXuat, value);
  };

  const handleClearSoLot = () => {
    setSoLot(null);
    getListData(XuongSanXuat, null);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Chuyển công đoạn sản xuất"
        description="Chuyển công đoạn sản xuất"
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
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectXuongSanXuat}
              value={XuongSanXuat}
              onChange={(value) => setXuongSanXuat(value)}
              allowClear
              onClear={handleClearXuongSanXuat}
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
            <h5>Lot:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSoLot ? ListSoLot : []}
              placeholder="Chọn Lot"
              optionsvalue={["id", "soLot"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectSoLot}
              value={SoLot}
              onChange={(value) => setSoLot(value)}
              allowClear
              onClear={handleClearSoLot}
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
            pageSize: 20,
            total: dataList.length,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          rowSelection={{
            type: "radio",
            selectedRowKeys: SelectedKeys ? [SelectedKeys] : [],
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedDNCVT(selectedRows[0]);
              setSelectedKeys(selectedRows[0].key);
            },
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (e) => {
                if (SelectedKeys === record.key) {
                  setSelectedDNCVT(null);
                  setSelectedKeys(null);
                } else {
                  setSelectedDNCVT(record);
                  setSelectedKeys(record.key);
                }
              },
            };
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default PhieuDeNghiCapVatTu;
