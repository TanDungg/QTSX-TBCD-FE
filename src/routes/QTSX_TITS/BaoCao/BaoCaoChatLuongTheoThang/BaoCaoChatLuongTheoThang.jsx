import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Modal as AntModal,
  Image,
  Tag,
  Empty,
  Divider,
} from "antd";
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
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
  getNamNow,
  getThangNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import Chart from "react-google-charts";
import { Column } from "@ant-design/charts";

const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoChatLuongTheoThang({ match, history, permission }) {
  const { loading, data, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [LoaiSanPham, setLoaiSanPham] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [CongDoan, setCongDoan] = useState(null);
  const [DisabledModal, setDisabledModal] = useState(false);
  const [ListHinhAnh, setListHinhAnh] = useState([]);
  const [HangMuc, setHangMuc] = useState([]);
  const [Data, setData] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getLoaiSanPham();
      getSanPham();
      getCongDoan();
      getListData(LoaiSanPham, SanPham, CongDoan, keyword, page);
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
    keyword,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_LoaiSanPham_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_CongDoan_Id,
      keyword,
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

  const onSearchPhieuNhanHang = () => {
    getListData(LoaiSanPham, SanPham, CongDoan, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(LoaiSanPham, SanPham, CongDoan, val.target.value, page);
    }
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(LoaiSanPham, SanPham, CongDoan, keyword, pagination);
  };

  const { totalRow, pageSize } = Data;

  const XemChiTiet = (record) => {
    setHangMuc(record);
    setListHinhAnh(record.list_HinhAnhs && JSON.parse(record.list_HinhAnhs));
    setDisabledModal(true);
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
      title: "Nhóm lỗi",
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
      title: "Tháng 1",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 2",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 3",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 4",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 5",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 6",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 7",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 8",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 9",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 10",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 11",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tháng 12",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
    },
    {
      title: "Tổng",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 90,
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

  //Chuyền sản xuất nệm ghế
  const newDataSXNemGhe = [
    {
      name: "KHSX",
      type: "KHSX",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Thực hiện",
      type: "Thực hiện",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Tổng KHSX",
      type: "Tổng",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Tổng sản xuất thực tế",
      type: "Tổng",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "KHSX",
      type: "KHSX",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Thực hiện",
      type: "Thực hiện",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Tổng KHSX",
      type: "Tổng",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Tổng sản xuất thực tế",
      type: "Tổng",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "KHSX",
      type: "KHSX",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Thực hiện",
      type: "Thực hiện",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Tổng KHSX",
      type: "Tổng",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Tổng sản xuất thực tế",
      type: "Tổng",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "KHSX",
      type: "KHSX",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Thực hiện",
      type: "Thực hiện",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Tổng KHSX",
      type: "Tổng",
      date: "19/12/2023",
      soLuong: 150,
    },
    {
      name: "Tổng sản xuất thực tế",
      type: "Tổng",
      date: "19/12/2023",
      soLuong: 150,
    },
  ];
  // Data.datalist &&
  //   Data.datalist.forEach((item) => {
  //     newDataSXNemGhe.push({
  //       name: "KHSX",
  //       date: item.tenDongXe,
  //       soLuong: item.keHoach,
  //       type: "KHSX",
  //     });

  //     newDataSXNemGhe.push({
  //       name: "Thực hiện",
  //       date: item.tenDongXe,
  //       soLuong: item.thucHien,
  //       type: "Thực hiện",
  //     });

  //     newDataSXNemGhe.push({
  //       name: "Tổng KHSX",
  //       date: item.tenDongXe,
  //       soLuong: item.tongKeHoach,
  //       type: "Tổng",
  //     });

  //     newDataSXNemGhe.push({
  //       name: "Tổng sản xuất thực tế",
  //       date: item.tenDongXe,
  //       soLuong: item.tongThucHien,
  //       type: "Tổng",
  //     });
  //   });

  const SanXuatNemGheColumn = {
    data: newDataSXNemGhe,
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

  // const DataNemGheKiaPie = Data.datalist
  //   ? Data.datalist
  //       .filter((item) => item.tongThucHien > 0)
  //       .map((item) => [item.tenDongXe, item.tongThucHien])
  //   : [];

  const DataNemGheKiaPie = [
    ["Work", 11],
    ["Eat", 2],
    ["Commute", 2],
    ["Watch TV", 2],
    ["Sleep", 7],
  ];
  DataNemGheKiaPie.unshift(["tenDongXe", "soLuong"]);
  const NemGheKiaPie = {
    is3D: true,
  };

  const handleOnSelectLoaiSanPham = (value) => {
    setLoaiSanPham(value);
    setSanPham(null);
    setCongDoan(null);
    getSanPham(value);
    getListData(value, null, null, keyword, 1);
  };

  const handleClearLoaiSanPham = () => {
    setLoaiSanPham(null);
    setSanPham(null);
    setCongDoan(null);
    getListData(null, null, null, keyword, 1);
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    setCongDoan(null);
    getListData(LoaiSanPham, value, CongDoan, keyword, 1);
  };

  const handleClearSanPham = () => {
    setSanPham(null);
    setCongDoan(null);
    getListData(LoaiSanPham, null, CongDoan, keyword, 1);
  };

  const handleOnSelectCongDoan = (value) => {
    setCongDoan(value);
    getListData(LoaiSanPham, SanPham, value, keyword, 1);
  };

  const handleClearCongDoan = () => {
    setCongDoan(null);
    getListData(LoaiSanPham, SanPham, null, keyword, 1);
  };

  const title = (
    <span>
      Hình ảnh của hạng mục kiểm tra{" "}
      <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
        {HangMuc && HangMuc.tenHangMucKiemTra}
      </Tag>
    </span>
  );

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
                onPressEnter: onSearchPhieuNhanHang,
                onSearch: onSearchPhieuNhanHang,
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
          dataSource={reDataForTable(Data.datalist)}
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
            marginBottom: "30px",
          }}
        >
          Biểu đồ số lượng lỗi chất lượng theo tháng
        </Divider>
        <Row>
          {SanXuatNemGheColumn && (
            <Col md={12} xs={24} justify="center">
              <Row justify="center">
                <h4 style={{ fontSize: 18, textAlign: "center" }}>
                  <strong>6 tháng đầu năm {getNamNow()}</strong>
                </h4>
              </Row>
              <Column
                {...SanXuatNemGheColumn}
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
            md={12}
            xs={24}
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
                width: "100%",
                alignItems: "center",
                height: "35vh",
              }}
            >
              {DataNemGheKiaPie.length > 1 ? (
                <Col
                  span={24}
                  style={{ display: "grid", placeItems: "center" }}
                >
                  <Chart
                    chartType="PieChart"
                    data={DataNemGheKiaPie}
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
      <AntModal
        title={title}
        className="th-card-reset-margin"
        open={DisabledModal}
        width={width > 786 ? `50%` : "90%"}
        closable={true}
        onCancel={() => setDisabledModal(false)}
        footer={null}
      >
        {ListHinhAnh ? (
          <div
            style={{
              overflowY: "auto",
              maxHeight: "500px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {ListHinhAnh &&
              ListHinhAnh.map((hinhanh) => {
                return (
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      borderRadius: 15,
                      marginRight: 15,
                      marginBottom: 15,
                    }}
                  >
                    <Image
                      width={200}
                      height={200}
                      style={{
                        borderRadius: 15,
                        border: "1px solid #c8c8c8",
                        padding: 8,
                      }}
                      src={BASE_URL_API + hinhanh.hinhAnh}
                    />
                  </div>
                );
              })}
          </div>
        ) : (
          <div>
            <Empty style={{ height: "500px" }} />
          </div>
        )}
      </AntModal>
    </div>
  );
}

export default BaoCaoChatLuongTheoThang;
