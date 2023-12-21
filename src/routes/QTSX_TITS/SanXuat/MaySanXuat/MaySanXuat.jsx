import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
  getDateNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;

function MaySanXuat({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [Data, setData] = useState([]);
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [CongDoan, setCongDoan] = useState(null);
  const [ListXuong, setListXuong] = useState([]);
  const [Xuong, setXuong] = useState(null);
  const [ListMaySanXuat, setListMaySanXuat] = useState([]);
  const [MaySanXuat, setMaySanXuat] = useState(null);
  const [Ngay, setNgay] = useState(getDateNow());
  const [SelectedKanBan, setSelectedKanBan] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListCongDoan();
      getListXuong();
      getListMaySanXuat();
      getListData(CongDoan, Xuong, MaySanXuat, Ngay, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    tits_qtsx_CongDoan_Id,
    tits_qtsx_Xuong_Id,
    tits_qtsx_MaySanXuat_Id,
    ngay,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_CongDoan_Id,
      tits_qtsx_Xuong_Id,
      tits_qtsx_MaySanXuat_Id,
      ngay,
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

  const getListCongDoan = () => {
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

  const getListXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Xuong?page=-1`,
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
          setListXuong(res.data);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListMaySanXuat = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ChiTiet?page=-1`,
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
          const newData = res.data.map((data) => {
            return {
              ...data,
              chiTiet: `${data.tenChiTiet} (${data.tenSanPham})`,
            };
          });
          setListMaySanXuat(newData);
        } else {
          setListMaySanXuat([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(CongDoan, Xuong, MaySanXuat, Ngay, pagination);
  };

  const { totalRow, pageSize } = Data;

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã chi tiết",
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
      title: "Tên chi tiết",
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
      title: "Chi tiết cụm",
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
      title: "Số lượng (Chi tiết)",
      dataIndex: "tenHangMucKiemTra",
      key: "tenHangMucKiemTra",
      align: "center",
      width: 100,
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
      title: "Chuyền hàn Sup",
      align: "center",
      children: [
        {
          title: "Trạm dầm chính",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
        {
          title: "Trạm đà đầu",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
        {
          title: "Trạm đà sau",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
        {
          title: "Trạm cán sau",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
        {
          title: "Trạm chân chống",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
      ],
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

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PrinterOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          // onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          In KanBan
        </Button>
      </>
    );
  };

  const handleOnSelectCongDoan = (value) => {
    setCongDoan(value);
    getListData(value, Xuong, MaySanXuat, Ngay, 1);
  };

  const handleClearCongDoan = () => {
    setCongDoan(null);
    getListData(null, Xuong, MaySanXuat, Ngay, 1);
  };

  const handleOnSelectXuong = (value) => {
    setXuong(value);
    getListData(CongDoan, value, MaySanXuat, Ngay, 1);
  };

  const handleClearXuong = () => {
    setXuong(null);
    getListData(CongDoan, null, MaySanXuat, Ngay, 1);
  };

  const handleOnSelectMaySanXuat = (value) => {
    setMaySanXuat(value);
    getListData(CongDoan, Xuong, value, Ngay, 1);
  };

  const handleClearMaySanXuat = () => {
    setMaySanXuat(null);
    getListData(CongDoan, Xuong, null, Ngay, 1);
  };

  const handleChangeNgay = (dateString) => {
    setNgay(dateString);
    getListData(CongDoan, Xuong, MaySanXuat, dateString, 1);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedKanBan,

    onChange: (selectedRowKeys, selectedRows) => {
      const row =
        SelectedKanBan.length > 0
          ? selectedRows.filter((d) => d.key !== SelectedKanBan[0].key)
          : [...selectedRows];

      const key =
        SelectedKeys.length > 0
          ? selectedRowKeys.filter((d) => d !== SelectedKeys[0])
          : [...selectedRowKeys];

      setSelectedKanBan(row);
      setSelectedKeys(key);
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Máy sản xuất"
        description="Máy sản xuất"
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
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenXuong"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectXuong}
              allowClear
              onClear={handleClearXuong}
              value={Xuong}
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
            <h5>Máy sản xuất:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListMaySanXuat ? ListMaySanXuat : []}
              placeholder="Chọn máy sản xuất"
              optionsvalue={["id", "MaySanXuat"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectMaySanXuat}
              allowClear
              onClear={handleClearMaySanXuat}
              value={MaySanXuat}
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
            <h5>Ngày:</h5>
            <DatePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={moment(Ngay, "DD/MM/YYYY")}
              allowClear={false}
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

export default MaySanXuat;
