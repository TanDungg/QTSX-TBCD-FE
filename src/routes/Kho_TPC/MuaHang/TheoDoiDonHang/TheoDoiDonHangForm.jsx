import { PrinterOutlined } from "@ant-design/icons";
import { Card, Row, Col, Tag, Button, DatePicker, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Table, EditableTableRow, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  FileName,
  convertObjectToUrlParams,
  exportExcel,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";
import moment from "moment";
import dayjs from "dayjs";

const { EditableRow, EditableCell } = EditableTableRow;

const TheoDoiDonHangForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [id, setId] = useState(undefined);
  const [listVatTu, setListVatTu] = useState([]);
  const [FileNhanHang, setFileNhanHang] = useState([]);
  const [info, setInfo] = useState({});
  const [ListNguoiThuMua, setListNguoiThuMua] = useState([]);

  useEffect(() => {
    const load = () => {
      if (permission && permission.edit) {
        const { id } = match.params;
        setId(id);
        getInfo(id);
        getUserThuMua(INFO);
      } else if (permission && !permission.edit) {
        history.push("/home");
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
          setInfo(res.data);
          const chiTiet = JSON.parse(res.data.chiTietTheoDoiDonHang).map(
            (data) => {
              return {
                ...data,
                userThuMua_Id:
                  data.userThuMua_Id && data.userThuMua_Id.toLowerCase(),
                ngayXacNhanHangVe: data.ngayXacNhanHangVe
                  ? data.ngayXacNhanHangVe
                  : getDateNow(),
              };
            }
          );
          setListVatTu(chiTiet);
          res.data.fileNhanHang &&
            setFileNhanHang(JSON.parse(res.data.fileNhanHang));
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
      donVi_Id: info.donVi_Id,
      phanMem_Id: info.phanMem_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhanHang/list-user-thu-mua?${params}`,
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
        setListNguoiThuMua(res.data);
      } else {
        setListNguoiThuMua([]);
      }
    });
  };

  const actionContent = (item) => {
    const CapNhat = () => {
      const newData = {
        id: item.lkn_ChiTietPhieuMuaHangs_Id,
        ngayXacNhanHangVe: item.ngayXacNhanHangVe,
        userThuMua_Id: item.userThuMua_Id,
      };

      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiMuaHang/put-ngay-xac-nhan-hang-ve?id=${item.lkn_ChiTietPhieuMuaHangs_Id}`,
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
          getUserThuMua(INFO);
          getInfo(id);
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
            className="th-margin-bottom-0"
            style={{
              height: 30,
              lineHeight: 0,
              width: 80,
              fontSize: 13,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            type={item.soLuongNhan > 0 ? "" : "primary"}
            ghost
            onClick={CapNhat}
            disabled={item.soLuongNhan > 0 ? true : false}
          >
            Cập nhật
          </Button>
        </Space>
      </div>
    );
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const renderNgayXacNhanHangVe = (record) => {
    if (record) {
      return (
        <div>
          <DatePicker
            format={"DD/MM/YYYY"}
            allowClear={false}
            disabledDate={disabledDate}
            onChange={(date, dateString) =>
              handleNgayXacNhanHangVe(dateString, record)
            }
            placeholder="Chọn ngày"
            value={moment(record.ngayXacNhanHangVe, "DD/MM/YYYY")}
            disabled={record.soLuongNhan > 0 ? true : false}
          />
        </div>
      );
    }
    return null;
  };

  const handleNgayXacNhanHangVe = (dateString, record) => {
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
            value={record.userThuMua_Id && record.userThuMua_Id}
            disabled={record.soLuongNhan > 0 ? true : false}
          />
        </div>
      );
    }
    return null;
  };

  const handleNguoiThuMua = (value, record) => {
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

  console.log(info);
  const formTitle = (
    <span>
      Chi tiết theo dõi đơn hàng -{" "}
      <Tag color="blue" style={{ fontSize: "14px" }}>
        {info.maPhieuYeuCau}
      </Tag>
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
              Ngày yêu cầu:
            </span>
            {info.ngayYeuCau}
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
                width: "200px",
                fontWeight: "bold",
              }}
            >
              Ngày dự kiến hoàn thành:
            </span>
            {info.ngayHoanThanhDukien}
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
              Ngày nhận hàng:
            </span>
            {info.ngayHangVe}
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
            scroll={{ x: 1500, y: "45vh" }}
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
