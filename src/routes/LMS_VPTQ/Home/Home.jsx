import { Card, Col, Divider, Radio, Row, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { Column } from "@ant-design/charts";
import Chart from "react-google-charts";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
  reDataForTable,
} from "src/util/Common";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function Home() {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [IsAdmin, setIsAdmin] = useState(false);
  const [DataDashboardAdmin, setDataDashboardAdmin] = useState([]);
  const [DataDashboardHocVien, setDataDashboardHocVien] = useState(null);
  const [SoLuongDat, setSoLuongDat] = useState(null);
  const [SoLuongKhongDat, setSoLuongKhongDat] = useState(null);
  const [value, setValue] = useState(3);

  useEffect(() => {
    getIsAdmin();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIsAdmin = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/is-admin`,
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
          setIsAdmin(res.data);
          getListDataDashboardAdmin(value);
        } else {
          setIsAdmin(false);
          getDataDoashboardHocVien(INFO.donVi_Id, INFO.user_Id);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDataDashboardAdmin = (key) => {
    const param = convertObjectToUrlParams({
      isTuan: key === 1 ? true : false,
      isThang: key === 2 ? true : false,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/dashboard-thong-ke-nguoi-hoc?${param}`,
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
          const totalSoLuongDat = res.data.reduce(
            (total, item) => total + item.soLuongDat,
            0
          );
          setSoLuongDat(totalSoLuongDat);

          const totalSoLuongKhongDat = res.data.reduce(
            (total, item) => total + item.soLuongKhongDat,
            0
          );
          setSoLuongKhongDat(totalSoLuongKhongDat);

          setDataDashboardAdmin(res.data);
        } else {
          setDataDashboardAdmin([]);
          setSoLuongDat(null);
          setSoLuongDat(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const getDataDoashboardHocVien = (donVi_Id, user_Id) => {
    let param = convertObjectToUrlParams({
      donVi_Id,
      user_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/tien-trinh-hoc-tap?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setDataDashboardHocVien(res.data);
      } else {
        setDataDashboardHocVien([]);
      }
    });
  };

  const dataList = reDataForTable(DataDashboardAdmin);

  const tongSLDangKy = dataList.reduce((sum, item) => {
    return sum + (item.soLuongDangKy || 0);
  }, 0);

  const tongSLThamDu = dataList.reduce((sum, item) => {
    return sum + (item.soLuongThamDu || 0);
  }, 0);

  const tyLeThamDu = parseFloat(
    ((tongSLThamDu / tongSLDangKy) * 100).toFixed(2)
  );

  const tongSLVangCoPhep = dataList.reduce((sum, item) => {
    return sum + (item.soLuongVangCoPhep || 0);
  }, 0);

  const tongSLVangKhongPhep = dataList.reduce((sum, item) => {
    return sum + (item.soLuongVangKhongPhep || 0);
  }, 0);

  const tongSLDat = dataList.reduce((sum, item) => {
    return sum + (item.soLuongDat || 0);
  }, 0);

  const tongSLKhongDat = dataList.reduce((sum, item) => {
    return sum + (item.soLuongKhongDat || 0);
  }, 0);

  const tongTyLeDat = parseFloat(((tongSLDat / tongSLDangKy) * 100).toFixed(2));

  const tongTyLeKhongDat = parseFloat(
    ((tongSLKhongDat / tongSLDangKy) * 100).toFixed(2)
  );

  const HangTong = {
    key: "Tổng",
    soLuongThamDu: tongSLThamDu,
    soLuongDangKy: tongSLDangKy,
    tyLeThamDu: tyLeThamDu,
    soLuongVangCoPhep: tongSLVangCoPhep,
    soLuongVangKhongPhep: tongSLVangKhongPhep,
    soLuongDat: tongSLDat,
    tyLeDat: tongTyLeDat,
    soLuongKhongDat: tongSLKhongDat,
    tyLeKhongDat: tongTyLeKhongDat,
  };

  dataList.length && dataList.push(HangTong);

  let columnsDoashboardAdmin = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 2 : 1,
      }),
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 250,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          đăng ký
        </div>
      ),
      dataIndex: "soLuongDangKy",
      key: "soLuongDangKy",
      align: "center",
      width: 100,
      render: (value) => {
        return <span>{value} học viên</span>;
      },
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          tham dự
        </div>
      ),
      dataIndex: "soLuongThamDu",
      key: "soLuongThamDu",
      align: "center",
      width: 100,
      render: (value) => {
        return <span>{value} học viên</span>;
      },
    },
    {
      title: (
        <div>
          Tỷ lệ
          <br />
          tham dự
        </div>
      ),
      dataIndex: "tyLeThamDu",
      key: "tyLeThamDu",
      align: "center",
      width: 100,
      render: (value) => {
        return <span>{value} %</span>;
      },
    },
    {
      title: "Chuyên cần",
      align: "center",
      children: [
        {
          title: (
            <div>
              Vắng
              <br />
              (Có phép)
            </div>
          ),
          dataIndex: "soLuongVangCoPhep",
          key: "soLuongVangCoPhep",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} học viên</span>;
          },
        },
        {
          title: (
            <div>
              Vắng
              <br />
              (Không phép)
            </div>
          ),
          dataIndex: "soLuongVangKhongPhep",
          key: "soLuongVangKhongPhep",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} học viên</span>;
          },
        },
      ],
    },
    {
      title: "Kết quả",
      align: "center",
      children: [
        {
          title: "Đạt",
          dataIndex: "soLuongDat",
          key: "soLuongDat",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} học viên</span>;
          },
        },
        {
          title: "Tỷ lệ",
          dataIndex: "tyLeDat",
          key: "tyLeDat",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} %</span>;
          },
        },
        {
          title: "Không đạt",
          dataIndex: "soLuongKhongDat",
          key: "soLuongKhongDat",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} học viên</span>;
          },
        },
        {
          title: "Tỷ lệ",
          dataIndex: "tyLeKhongDat",
          key: "tyLeKhongDat",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} %</span>;
          },
        },
      ],
    },
  ];

  let columnsDoashboardHocVien = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 250,
    },
    {
      title: "Tên lớp học",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 200,
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "left",
      width: 150,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          đào tạo
        </div>
      ),
      dataIndex: "thoiGianDaoTao",
      key: "thoiGianDaoTao",
      align: "center",
      width: 100,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          kết thúc
        </div>
      ),
      dataIndex: "thoiGianKetThuc",
      key: "thoiGianKetThuc",
      align: "center",
      width: 100,
    },

    {
      title: (
        <div>
          Thời gian
          <br />
          hoàn thành
        </div>
      ),
      dataIndex: "thoiGianHoanThanh",
      key: "thoiGianHoanThanh",
      align: "center",
      width: 100,
    },
    {
      title: "Số điểm",
      dataIndex: "soDiem",
      key: "soDiem",
      align: "center",
      width: 100,
      render: (value) => {
        return value !== null && <span>{value} điểm</span>;
      },
    },
    {
      title: "Hoàn thành",
      dataIndex: "tyLe",
      key: "tyLe",
      align: "center",
      width: 100,
      render: (value) => {
        return value !== null && <span>{value} %</span>;
      },
    },
    {
      title: "Đánh giá",
      dataIndex: "isDat",
      key: "isDat",
      align: "center",
      width: 100,
      render: (value) => {
        return (
          value !== null && (
            <span
              style={{
                fontWeight: "bold",
                color: value === true ? "#0469b9" : "red",
              }}
            >
              {value === true ? "Đạt" : value === false ? "Không đạt" : ""}
            </span>
          )
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 150,
      render: (value) =>
        value && (
          <Tag
            color={
              value === "Đã học, chưa thi"
                ? "orange"
                : value === "Hoàn thành"
                ? "blue"
                : value === "Chưa học"
                ? ""
                : "red"
            }
            style={{
              whiteSpace: "break-spaces",
              fontSize: 13,
            }}
          >
            {value}
          </Tag>
        ),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const DataSoLuongHocVienColumnAdmin = [];
  DataDashboardAdmin &&
    DataDashboardAdmin.forEach((item) => {
      DataSoLuongHocVienColumnAdmin.push({
        name: "Đăng ký",
        key: item.maDonVi,
        soLuong: item.soLuongDangKy,
        type: "DangKy",
      });

      DataSoLuongHocVienColumnAdmin.push({
        name: "Tham dự",
        key: item.maDonVi,
        soLuong: item.soLuongThamDu,
        type: "ThamDu",
      });
    });

  const SoLuongHocVienColumnAdmin = {
    data: DataSoLuongHocVienColumnAdmin,
    isGroup: true,
    xField: "key",
    yField: "soLuong",
    seriesField: "name",
    color: ["#0469b9", "#f25c1c"],
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
        fontSize: 16,
        fill: "#fff",
      },
    },
    legend: {
      itemName: {
        style: {
          fontSize: 16,
          fill: "#000",
        },
      },
    },
    xAxis: {
      label: {
        style: {
          fill: "#000",
          fontSize: 16,
        },
      },
    },
  };

  const DataKetQuaDaoTaoPie = [
    ["ketQua", "soLuong"],
    ["Đạt", SoLuongDat],
    ["Không đạt", SoLuongKhongDat],
  ];

  const onChange = (e) => {
    const value = e.target.value;
    setValue(value);
    getListDataDashboardAdmin(value);
  };

  const radioStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    color: "#0469b9",
    fontSize: "16px",
  };

  const DataSoLuongHocVienColumnHocVien = [
    {
      name: "Đăng ký",
      key: "Số lượng chuyên đề",
      soLuong: DataDashboardHocVien && DataDashboardHocVien.soLuongDangKy,
      type: "DangKy",
    },
    {
      name: "Hoàn thành",
      key: "Số lượng chuyên đề",
      soLuong: DataDashboardHocVien && DataDashboardHocVien.soLuongHoanThanh,
      type: "HoanThanh",
    },
  ];

  const SoLuongHocVienColumnHocVien = {
    data: DataSoLuongHocVienColumnHocVien,
    isGroup: true,
    xField: "key",
    yField: "soLuong",
    seriesField: "name",
    color: ["#0469b9", "#f25c1c"],
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
        fontSize: 16,
        fill: "#fff",
      },
    },
    legend: {
      itemName: {
        style: {
          fontSize: 16,
          fill: "#000",
        },
      },
    },
    xAxis: {
      label: {
        style: {
          fill: "#000",
          fontSize: 16,
        },
      },
    },
  };

  let dat = 0;
  let khongdat = 0;
  let chuadanhgia = 0;

  DataDashboardHocVien &&
    DataDashboardHocVien.list_ChiTiets.reduce((data, item) => {
      if (item.isDat === true) {
        dat += 1;
      } else if (item.isDat === false) {
        khongdat += 1;
      } else {
        chuadanhgia += 1;
      }
      return data;
    }, 0);

  const DataKetQuaDaoTaoHocVienPie = [
    ["ketQua", "soLuong"],
    ["Đạt", dat],
    ["Không đạt", khongdat],
    ["Chưa đánh giá", chuadanhgia],
  ];

  return (
    <div className="gx-main-content ">
      {IsAdmin ? (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Radio.Group
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: "30px",
              lineHeight: "30px",
              gap: "15px",
            }}
            onChange={onChange}
            value={value}
          >
            <Radio style={radioStyle} value={1}>
              Tuần
            </Radio>
            <Radio style={radioStyle} value={2}>
              Tháng
            </Radio>
            <Radio style={radioStyle} value={3}>
              Năm
            </Radio>
          </Radio.Group>
          <Card className="th-card-margin-bottom th-card-reset-margin">
            <Row gutter={[0, 10]}>
              <Col span={width >= 1700 ? 12 : 24}>
                <Column
                  {...SoLuongHocVienColumnAdmin}
                  className="colum-height-plot"
                />
                <div align="center">
                  <h4
                    style={{
                      color: "#0469b9",
                      fontWeight: "bold",
                      marginTop: "10px",
                    }}
                  >
                    BIỂU ĐỒ THEO DÕI SỐ LƯỢNG HỌC VIÊN
                  </h4>
                </div>
              </Col>
              {width < 1700 && <Divider />}
              <Col span={width >= 1700 ? 12 : 24}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "20px",
                    fontSize: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        height: "13px",
                        width: "13px",
                        background: "#DC3912",
                        display: "inline-block",
                        borderRadius: "100%",
                      }}
                    />
                    <span>Không đạt</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        height: "13px",
                        width: "13px",
                        background: "#3366CC",
                        display: "inline-block",
                        borderRadius: "100%",
                      }}
                    />
                    <span>Đạt</span>
                  </div>
                </div>
                <Chart
                  chartType="PieChart"
                  data={DataKetQuaDaoTaoPie}
                  options={{
                    is3D: true,
                    legend: "none",
                    chartArea: {
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                    },
                    margin: 0,
                  }}
                  height={"370px"}
                  width={"100%"}
                  style={{ padding: "0px" }}
                />
                <div align="center">
                  <h4
                    style={{
                      color: "#0469b9",
                      fontWeight: "bold",
                      marginTop: "10px",
                    }}
                  >
                    BIỂU ĐỒ KẾT QUẢ ĐÀO TẠO
                  </h4>
                </div>
              </Col>
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"KẾT QUẢ ĐÀO TẠO"}
          >
            <Table
              bordered
              scroll={{ x: 1200, y: "30vh" }}
              columns={columnsDoashboardAdmin}
              components={components}
              className="gx-table-responsive th-table"
              dataSource={dataList}
              size="small"
              rowClassName={(record) =>
                record.key === "Tổng" ? "total-row" : "editable-row"
              }
              pagination={false}
            />
          </Card>
        </Card>
      ) : (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Card className="th-card-margin-bottom th-card-reset-margin">
            <Row gutter={[0, 10]}>
              <Col span={width >= 1700 ? 12 : 24}>
                <Column
                  {...SoLuongHocVienColumnHocVien}
                  className="colum-height-plot"
                />
                <div align="center">
                  <h4
                    style={{
                      color: "#0469b9",
                      fontWeight: "bold",
                      marginTop: "10px",
                    }}
                  >
                    BIỂU ĐỒ THEO DÕI CHUYÊN ĐỀ ĐÀO TẠO
                  </h4>
                </div>
              </Col>
              {width < 1700 && <Divider />}
              <Col span={width >= 1700 ? 12 : 24}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "30px",
                    fontSize: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        height: "13px",
                        width: "13px",
                        background: "#FF9900",
                        display: "inline-block",
                        borderRadius: "100%",
                      }}
                    />
                    <span>Chưa đánh giá</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        height: "13px",
                        width: "13px",
                        background: "#3366CC",
                        display: "inline-block",
                        borderRadius: "100%",
                      }}
                    />
                    <span>Đạt</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        height: "13px",
                        width: "13px",
                        background: "#DC3912",
                        display: "inline-block",
                        borderRadius: "100%",
                      }}
                    />
                    <span>Không đạt</span>
                  </div>
                </div>
                <Chart
                  chartType="PieChart"
                  data={DataKetQuaDaoTaoHocVienPie}
                  options={{
                    is3D: true,
                    legend: "none",
                    chartArea: {
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                    },
                    margin: 0,
                  }}
                  height={"370px"}
                  width={"100%"}
                  style={{ padding: "0px" }}
                />
                <div align="center">
                  <h4
                    style={{
                      color: "#0469b9",
                      fontWeight: "bold",
                      marginTop: "10px",
                    }}
                  >
                    BIỂU ĐỒ KẾT QUẢ ĐÀO TẠO
                  </h4>
                </div>
              </Col>
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"DANH SÁCH CHUYÊN ĐỀ ĐÀO TẠO"}
          >
            <Table
              bordered
              scroll={{ x: 1200, y: "30vh" }}
              columns={columnsDoashboardHocVien}
              components={components}
              className="gx-table-responsive th-table"
              dataSource={reDataForTable(
                DataDashboardHocVien && DataDashboardHocVien.list_ChiTiets
              )}
              size="small"
              rowClassName={(record) =>
                record.key === "Tổng" ? "total-row" : "editable-row"
              }
              pagination={false}
            />
          </Card>
        </Card>
      )}
    </div>
  );
}

export default Home;
