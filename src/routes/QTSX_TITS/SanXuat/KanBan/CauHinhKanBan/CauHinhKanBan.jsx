import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { find, map, remove } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  getDateNow,
  exportExcel,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const listchuyen = [
  {
    id: "63aece3b-f542-4c09-bc51-49a39f831906",
    maChuyen: "HLKR",
    tenChuyen: "Chuyền Hàn linh kiện rời",
    tenXuong: "Gia công linh kiện",
  },
  {
    id: "e165873f-f701-4bfd-afdb-ee2ba34c3ea8",
    maChuyen: "GCTP",
    tenChuyen: "Chuyền gia công tạo phôi",
    tenXuong: "Gia công linh kiện",
  },
];

function CauHinhKanBan({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [Data, setData] = useState([]);
  const [ListChuyen, setListChuyen] = useState([]);
  const [Chuyen, setChuyen] = useState(null);
  const [TenChuyen, setTenChuyen] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [TenSanPham, setTenSanPham] = useState(null);
  const [ListDonHang, setListDonHang] = useState([]);
  const [DonHang, setDonHang] = useState(null);
  const [TenDonHang, setTenDonHang] = useState(null);
  const [Ngay, setNgay] = useState(getDateNow());
  const [SelectedKanBan, setSelectedKanBan] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      setListChuyen(listchuyen);
      setChuyen(listchuyen[0].id);
      setTenChuyen(listchuyen[0] && listchuyen[0].tenChuyen);
      getListSanPham(listchuyen[0].id, Ngay);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    tits_qtsx_Chuyen_Id,
    tits_qtsx_SanPham_Id,
    tits_qtsx_DonHang_Id,
    ngay
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_DonHang_Id,
      ngay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan?${param}`,
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
          setData(res.data.list_ChiTiets);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListSanPham = (tits_qtsx_Chuyen_Id, ngay, page) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      ngay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan?${param}`,
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
          setSanPham(res.data[0].tits_qtsx_SanPham_Id);
          setTenSanPham(res.data[0].tenSanPham);
          getListDonHang(
            tits_qtsx_Chuyen_Id,
            res.data[0].tits_qtsx_SanPham_Id,
            ngay
          );
        } else {
          setListSanPham([]);
          setSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonHang = (tits_qtsx_Chuyen_Id, tits_qtsx_SanPham_Id, ngay) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      ngay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan?${param}`,
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
          setListDonHang(res.data);
          setDonHang(res.data[0].tits_qtsx_DonHang_Id);
          setTenDonHang(res.data[0].tenDonHang);
          getListData(
            tits_qtsx_Chuyen_Id,
            tits_qtsx_SanPham_Id,
            res.data[0].tits_qtsx_DonHang_Id,
            ngay
          );
        } else {
          setListDonHang([]);
          setDonHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const ChildrenData = {};
  const DataKanBan = {};

  Data.forEach((item) => {
    if (item.list_Trams) {
      item.list_Trams.forEach((tram) => {
        const { tenTram } = tram;
        ChildrenData[tenTram] = ChildrenData[tenTram] || [];
      });
    }

    const { tits_qtsx_KanBanChiTiet_Id, list_Trams } = item;
    DataKanBan[tits_qtsx_KanBanChiTiet_Id] =
      DataKanBan[tits_qtsx_KanBanChiTiet_Id] || {};

    if (list_Trams) {
      list_Trams.forEach((listtram) => {
        const { thuTuTram, tenTram } = listtram;
        DataKanBan[tits_qtsx_KanBanChiTiet_Id][tenTram] = thuTuTram;
      });
    }
  });

  const tramColumns = Object.keys(ChildrenData).map((tenTram) => {
    return {
      title: tenTram,
      dataIndex: tenTram,
      key: tenTram,
      align: "center",
      width: 80,
      render: (text, record) => {
        const { tits_qtsx_KanBanChiTiet_Id } = record;
        return DataKanBan[tits_qtsx_KanBanChiTiet_Id][tenTram] || "-";
      },
    };
  });

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
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      title: "Chi tiết cụm",
      dataIndex: "tenCum",
      key: "tenCum",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenCum,
            value: d.tenCum,
          };
        })
      ),
      onFilter: (value, record) => record.tenCum.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng (Chi tiết)",
      dataIndex: "soLuongChiTiet",
      key: "soLuongChiTiet",
      align: "center",
      width: 90,
    },
    {
      title: TenChuyen,
      dataIndex: "list_Trams",
      key: "list_Trams",
      align: "center",
      children: tramColumns,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
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

  const handleInKanBan = () => {
    const newListKanBan = SelectedKanBan.map((kanban) => {
      return {
        ...kanban,
        ngay: Ngay,
        tenSanPham: TenSanPham,
        tenDonHang: TenDonHang,
      };
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan/export-file-the-kan-ban-san-xuat`,
          "POST",
          newListKanBan,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("TheKanBan", res.data.dataexcel);
    });
  };

  const buttonRenders = () => {
    return (
      <>
        <Button
          icon={<PrinterOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleInKanBan}
          disabled={SelectedKanBan.length === 0}
        >
          In KanBan
        </Button>
      </>
    );
  };

  const handleOnSelectChuyen = (value) => {
    const newChuyen = ListChuyen.find((chuyen) => chuyen.id === value);
    setTenChuyen(newChuyen && newChuyen.tenChuyen);

    setChuyen(value);
    setSanPham(null);
    setListSanPham([]);
    getListSanPham(value, Ngay);
    setDonHang(null);
    setListDonHang([]);
  };

  const handleOnSelectSanPham = (value) => {
    const newSanPham = ListSanPham.filter(
      (sp) => sp.tits_qtsx_SanPham_Id === value
    );
    setTenSanPham(newSanPham[0].tenSanPham);

    setSanPham(value);
    setDonHang(null);
    setListDonHang([]);
    getListDonHang(Chuyen, value, Ngay);
  };

  const handleOnSelectDonHang = (value) => {
    const newDonHang = ListDonHang.filter(
      (sp) => sp.tits_qtsx_DonHang_Id === value
    );
    setTenDonHang(newDonHang[0].tenDonHang);

    setDonHang(value);
    getListData(Chuyen, SanPham, value, Ngay);
  };

  const handleChangeNgay = (dateString) => {
    setNgay(dateString);
    getListData(Chuyen, SanPham, DonHang, dateString);
  };

  function hanldeRemoveSelected(device) {
    const newkanban = remove(SelectedKanBan, (d) => {
      return d.key !== device.key;
    });
    const newKeys = remove(SelectedKeys, (d) => {
      return d !== device.key;
    });
    setSelectedKanBan(newkanban);
    setSelectedKeys(newKeys);
  }

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRowKanBans: SelectedKanBan,
    onChange: (selectedRowKeys, selectedRowKanBans) => {
      const newSelectedKanBan = [...selectedRowKanBans];
      const newSelectedKey = [...selectedRowKeys];
      setSelectedKanBan(newSelectedKanBan);
      setSelectedKeys(newSelectedKey);
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Cấu hình KanBan cho sản phẩm"
        description="Cấu hình KanBan cho sản phẩm"
        buttons={buttonRenders()}
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
            <h5>Chuyền:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyen ? ListChuyen : []}
              placeholder="Chọn chuyền"
              optionsvalue={["id", "tenChuyen"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectChuyen}
              value={Chuyen}
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
              optionsvalue={["tits_qtsx_SanPham_Id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectSanPham}
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
            <h5>Đơn hàng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonHang ? ListDonHang : []}
              placeholder="Chọn đơn hàng"
              optionsvalue={["tits_qtsx_DonHang_Id", "tenDonHang"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectDonHang}
              value={DonHang}
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
          dataSource={reDataForTable(Data)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: SelectedKeys,
            getCheckboxProps: (record) => ({}),
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (e) => {
                const found = find(SelectedKeys, (k) => k === record.key);
                if (found === undefined) {
                  setSelectedKanBan([...SelectedKanBan, record]);
                  setSelectedKeys([...SelectedKeys, record.key]);
                } else {
                  hanldeRemoveSelected(record);
                }
              },
            };
          }}
        />
      </Card>
    </div>
  );
}

export default CauHinhKanBan;
