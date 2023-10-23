import { DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import { Card, Row, Col, Tag, Button, DatePicker, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";
import React, { useEffect, useState } from "react";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  Table,
  ModalDeleteConfirm,
  EditableTableRow,
  Select,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  FileName,
  convertObjectToUrlParams,
  exportExcel,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;

const TheoDoiDonHangForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [listVatTu, setListVatTu] = useState([]);
  const [FileNhanHang, setFileNhanHang] = useState([]);
  const [info, setInfo] = useState({});
  const [NgayXacNhanHangVe, setNgayXacNhanHangVe] = useState([]);
  const [NguoiThuMua, setNguoiThuMua] = useState([]);
  const [ListNguoiThuMua, setListNguoiThuMua] = useState([]);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserThuMua(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhanHang/theo-doi-don-hang/${id}?donVi_Id=${INFO.donVi_Id}`,
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
          const data = res.data;
          setInfo(data);
          const chiTiet = JSON.parse(res.data.chiTietTheoDoiDonHang);
          setListVatTu(chiTiet);
          console.log(chiTiet);
          const newNgay = [];
          const newNguoiThuMua = [];

          chiTiet.forEach((ct, index) => {
            newNgay[ct.lkn_ChiTietPhieuMuaHangs_Id] = ct.ngayXacNhanHangVe
              ? ct.ngayXacNhanHangVe
              : null;

            newNguoiThuMua[ct.lkn_ChiTietPhieuMuaHangs_Id] = ct.userThuMua_Id
              ? ct.userThuMua_Id
              : null;
          });

          setNgayXacNhanHangVe(newNgay);
          setNguoiThuMua(newNguoiThuMua);
          data.fileNhanHang && setFileNhanHang(JSON.parse(data.fileNhanHang));
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang bộ phận
   *
   */
  const goBack = () => {
    history.push(`${match.url.replace(`/${id}/chi-tiet`, "")}`);
  };

  const getUserThuMua = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}`,
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
        setListNguoiThuMua(res.data.datalist);
      } else {
        setListNguoiThuMua([]);
      }
    });
  };

  const actionContent = (item) => {
    const CapNhat = () => {
      const newData = {
        id: item.lkn_ChiTietPhieuMuaHangs_Id,
        ngayXacNhanHangVe:
          NgayXacNhanHangVe &&
          NgayXacNhanHangVe[item.lkn_ChiTietPhieuMuaHangs_Id],
        userThuMua_Id:
          NguoiThuMua && NguoiThuMua[item.lkn_ChiTietPhieuMuaHangs_Id],
      };
      console.log(newData);

      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiMuaHang/put-ngay-xac-nhan-hang-ve/${item.lkn_ChiTietPhieuMuaHangs_Id}`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            getUserThuMua(INFO);
            getInfo(id);
          }
        })
        .catch((error) => console.error(error));
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Space className="site-button-ghost-wrapper" wrap>
          <Button
            className="th-btn-margin-bottom-0"
            style={{
              height: 30,
              lineHeight: 0,
              width: 80,
              fontSize: 13,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            type={"primary"}
            ghost
            onClick={CapNhat}
          >
            Cập nhật
          </Button>
        </Space>
      </div>
    );
  };

  const renderNgayXacNhanHangVe = (record) => {
    if (record) {
      return (
        <div>
          <DatePicker
            format={"DD/MM/YYYY"}
            allowClear={false}
            onChange={(date, dateString) =>
              handleNgayXacNhanHangVe(dateString, record)
            }
            placeholder="Chọn ngày"
            value={
              NgayXacNhanHangVe &&
              moment(
                NgayXacNhanHangVe[record.lkn_ChiTietPhieuMuaHangs_Id],
                "DD/MM/YYYY"
              )
            }
          />
        </div>
      );
    }
    return null;
  };

  const handleNgayXacNhanHangVe = (dateString, record) => {
    setNgayXacNhanHangVe((prevNgayXacNhanHangVe) => ({
      ...prevNgayXacNhanHangVe,
      [record.lkn_ChiTietPhieuMuaHangs_Id]: dateString,
    }));

    setListVatTu((prevListVatTu) => {
      return prevListVatTu.map((item) => {
        if (
          record.lkn_ChiTietPhieuMuaHangs_Id ===
          item.lkn_ChiTietPhieuMuaHangs_Id
        ) {
          return {
            ...item,
            ngayXacNhanHangVe: dateString && dateString,
          };
        }
        return item;
      });
    });
  };

  const renderNguoiThuMua = (record) => {
    if (record) {
      return (
        <div>
          <Select
            className="heading-select slt-search th-select-heading"
            data={ListNguoiThuMua}
            placeholder="Người thu mua"
            optionsvalue={["user_Id", "fullName"]}
            style={{ width: "100%" }}
            showSearch
            optionFilterProp="name"
            onSelect={(value) => handleNguoiThuMua(value, record)}
            value={
              NguoiThuMua && NguoiThuMua[record.lkn_ChiTietPhieuMuaHangs_Id]
            }
          />
        </div>
      );
    }
    return null;
  };

  const handleNguoiThuMua = (value, record) => {
    console.log(value);
    setNguoiThuMua((prevNguoiThuMua) => ({
      ...prevNguoiThuMua,
      [record.lkn_ChiTietPhieuMuaHangs_Id]: value,
    }));

    setListVatTu((prevListVatTu) => {
      return prevListVatTu.map((item) => {
        if (
          record.lkn_ChiTietPhieuMuaHangs_Id ===
          item.lkn_ChiTietPhieuMuaHangs_Id
        ) {
          return {
            ...item,
            userThuMua_Id: value && value,
          };
        }
        return item;
      });
    });
  };

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      fixed: "left",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      width: 180,
      fixed: "left",
    },
    {
      title: "Nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
      align: "center",
      width: 120,
      fixed: "left",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 80,
    },
    {
      title: "SL mua",
      dataIndex: "soLuongMua",
      key: "soLuongMua",
      align: "center",
      width: 80,
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
      width: 100,
    },
    {
      title: "Ngày dự kiến hoàn thành",
      dataIndex: "ngayHoanThanhDukien",
      key: "ngayHoanThanhDukien",
      align: "center",
      width: 140,
    },
    {
      title: "Ngày xác nhận hàng về",
      key: "ngayXacNhanHangVe",
      align: "center",
      width: 140,
      render: (record) => renderNgayXacNhanHangVe(record),
    },
    {
      title: "CV Thu mua",
      key: "tenThuMua",
      align: "center",
      width: 180,
      render: (record) => renderNguoiThuMua(record),
    },
    {
      title: "Ngày nhận hàng",
      dataIndex: "ngayHangVe",
      key: "ngayHangVe",
      align: "center",
      width: 140,
    },
    {
      title: "SL hàng nhận",
      dataIndex: "soLuongNhan",
      key: "soLuongNhan",
      align: "center",
      width: 80,
    },
    {
      title: "SL còn thiếu",
      dataIndex: "soLuongConThieu",
      key: "soLuongConThieu",
      align: "center",
      width: 80,
    },
    {
      title: "SL dư",
      dataIndex: "soLuongDu",
      key: "soLuongDu",
      align: "center",
      width: 80,
    },
    {
      title: "Kết quả",
      dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
      width: 100,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      width: 100,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const handleSave = (row) => {
    const newData = [...listVatTu];
    const index = newData.findIndex((item) => row.vatTu_Id === item.vatTu_Id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setListVatTu(newData);
  };

  const handlePrint = () => {
    const newData = listVatTu.map((data) => {
      return {
        ...info,
        ...data,
      };
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhanHang/export-file-excel-theo-doi-don-hang`,
          "POST",
          newData,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("PhieuTheoDoiDonHang-", res.data.dataexcel);
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PrinterOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handlePrint}
          disabled={permission && !permission.print}
        >
          Xuất Excel
        </Button>
      </>
    );
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
        handleSave: handleSave,
      }),
    };
  });

  const formTitle = (
    <span>
      Chi tiết theo dõi đơn hàng - <Tag color="green">{info.maPhieuYeuCau}</Tag>
    </span>
  );

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={formTitle}
        back={goBack}
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom" style={{ padding: "0px 10px" }}>
        <Row style={{ marginLeft: 2 }}>
          <Col>
            <img
              src={require("assets/images/usercall.png")}
              alt="usercall"
              width={40}
              height={40}
              style={{ marginRight: 10 }}
            />
          </Col>
          <h4 style={{ fontWeight: "bold" }}>
            Phiếu yêu cầu mua hàng -{" "}
            <Tag color="blue" style={{ marginBottom: 0 }}>
              {info && info.maPhieuYeuCau}
            </Tag>
            {/* <br /> */}
            <h5 style={{ color: "#0469B9" }}>
              Người yêu cầu:{" "}
              <Tag color="blue" style={{ margin: 0 }}>
                {info && info.tenNguoiYeuCau}
              </Tag>
            </h5>
          </h4>
        </Row>
        <Row>
          <Col
            xxl={12}
            xl={12}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: "140px",
                fontWeight: "bold",
              }}
            >
              Bộ phận yêu cầu:
            </span>
            {info.tenPhongBan}
          </Col>
          <Col
            xxl={12}
            xl={12}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: "140px",
                fontWeight: "bold",
              }}
            >
              Ngày hoàn thành:
            </span>
            {info.ngayHoanThanhDukien}
          </Col>
          <Col
            span={24}
            style={{
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: "140px",
                fontWeight: "bold",
              }}
            >
              File đính kèm:
            </span>
            {FileNhanHang.length !== 0 &&
              FileNhanHang.map((file, index) => (
                <a
                  key={index}
                  href={`${BASE_URL_API}${file.fileDinhKem}`}
                  title={`${BASE_URL_API}${file.fileDinhKem}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginRight: 5 }}
                >
                  {file && FileName(file.fileDinhKem)},
                </a>
              ))}
          </Col>
        </Row>
        <Row>
          <Col
            span={24}
            style={{
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: "140px",
                fontWeight: "bold",
              }}
            >
              Thông tin vật tư:
            </span>
          </Col>
          <Table
            bordered
            columns={columns}
            scroll={{ x: 1720, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(listVatTu)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
            loading={loading}
          />
        </Row>
      </Card>
    </div>
  );
};

export default TheoDoiDonHangForm;
