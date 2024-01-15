import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { find, map, remove } from "lodash";
import { Table, EditableTableRow } from "src/components/Common";
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

function CauHinhKanBan({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [Data, setData] = useState([]);
  const [Ngay, setNgay] = useState(getDateNow());
  const [SelectedKanBan, setSelectedKanBan] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(Ngay);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (ngay) => {
    const param = convertObjectToUrlParams({
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
      fixed: width >= 1600 && "left",
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      align: "center",
      width: 150,
      fixed: width >= 1600 && "left",
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
      align: "left",
      width: 200,
      fixed: width >= 1600 && "left",
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
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      title: "Đơn hàng",
      dataIndex: "tenDonHang",
      key: "tenDonHang",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenDonHang,
            value: d.tenDonHang,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Chi tiết cụm",
      dataIndex: "tenCum",
      key: "tenCum",
      align: "left",
      width: 150,
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
      width: 80,
    },
    {
      title: "Chuyền gia công linh kiện",
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

  const handleChangeNgay = (dateString) => {
    setNgay(dateString);
    getListData(dateString);
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
              Ngày:
            </span>

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
          scroll={{ x: 1500, y: "54vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive th-table"
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
