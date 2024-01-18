import { Col, Image, Row } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Table } from "src/components/Common";

function ChiTietManHinh({ match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [DataChiTietManHinh, setDataChiTietManHinh] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const { id } = match.params;
    getListData(id);
    const interval = setInterval(() => getListData(id), 10000);
    const timerID = setInterval(() => setTime(new Date()), 1000);
    return () => {
      if (interval) clearInterval(interval);
      clearInterval(timerID);
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ManHinh/man-hinh/${id}`,
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
          const newManHinh = {
            ...res.data,
            list_ChiTiets: res.data.list_ChiTiets.map((data) => {
              return {
                ...data,
                tenSanPham: data.isTong === true ? "Tổng" : data.tenSanPham,
              };
            }),
          };
          setDataChiTietManHinh(newManHinh);
        }
      })
      .catch((error) => console.error(error));
  };

  const renderNgayThang = () => {
    const dateString = moment(time).format("DD/MM/YYYY");
    const timeString = time.toLocaleTimeString("vi-VN", { hour12: false });

    return (
      <>
        <h5
          style={{
            fontSize: 30,
            fontWeight: "bold",
            color: "red",
            textAlign: "right",
            marginRight: 20,
          }}
        >
          <span>{dateString}</span>
          <br />
          <span>{timeString}</span>
        </h5>
      </>
    );
  };

  let columnValues = [
    {
      title: "SẢN PHẨM",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      width: "35%",
      render: (value, record) => {
        return (
          <span
            style={{
              fontSize: "30px",
              color: record.isTong === true ? "red" : "blue",
              fontWeight: record.isTong === true && "bold",
              backgroundColor: record.isTong === true && "bold",
            }}
          >
            {value}
          </span>
        );
      },
      onCell: (record) => ({
        colSpan: record.tenSanPham === "Tổng" ? 3 : 1,
      }),
    },
    {
      title: "ĐƠN HÀNG",
      dataIndex: "tenDonHang",
      key: "tenDonHang",
      width: "13%",
      render: (value, record) => {
        return (
          <span
            style={{
              fontSize: "30px",
              color: record.isTong === true ? "red" : "blue",
              fontWeight: record.isTong === true && "bold",
              backgroundColor: record.isTong === true && "bold",
            }}
          >
            {value}
          </span>
        );
      },
      onCell: (record) => ({
        colSpan: record.tenSanPham === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: "ĐƠN VỊ TÍNH",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: "12%",
      render: (value, record) => {
        return (
          <span
            style={{
              fontSize: "30px",
              color: record.isTong === true ? "red" : "blue",
              fontWeight: record.isTong === true && "bold",
            }}
          >
            {value}
          </span>
        );
      },
      onCell: (record) => ({
        colSpan: record.tenSanPham === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: "KẾ HOẠCH",
      dataIndex: "keHoach",
      key: "keHoach",
      align: "center",
      width: "10%",
      render: (value, record) => {
        return (
          <span
            style={{
              fontSize: "30px",
              color: record.isTong === true ? "red" : "blue",
              fontWeight: record.isTong === true && "bold",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "THỰC HIỆN",
      dataIndex: "thucHien",
      key: "thucHien",
      align: "center",
      width: "10%",
      render: (value, record) => {
        return (
          <span
            style={{
              fontSize: "30px",
              color: record.isTong === true ? "red" : "blue",
              fontWeight: record.isTong === true && "bold",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "CHÊNH LỆCH",
      dataIndex: "chenhLech",
      key: "chenhLech",
      align: "center",
      width: "10%",
      render: (value, record) => {
        return (
          <span
            style={{
              fontSize: "30px",
              color: record.isTong === true ? "red" : "blue",
              fontWeight: record.isTong === true && "bold",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "LŨY KẾ",
      dataIndex: "luyKe",
      key: "luyKe",
      align: "center",
      width: "10%",
      render: (value, record) => {
        return (
          <span
            style={{
              fontSize: "30px",
              color: record.isTong === true ? "red" : "blue",
              fontWeight: record.isTong === true && "bold",
            }}
          >
            {value}
          </span>
        );
      },
    },
  ];

  return (
    <div
      className="th-dashboard"
      style={{
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#f3f2d3",
        padding: "50px 30px 30px 30px",
      }}
    >
      <Row className="th-table-row-background" style={{ marginBottom: 30 }}>
        <Col md={4} xs={24}>
          <Image
            preview={false}
            src={require("src/assets/images/logo-industries.jpg")}
          />
        </Col>
        <Col md={15} xs={24}>
          <h1
            style={{
              color: "red",
              fontSize: 50,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            <strong>
              {DataChiTietManHinh && DataChiTietManHinh.tenManHinh}
            </strong>
          </h1>
        </Col>
        <Col md={5} xs={24}>
          {renderNgayThang()}
        </Col>
      </Row>
      <Table
        // scroll={{ x: 1400 }}
        bordered
        columns={columnValues}
        className="gx-table-responsive th-dashboard"
        dataSource={DataChiTietManHinh.list_ChiTiets}
        size="middle"
        rowClassName={"editable-row"}
        pagination={false}
        loading={loading}
      />
    </div>
  );
}

export default ChiTietManHinh;
