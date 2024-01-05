import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  getMonthYearNow,
  getNumberDayOfMonth,
  exportExcel,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { DownloadOutlined } from "@ant-design/icons";

const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoGiaoXeThang({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [SanPham, setSanPham] = useState(null);
  const [Data, setData] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ThangNam, setThangNam] = useState(getMonthYearNow());
  useEffect(() => {
    if (permission && permission.view) {
      getSanPham();
      getListData(SanPham, ThangNam);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (tits_qtsx_SanPham_Id, thangNam) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_SanPham_Id,
      thang: thangNam.slice(0, 2),
      nam: thangNam.slice(3),
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/bao-cao-ket-qua-giao-xe-thang?${param}`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              ...dt.list_ChiTiets.map((ct) => {
                const key = "ngay" + ct.ngay.toString();
                return {
                  [key]: ct.soLuongThucHien + "/" + ct.soLuongKeHoach,
                };
              }),
            };
          });
          setData(newData);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham?page=-1`,
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

  let renderHead = [
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
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maSanPham,
            value: d.maSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maSanPham && record.maSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      width: 200,
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenSanPham && record.tenSanPham.includes(value),
      filterSearch: true,
    },
    // {
    //   title: "Xưởng",
    //   dataIndex: "tenSanPham",
    //   key: "tenSanPham",
    //   align: "center",
    //   filters: removeDuplicates(
    //     map(Data, (d) => {
    //       return {
    //         text: d.tenSanPham,
    //         value: d.tenSanPham,
    //       };
    //     })
    //   ),
    //   onFilter: (value, record) =>
    //     record.tenSanPham && record.tenSanPham.includes(value),
    //   filterSearch: true,
    // },
    {
      title: `Tháng ${ThangNam.slice(0, 2)} năm ${ThangNam.slice(3)}`,
      children: new Array(
        getNumberDayOfMonth(ThangNam.slice(0, 2), ThangNam.slice(3))
      )
        .fill(null)
        .map((_, i) => {
          const id = String(i + 1);
          return {
            title: id,
            dataIndex: `${id - 1}`,
            key: `ngay${id}`,
            align: "center",
            width: 55,
            render: (val) => <span>{val && val[`ngay${id}`]}</span>,
          };
        }),
    },
    {
      title: `Tổng`,
      children: [
        {
          title: "TH",
          dataIndex: `tongSoLuongThucHien`,
          key: `tongSoLuongThucHien`,
          align: "center",
          width: 55,
        },
        {
          title: "KH",
          dataIndex: `tongSoLuongKeHoach`,
          key: `tongSoLuongKeHoach`,
          align: "center",
          width: 55,
        },
      ],
    },
    {
      title: "% TH/KH",
      dataIndex: "phanTram",
      key: "phanTram",
      width: 55,
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

  const handleOnSelectSanPham = (value) => {
    if (SanPham !== value) {
      setSanPham(value);
      getListData(value, ThangNam);
    }
  };

  const handleClearSanPham = () => {
    setSanPham(null);
    getListData(null, ThangNam);
  };

  const handleChangeNgay = (dateString) => {
    if (ThangNam !== dateString) {
      setThangNam(dateString);
      getListData(SanPham, dateString);
    }
  };

  const handleXuatExcel = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/export-file-bao-cao-ket-qua-giao-xe`,
          "POST",
          {
            nam: ThangNam.slice(3),
            thang: ThangNam.slice(0, 2),
            listBaoCaoKetQuaGiaoXeThangChiTiets: Data,
          },
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("BaoCaoGiaoHangThang", res.data.dataexcel);
    });
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleXuatExcel}
        >
          Xuất Excel
        </Button>
      </>
    );
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo sản xuất tháng"
        description="Báo cáo sản xuất tháng"
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
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Tháng:</h5>
            <DatePicker
              format={"MM/YYYY"}
              defaultValue={moment(ThangNam, "MM/YYYY")}
              allowClear={false}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              picker="month"
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1600, y: "56vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data)}
          size="small"
          rowClassName={(record) => {
            "editable-row";
          }}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default BaoCaoGiaoXeThang;
