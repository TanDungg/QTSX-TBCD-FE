import React, { useEffect, useState } from "react";
import { Card, Col, Row, Steps, Progress } from "antd";

import { useDispatch, useSelector } from "react-redux";
import { EditableTableRow, Toolbar, Table } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { isEmpty, map } from "lodash";
const { EditableRow, EditableCell } = EditableTableRow;

const optionsDate = {
  weekday: "long", // Thứ
  year: "numeric", // Năm
  month: "numeric", // Tháng
  day: "numeric", // Ngày
};

const optionsTime = {
  hour: "numeric", // Giờ
  minute: "numeric", // Phút
  second: "numeric", // Giây
  hour12: false, // 24 giờ
};
function TheoDoiTienDoSanXuat({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();

  const [keyword, setKeyword] = useState("");
  const [InfoSanPham, setInfoSanPham] = useState({});

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formattedDateTime = new Intl.DateTimeFormat(
    "vi-VN",
    optionsDate
  ).format(currentDateTime);
  const formattedTime = new Intl.DateTimeFormat("vi-VN", optionsTime).format(
    currentDateTime
  );
  useEffect(() => {
    if (permission && permission.view) {
      getSoKhunNoiBo();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   * Trạm Id
   * Get list số khung nội bộ
   * @param {*} tram_Id
   * @param {*} keyword
   */
  const getSoKhunNoiBo = (keyword) => {
    const param = convertObjectToUrlParams({
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/theo-doi-tien-do-san-xuat?${param}`,
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
          setInfoSanPham(res.data);
        } else {
          setInfoSanPham({});
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Tìm kiếm người dùng
   */
  const onSearchSoKhung = (val) => {
    if (!isEmpty(val)) {
      getSoKhunNoiBo(keyword);
    }
  };
  /**
   * Thay đổi keyword
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getSoKhunNoiBo(val.target.value);
    }
  };
  let renderHead = [
    {
      title: "Hạng mục",
      dataIndex: "hangMuc",
      key: "hangMuc",
      align: "center",
      width: 110,
    },
    {
      title: "Nội dung",
      dataIndex: "noiDung",
      key: "noiDung",
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
  let renderHeadSCL = [
    {
      title: "Lần",
      dataIndex: "key",
      key: "key",
      align: "center",
    },
    {
      title: "Lỗi",
      dataIndex: "tenLoi",
      key: "tenLoi",
      align: "center",
    },
    {
      title: "Thời gian vào",
      dataIndex: "thoiGianVao",
      key: "thoiGianVao",
      align: "center",
    },
    {
      title: "Người thực hiện",
      dataIndex: "tenNguoiSuaChuaLai",
      key: "tenNguoiSuaChuaLai",
      align: "center",
    },
    {
      title: "Thời gian ra",
      dataIndex: "thoiGianRa",
      key: "thoiGianRa",
      align: "center",
    },
    {
      title: "Nhân viên QC",
      dataIndex: "tenNguoiXacNhanSuaChuaLai",
      key: "tenNguoiXacNhanSuaChuaLai",
      align: "center",
    },
  ];
  const columnsSCL = map(renderHeadSCL, (col) => {
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
  let renderHeadKTP = [
    {
      title: "Kho",
      dataIndex: "tenCauTrucKho",
      key: "tenCauTrucKho",
      align: "center",
    },
    // {
    //   title:"Vị trí lưu",
    //   dataIndex: "viTriLuu",
    //   key: "viTriLuu",
    //   align: "center",
    // },
    {
      title: "Thời gian vào",
      dataIndex: "thoiGianVao",
      key: "thoiGianVao",
      align: "center",
    },
    {
      title: "Thời gian ra",
      dataIndex: "thoiGianRa",
      key: "thoiGianRa",
      align: "center",
    },
  ];
  const columnsKTP = map(renderHeadKTP, (col) => {
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
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={
          <>
            <p style={{ display: "inline" }}>Theo dõi tiến độ sản xuất</p>
            <a
              style={{
                cursor: "none",
                display: "inline",
                position: "absolute",
                right: 0,
                bottom: 0,
                fontSize: 15,
              }}
            >
              {formattedDateTime},{"  "} {formattedTime}
            </a>
          </>
        }
        description="Theo dõi tiến độ sản xuất"
      />
      <Card className="th-card-margin-bottom">
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
            <h5>Số khung:</h5>
            <Toolbar
              count={1}
              search={{
                title: "Nhập số khung",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchSoKhung,
                onSearch: onSearchSoKhung,
                placeholder: "Nhập số khung nội bộ",
                allowClear: true,
              }}
            />
          </Col>
        </Row>
      </Card>
      {InfoSanPham.tenSanPham && (
        <Card className="th-card-margin-bottom">
          <Card className="th-card-margin-bottom">
            <Row>
              <Col
                xxl={8}
                xl={12}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                style={{ marginBottom: 8, display: "flex" }}
              >
                Sản phẩm:&nbsp;&nbsp;
                <h5 style={{ fontWeight: "bold" }}>
                  {InfoSanPham.tenSanPham ? InfoSanPham.tenSanPham : ""}
                </h5>
              </Col>
              <Col
                xxl={8}
                xl={12}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                style={{ marginBottom: 8, display: "flex" }}
              >
                Đơn hàng:&nbsp;&nbsp;
                <h5 style={{ fontWeight: "bold" }}>
                  {InfoSanPham.tenDonHang ? InfoSanPham.tenDonHang : ""}
                </h5>
              </Col>
              <Col
                xxl={8}
                xl={12}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                style={{ marginBottom: 8, display: "flex" }}
              >
                Màu sơn:&nbsp;&nbsp;
                <h5 style={{ fontWeight: "bold" }}>
                  {InfoSanPham.tenMauSac ? InfoSanPham.tenMauSac : ""}
                </h5>
              </Col>
              <Col
                xxl={8}
                xl={12}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                style={{ marginBottom: 8, display: "flex" }}
              >
                Số khung nội bộ:&nbsp;&nbsp;
                <h5 style={{ fontWeight: "bold" }}>
                  {InfoSanPham.maNoiBo ? InfoSanPham.maNoiBo : ""}
                </h5>
              </Col>
              <Col
                xxl={8}
                xl={12}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                style={{ marginBottom: 8, display: "flex" }}
              >
                Lô:&nbsp;&nbsp;
                <h5 style={{ fontWeight: "bold" }}>
                  {InfoSanPham.maSoLo ? InfoSanPham.maSoLo : ""}
                </h5>
              </Col>
              <Col
                xxl={8}
                xl={12}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                style={{ marginBottom: 8, display: "flex" }}
              >
                Số VIN:&nbsp;&nbsp;
                <h5 style={{ fontWeight: "bold" }}>
                  {InfoSanPham.maSoVin ? InfoSanPham.maSoVin : ""}
                </h5>
              </Col>
            </Row>
          </Card>
          <Progress
            percent={InfoSanPham.phanTram}
            status="active"
            className="font-size-percent-20"
          />
          <Steps
            style={{ overflow: "auto" }}
            size="small"
            current={InfoSanPham.thuTuCongDoan && InfoSanPham.thuTuCongDoan - 1}
            status={
              InfoSanPham.thuTuCongDoan &&
              InfoSanPham.thuTuCongDoan === InfoSanPham.list_CongDoans.length &&
              "finish"
            }
            items={
              InfoSanPham.list_CongDoans
                ? InfoSanPham.list_CongDoans.map((cd) => {
                    return {
                      ...cd,
                      title: cd.tenCongDoan,
                      description: (
                        <Table
                          bordered
                          // scroll={{ x: 100 }}
                          style={{ heigth: 222.13 }}
                          columns={columns}
                          components={components}
                          className="gx-table-responsive heigth-table"
                          dataSource={[
                            {
                              hangMuc: "Thời gian vào trạm",
                              noiDung: cd.thoiGianVaoCongDoan,
                            },
                            {
                              hangMuc: "Số trạm kiểm soát đã đi qua",
                              noiDung: cd.soTramDaDiQua,
                            },
                            {
                              hangMuc: "Lỗi",
                              noiDung: cd.loi,
                            },
                            //  {
                            //   hangMuc: "HSCL",
                            //   noiDung: cd.thoiGianVaoCongDoan
                            // },
                            {
                              hangMuc: "Thời gian ra trạm",
                              noiDung: cd.thoiGianRaCongDoan,
                            },
                          ]}
                          size="small"
                          pagination={false}
                        />
                      ),
                    };
                  })
                : []
            }
          />
          <Row style={{ marginTop: 10 }}>
            {InfoSanPham.list_SuaChuaLais.length > 0 && (
              <Col xl={12} lg={24}>
                <Card
                  className="th-card-margin-bottom"
                  title="SỬA CHỮA LẠI"
                  bodyStyle={{ padding: "24px 0 0 0" }}
                >
                  <Table
                    bordered
                    scroll={{ x: 600 }}
                    columns={columnsSCL}
                    components={components}
                    className="gx-table-responsive"
                    dataSource={reDataForTable(InfoSanPham.list_SuaChuaLais)}
                    size="small"
                    pagination={false}
                  />
                </Card>
              </Col>
            )}
            {InfoSanPham.luuKhoThanhPham && (
              <Col xl={12} lg={24}>
                <Card
                  className="th-card-margin-bottom"
                  title="KHO THÀNH PHẨM"
                  bodyStyle={{ padding: "24px 0 0 0" }}
                >
                  <Table
                    bordered
                    // scroll={{ x: 100 }}
                    columns={columnsKTP}
                    components={components}
                    className="gx-table-responsive"
                    dataSource={reDataForTable([InfoSanPham.luuKhoThanhPham])}
                    size="small"
                    pagination={false}
                  />
                </Card>
              </Col>
            )}
          </Row>
        </Card>
      )}
    </div>
  );
}

export default TheoDoiTienDoSanXuat;
