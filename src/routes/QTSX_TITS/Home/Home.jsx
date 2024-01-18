import { Card, Col, Row, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { Column } from "@ant-design/charts";
import Chart from "react-google-charts";
import { getDateNow, getThangNow } from "src/util/Common";

function Home({ permission, history }) {
  const dispatch = useDispatch();
  const [DataSanXuat, setDataSanXuat] = useState([]);
  const [DataGiaoHang, setDataGiaoHang] = useState([]);
  const [DataTDSXThang, setDataTDSXThang] = useState([]);
  const [DataTDGHThang, setDataTDGHThang] = useState([]);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    if (permission && permission.view) {
      loadData(Number(activeTab));
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  const loadData = (key) => {
    if (key === 1) {
      getSanXuat();
      getTDSXTHANG();
    } else {
      getGiaoHang();
      getTDGHTHANG();
    }
  };

  const getSanXuat = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/dashboard-san-xuat`,
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
        if (res && res.status === 200) {
          const newData = [];
          res.data.forEach((sx) => {
            newData.push({
              name: "Thực hiện",
              date: sx.maSanPham,
              soLuong: sx.thucHien,
              type: "Thực hiện",
            });
            newData.push({
              name: "KHSX",
              date: sx.maSanPham,
              soLuong: sx.keHoach,
              type: "KHSX",
            });
          });
          setDataSanXuat(newData);
        } else {
          setDataSanXuat([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getGiaoHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/dashboard-giao-xe`,
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
        if (res && res.status === 200) {
          const newData = [];
          res.data.forEach((sx) => {
            newData.push({
              name: "Thực hiện",
              date: sx.maSanPham,
              soLuong: sx.thucHien,
              type: "Thực hiện",
            });
            newData.push({
              name: "KHGH",
              date: sx.maSanPham,
              soLuong: sx.keHoach,
              type: "KHGH",
            });
          });
          setDataGiaoHang(newData);
        } else {
          setDataGiaoHang([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getTDSXTHANG = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/dashboard-san-xuat-thang`,
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
        if (res && res.status === 200) {
          setDataTDSXThang(res.data);
        } else {
          setDataTDSXThang([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getTDGHTHANG = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/dashboard-giao-xe-thang`,
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
        if (res && res.status === 200) {
          setDataTDGHThang(res.data);
        } else {
          setDataTDGHThang([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const TDSXColumn = {
    data: DataSanXuat,
    isGroup: true,
    xField: "date",
    yField: "soLuong",
    seriesField: "name",
    // groupField: "type",
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
        fontSize: 13,
        fill: "#000",
        fontWeight: "bold",
      },
    },

    legend: {
      itemName: {
        style: {
          fontSize: 13,
        },
      },
    },
    xAxis: {
      label: {
        style: {
          fill: "#000",
          fontSize: 13,
          fontWeight: "bold",
        },
      },
    },
  };

  const TDGHColumn = {
    data: DataGiaoHang,
    isGroup: true,
    xField: "date",
    yField: "soLuong",
    seriesField: "name",
    // groupField: "type",
    color: ["#FF0000", "#008B8B", "#FFC0CB"],
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
        fontSize: 13,
        fill: "#000",
        fontWeight: "bold",
      },
    },

    legend: {
      itemName: {
        style: {
          fontSize: 13,
        },
      },
    },
    xAxis: {
      label: {
        style: {
          fill: "#000",
          fontSize: 13,
          fontWeight: "bold",
        },
      },
    },
  };
  const SanXuat = () => {
    return (
      <Card>
        <Row justify="center">
          <h2 style={{ fontWeight: "bold" }} align={"center"}>
            BIỂU ĐỒ THEO DÕI TIẾN ĐỘ SẢN XUẤT {getDateNow()}
          </h2>
        </Row>
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Column {...TDSXColumn} className="colum-height-plot" />
          </Col>
        </Row>
        <hr />
        <Row style={{ display: "grid", placeItems: "center" }}>
          <h3
            style={{ fontWeight: "bold", alignItems: "center" }}
            align={"center"}
          >
            BIỂU ĐỒ THEO DÕI TIẾN ĐỘ SẢN XUẤT THÁNG {getThangNow()}
          </h3>
        </Row>
        <Row style={{ height: "100%", marginTop: 15 }} justify="center">
          {DataTDSXThang.length > 0 &&
            DataTDSXThang.map((tdsx) => {
              const newData = [
                ["tenSanPham", "tong"],
                ...tdsx.list_ChiTiets.map((ct) => {
                  return [ct.tenSanPham, ct.soLuong];
                }),
              ];
              return (
                <Col
                  xxl={8}
                  xl={12}
                  lg={24}
                  md={24}
                  sm={24}
                  xs={24}
                  style={{ display: "grid", placeItems: "center" }}
                >
                  <h5 style={{ fontWeight: "bold" }}>{tdsx.tenLoaiSanPham}</h5>
                  <Chart
                    chartType="PieChart"
                    data={newData}
                    options={{ is3D: true }}
                    width={"100%"}
                    height={"300px"}
                  />
                </Col>
              );
            })}
        </Row>
      </Card>
    );
  };
  const GiaoHang = () => {
    return (
      <Card>
        <Row justify="center">
          <h2 style={{ fontWeight: "bold" }} align={"center"}>
            BIỂU ĐỒ THEO DÕI TIẾN ĐỘ GIAO HÀNG {getDateNow()}
          </h2>
        </Row>
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Column {...TDGHColumn} className="colum-height-plot" />
          </Col>
        </Row>
        <hr />
        <Row style={{ display: "grid", placeItems: "center" }}>
          <h3
            style={{ fontWeight: "bold", alignItems: "center" }}
            align={"center"}
          >
            BIỂU ĐỒ THEO DÕI TIẾN ĐỘ GIAO HÀNG THÁNG {getThangNow()}
          </h3>
        </Row>
        <Row style={{ height: "100%", marginTop: 15 }} justify="center">
          {DataTDGHThang.length > 0 &&
            DataTDGHThang.map((tdsx) => {
              const newData = [
                ["tenSanPham", "tong"],
                ...tdsx.list_ChiTiets.map((ct) => {
                  return [ct.tenSanPham, ct.soLuong];
                }),
              ];
              return (
                <Col
                  xxl={8}
                  xl={12}
                  lg={24}
                  md={24}
                  sm={24}
                  xs={24}
                  style={{ display: "grid", placeItems: "center" }}
                >
                  <Chart
                    chartType="PieChart"
                    data={newData}
                    options={{ is3D: true }}
                    width={"100%"}
                    height={"300px"}
                  />
                </Col>
              );
            })}
        </Row>
      </Card>
    );
  };
  const items = [
    {
      key: "1",
      label: "TIẾN ĐỘ SẢN XUẤT",
      children: SanXuat(),
    },
    {
      key: "2",
      label: "TIẾN ĐỘ GIAO HÀNG",
      children: GiaoHang(),
    },
  ];

  return (
    <div className="gx-main-content ">
      <Card className="th-card-margin-bottom th-card-reset-margin th-card-border-radius">
        <Tabs
          defaultActiveKey="1"
          items={items}
          onTabClick={(key) => {
            setActiveTab(key);
          }}
        />
      </Card>
    </div>
  );
}

export default Home;
