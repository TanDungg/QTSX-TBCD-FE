import React, { useEffect, useState } from "react";
import { Card, Row, Col, Divider, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map, isEmpty } from "lodash";
import {
  Table,
  EditableTableRow,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
  getNamNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import Chart from "react-google-charts";
import { Column } from "@ant-design/charts";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;

function ChatLuongTheoThang({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [LoaiSanPham, setLoaiSanPham] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [CongDoan, setCongDoan] = useState(null);
  const [ListNhomLoi, setListNhomLoi] = useState([]);
  const [NhomLoi, setNhomLoi] = useState(null);
  const [Nam, setNam] = useState(getNamNow());
  const [keyword, setKeyword] = useState("");
  const [Data, setData] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getLoaiSanPham();
      getSanPham();
      getCongDoan();
      getListNhomLoi();
      getListData(LoaiSanPham, SanPham, CongDoan, NhomLoi, Nam, keyword);
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
    tits_qtsx_NhomLoi_Id,
    nam,
    keyword
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_LoaiSanPham_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_CongDoan_Id,
      tits_qtsx_NhomLoi_Id,
      nam,
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/bao-cao-chat-luong-theo-thang?${param}`,
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
          const newData = res.data.map((data, index) => {
            const tong = data.list_ChiTiets.reduce(
              (total, item) => total + item.soLuong,
              0
            );
            return {
              ...data,
              key: index + 1,
              tong: tong,
            };
          });

          const tongtheothang = newData.reduce((tong, data) => {
            data.list_ChiTiets.forEach((chitietthang) => {
              const thang = chitietthang.thang;
              tong[thang] = tong[thang] || {
                thang: thang,
                soLuong: 0,
              };
              tong[thang].soLuong += chitietthang.soLuong;
            });
            return tong;
          }, {});

          const HangTong = {
            key: "Tổng",
            tong: newData.reduce((total, item) => total + item.tong, 0),
            list_ChiTiets: Object.values(tongtheothang),
          };

          if (newData.length !== 0) {
            newData.push(HangTong);
          }
          setData(newData);
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

  const getListNhomLoi = (tits_qtsx_CongDoan_Id) => {
    let param = convertObjectToUrlParams({
      tits_qtsx_CongDoan_Id,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_NhomLoi?${param}`,
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
          setListNhomLoi(res.data);
        } else {
          setListNhomLoi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onSearch = () => {
    getListData(LoaiSanPham, SanPham, CongDoan, NhomLoi, Nam, keyword);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(
        LoaiSanPham,
        SanPham,
        CongDoan,
        NhomLoi,
        Nam,
        val.target.value
      );
    }
  };

  const renderChatLuong = (record, month) => {
    const chiTiet = record.list_ChiTiets.find((item) => item.thang === month);
    const soLuong = chiTiet ? chiTiet.soLuong : 0;
    return (
      <span style={{ fontWeight: record.key === "Tổng" ? "bold" : "" }}>
        {soLuong}
      </span>
    );
  };

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      fixed: width > 1500 ? "left" : "none",
      onCell: (record) => ({
        className: record.key === "Tổng" ? "total-row" : "",
        colSpan: record.key === "Tổng" ? 2 : 1,
      }),
    },
    {
      title: "Nhóm lỗi",
      dataIndex: "tenNhomLoi",
      key: "tenNhomLoi",
      align: "center",
      fixed: width > 1500 ? "left" : "none",
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenNhomLoi,
            value: d.tenNhomLoi,
          };
        })
      ),
      onFilter: (value, record) => record.tenNhomLoi.includes(value),
      filterSearch: true,
    },
    {
      title: `Năm ${Nam}`,
      align: "center",
      children: Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        return {
          title: `Tháng ${month}`,
          align: "center",
          width: 90,
          render: (record) => renderChatLuong(record, month),
        };
      }),
    },
    {
      title: "Tổng",
      dataIndex: "tong",
      key: "tong",
      align: "center",
      width: 90,
      render: (value) => {
        return <span style={{ fontWeight: "bold" }}>{value}</span>;
      },
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

  //Data biểu đồ cột
  const newDataColumnThang =
    Data &&
    Data.reduce((result, data) => {
      if (data.key !== "Tổng") {
        data.list_ChiTiets &&
          data.list_ChiTiets.forEach((chitiet) => {
            result.push({
              name: data.tenNhomLoi,
              thang: `Tháng ${chitiet.thang}`,
              soLuong: chitiet.soLuong,
            });
          });
      }
      return result;
    }, []);

  const ChatLuongTheoThangColumn = {
    data: newDataColumnThang,
    isGroup: true,
    xField: "thang",
    yField: "soLuong",
    seriesField: "name",
    color: ["#1677ff", "#FFD700", "#00AA00", "#FFA500"],
    label: {
      position: "middle",
      layout: [
        {
          type: "interval-adjust-position",
        },
        {
          type: "interval-hide-overlap",
        },
      ],
      style: {
        fontSize: 15,
        fill: "#000",
        fontWeight: "bold",
      },
    },

    legend: {
      itemName: {
        style: {
          fontSize: 15,
          fill: "#000",
        },
      },
    },
    xAxis: {
      label: {
        style: {
          fontSize: 15,
          fill: "#000",
          fontWeight: "bold",
        },
      },
    },
  };

  const newDataPieThang = Data
    ? Data.filter((item) => item.key !== "Tổng" && item.tong > 0).map(
        (item) => [item.tenNhomLoi, item.tong]
      )
    : [];

  newDataPieThang.unshift(["tenNhomLoi", "tong"]);
  const NemGheKiaPie = {
    is3D: true,
  };

  const handleOnSelectLoaiSanPham = (value) => {
    setLoaiSanPham(value);
    setSanPham(null);
    getSanPham(value);
    getListData(value, null, CongDoan, NhomLoi, Nam, keyword);
  };

  const handleClearLoaiSanPham = () => {
    setLoaiSanPham(null);
    setSanPham(null);
    getListData(null, null, CongDoan, NhomLoi, Nam, keyword);
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    getListData(LoaiSanPham, value, CongDoan, NhomLoi, Nam, keyword);
  };

  const handleClearSanPham = () => {
    setSanPham(null);
    getListData(LoaiSanPham, null, CongDoan, NhomLoi, Nam, keyword);
  };

  const handleOnSelectCongDoan = (value) => {
    setCongDoan(value);
    setNhomLoi(null);
    getListNhomLoi(value);
    getListData(LoaiSanPham, SanPham, value, null, Nam, keyword);
  };

  const handleClearCongDoan = () => {
    setCongDoan(null);
    setNhomLoi(null);
    getListData(LoaiSanPham, SanPham, null, null, Nam, keyword);
  };

  const handleOnSelectNhomLoi = (value) => {
    setNhomLoi(value);
    getListData(LoaiSanPham, SanPham, CongDoan, value, Nam, keyword);
  };

  const handleClearNhomLoi = () => {
    setNhomLoi(null);
    getListData(LoaiSanPham, SanPham, CongDoan, null, Nam, keyword);
  };

  const handleChangeNam = (nam) => {
    setNam(nam);
    getListData(LoaiSanPham, SanPham, CongDoan, NhomLoi, nam, keyword);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo chất lượng theo tháng"
        description="Báo cáo chất lượng theo tháng"
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
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Nhóm lỗi:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNhomLoi ? ListNhomLoi : []}
              placeholder="Chọn nhóm lỗi"
              optionsvalue={["id", "tenNhomLoi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectNhomLoi}
              allowClear
              onClear={handleClearNhomLoi}
              value={NhomLoi}
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
            <h5>Năm:</h5>
            <DatePicker
              onChange={(date, dateString) => handleChangeNam(dateString)}
              picker="year"
              defaultValue={moment(Nam, "YYYY")}
              allowClear={false}
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
                onPressEnter: onSearch,
                onSearch: onSearch,
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
          scroll={{ x: 1400, y: "40vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={Data}
          size="small"
          rowClassName={(record) => {
            return record.isParent ? "editable-row" : "editable-row";
          }}
          pagination={false}
          loading={loading}
        />
        <Divider
          orientation="left"
          backgroundColor="none"
          style={{
            background: "none",
            fontWeight: "bold",
            marginTop: "30px",
            marginBottom: "30px",
          }}
        >
          Biểu đồ số lượng lỗi chất lượng theo tháng
        </Divider>
        <Row>
          {ChatLuongTheoThangColumn && (
            <Col span={24} justify="center">
              <Column
                {...ChatLuongTheoThangColumn}
                className="colum-height-plot"
                style={{
                  width: "100%",
                  alignItems: "center",
                  height: "30vh",
                }}
              />
            </Col>
          )}

          <Col
            span={24}
            justify="center"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              paddingLeft: 20,
            }}
          >
            <Row
              style={{
                width: "90%",
                alignItems: "center",
              }}
            >
              {newDataPieThang.length > 1 ? (
                <Col
                  span={24}
                  style={{ display: "grid", placeItems: "center" }}
                >
                  <Chart
                    chartType="PieChart"
                    data={newDataPieThang}
                    options={NemGheKiaPie}
                    width={"100%"}
                    height={"350px"}
                  />
                </Col>
              ) : null}
            </Row>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default ChatLuongTheoThang;
