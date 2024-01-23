import React, { useEffect, useState } from "react";
import { Card, Row, Col, Image, Modal as AntModal, Divider, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  exportPDF,
  reDataForTable,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import {
  DownloadOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import { EditableTableRow, Table, Toolbar } from "src/components/Common";
import { find, isEmpty, map } from "lodash";

const { EditableRow, EditableCell } = EditableTableRow;

function TraCuuThongTinXe({ history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");
  const [Data, setData] = useState(null);
  const [DataHoSoChatLuong, setDataHoSoChatLuong] = useState([]);
  const [ActiveModalHoSoChatLuong, setActiveModalHoSoChatLuong] =
    useState(false);
  const [ListThongTinVatTu, setListThongTinVatTu] = useState([]);
  const [ListChungTu, setListChungTu] = useState([]);
  const [ActiveModalThongTinVatTu, setActiveModalThongTinVatTu] =
    useState(false);
  const [ListFileChungTu, setListFileChungTu] = useState([]);
  const [ActiveModalFileChungTu, setActiveModalFileChungTu] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (keyword) => {
    const param = convertObjectToUrlParams({
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/tra-cuu-thong-tin-xe?${param}`,
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
          XemHoSoChatLuong(
            res.data.tits_qtsx_SoLoChiTiet_Id &&
              res.data.tits_qtsx_SoLoChiTiet_Id
          );

          const listchungtu = [];
          const newListVatTuLinhKien =
            res.data.list_VatTuLapRaps &&
            res.data.list_VatTuLapRaps.map((vattu) => {
              const chungtu =
                vattu.list_ChungTu && JSON.parse(vattu.list_ChungTu);
              chungtu && console.log(chungtu);

              if (chungtu) {
                chungtu.forEach((ct) => {
                  if (!listchungtu.includes(ct.maChungTu)) {
                    listchungtu.push(ct.maChungTu);
                  }
                });
              }
              return {
                ...vattu,
                list_ChungTu: chungtu,
              };
            });

          const newListVatTuThep =
            res.data.list_VatTuTheps &&
            res.data.list_VatTuTheps.map((vattu) => {
              const chungtu =
                vattu.list_ChungTu && JSON.parse(vattu.list_ChungTu);
              chungtu && console.log(chungtu);

              if (chungtu) {
                chungtu.forEach((ct) => {
                  if (!listchungtu.includes(ct.maChungTu)) {
                    listchungtu.push(ct.maChungTu);
                  }
                });
              }
              return {
                ...vattu,
                list_ChungTu: chungtu,
              };
            });
          setListChungTu(listchungtu);
          setListThongTinVatTu([...newListVatTuLinhKien, ...newListVatTuThep]);
        } else {
          setData(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const TaiHoSoChatLuong = (item) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_CongDoan_Id: item.tits_qtsx_CongDoan_Id,
      tits_qtsx_SoLoChiTiet_Id: Data.tits_qtsx_SoLoChiTiet_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/export-pdf-ho-so-kiem-soat-chat-luong?${param}`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          exportPDF("HoSoChatLuong", res.data.datapdf);
        }
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const xemhoso =
      item.tenCongDoan === "Tất cả" || item.isHoanThanh
        ? { onClick: () => TaiHoSoChatLuong(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a
            {...xemhoso}
            title="Xem hồ sơ chất lượng"
            style={{ fontSize: "18px" }}
          >
            <DownloadOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let colChiTiet = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      render: (value, record) => {
        return (
          <span
            style={{
              color: record.tenCongDoan === "Tất cả" && "#000",
              fontWeight: record.tenCongDoan === "Tất cả" && "bold",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
      onCell: (record) => ({
        colSpan: record.tenCongDoan === "Tất cả" ? 3 : 1,
      }),
      render: (value, record) => {
        return (
          <span
            style={{
              color: record.tenCongDoan === "Tất cả" && "#000",
              fontWeight: record.tenCongDoan === "Tất cả" && "bold",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "Thời gian kiểm tra",
      dataIndex: "thoiGianKiemTra",
      key: "thoiGianKiemTra",
      align: "center",
      onCell: (record) => ({
        colSpan: record.tenCongDoan === "Tất cả" ? 0 : 1,
      }),
    },
    {
      title: "Tình trạng",
      dataIndex: "isHoanThanh",
      key: "isHoanThanh",
      align: "center",
      render: (value, record) => {
        return (
          <Tag color={value === true ? "blue" : "red"}>
            {value === true ? "Đã hoàn thành" : "Chưa hoàn thành"}
          </Tag>
        );
      },
      onCell: (record) => ({
        colSpan: record.tenCongDoan === "Tất cả" ? 0 : 1,
      }),
    },
    {
      title: "Hồ sơ",
      align: "center",
      width: 150,
      render: (record) => actionContent(record),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columnschitiet = map(colChiTiet, (col) => {
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

  let columnFileChungTu = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã chứng từ",
      dataIndex: "maChungTu",
      key: "maChungTu",
      align: "center",
    },
    {
      title: "Tên chứng từ",
      dataIndex: "tenChungTu",
      key: "tenChungTu",
      align: "center",
    },
    {
      title: "File chứng từ",
      dataIndex: "fileChungTu",
      key: "fileChungTu",
      align: "left",
      render: (value) => (
        <a
          target="_blank"
          href={BASE_URL_API + value}
          rel="noopener noreferrer"
          style={{
            whiteSpace: "break-spaces",
            wordBreak: "break-all",
          }}
        >
          {value && value.split("/")[5]}{" "}
        </a>
      ),
    },
  ];

  const renderFileChungTu = (record, chungTu) => {
    if (record.list_ChungTu.length !== 0) {
      const item = find(record.list_ChungTu, ["maChungTu", chungTu]);
      if (item) {
        return (
          <a href={item.fileChungTu} target="_blank" rel="noopener noreferrer">
            {item.fileChungTu}
          </a>
        );
      }
      return null;
    }
    return null;
  };

  let columnThongTinVatTu = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      width: 200,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "left",
      width: 350,
    },
  ];

  const onSearchThongTinXe = (val) => {
    if (!isEmpty(val)) {
      getListData(keyword);
    }
  };

  const XemHoSoChatLuong = (tits_qtsx_SoLoChiTiet_Id) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_SoLoChiTiet_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/cong-doan-trong-ho-so-kiem-soat-chat-luong?${param}`,
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
          const newData = {
            tits_qtsx_CongDoan_Id: null,
            tenCongDoan: "Tất cả",
          };
          setDataHoSoChatLuong([...res.data, newData]);
        } else {
          setDataHoSoChatLuong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value);
    }
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Tra cứu thông tin xe"
        description="Tra cứu thông tin xe"
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row align="center">
          <Col align="center" xxl={8} xl={10} lg={10} md={12} sm={24}>
            <Toolbar
              count={1}
              search={{
                title: "Nhập số khung xe",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchThongTinXe,
                onSearch: onSearchThongTinXe,
                placeholder: "Nhập số khung xe",
                allowClear: true,
              }}
            />
          </Col>
          {/* <Input
            placeholder="Nhập số khung xe"
            value={keyword}
            style={{
              marginRight: "20px",
              marginBottom: "10px",
              width: "350px",
            }}
            onChange={(value) => onChangeKeyword(value)}
          />
          <Button
            className="th-margin-bottom-0"
            type="primary"
            style={{ marginTop: 8 }}
            onClick={onSearchThongTinXe}
          >
            Tìm kiếm
          </Button> */}
        </Row>
      </Card>
      {Data ? (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row
            style={{
              padding: "0px 50px",
            }}
          >
            <Col lg={12} xs={24}>
              <Row>
                <Col
                  span={24}
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <h4
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    {Data.tenSanPham} ({Data.maNoiBo})
                  </h4>
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      width: "100px",
                      fontWeight: "bold",
                    }}
                  >
                    Loại xe:
                  </span>
                  {Data && (
                    <span
                      style={{
                        width: "calc(100% - 100px)",
                      }}
                    >
                      {Data.tenLoaiSanPham}
                    </span>
                  )}
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      width: "100px",
                      fontWeight: "bold",
                    }}
                  >
                    Màu sắc:
                  </span>
                  <span
                    style={{
                      width: "calc(100% - 100px)",
                    }}
                  >
                    {Data.tenMauSac}
                  </span>
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      width: "180px",
                      fontWeight: "bold",
                    }}
                  >
                    Ngày kích hoạt bảo hành:
                  </span>
                  {Data && (
                    <span
                      style={{
                        width: "calc(100% - 180px)",
                      }}
                    >
                      {Data.ngayXuatXuong}
                    </span>
                  )}
                </Col>
              </Row>
            </Col>
            <Col lg={12} xs={24}>
              <Image
                src={BASE_URL_API + Data.hinhAnh}
                alt="Hình ảnh"
                style={{ maxWidth: "100%", maxHeight: "120px" }}
              />
            </Col>
          </Row>
        </Card>
      ) : null}
      {Data ? (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row
            style={{
              padding: "0px 50px ",
              marginBottom: "20px",
            }}
          >
            <Col
              span={24}
              style={{
                marginBottom: 10,
              }}
            >
              <h4
                style={{
                  fontWeight: "bold",
                }}
              >
                Lịch sử sản xuất
              </h4>
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Đơn hàng:
              </span>
              {Data && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {Data.tenDonHang}
                </span>
              )}
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Ngày xuất xưởng:
              </span>
              <span
                style={{
                  width: "calc(100% - 140px)",
                }}
              >
                {Data.ngayXuatXuong}
              </span>
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Số lô:
              </span>
              <span
                style={{
                  width: "calc(100% - 140px)",
                }}
              >
                {Data.maSoLo}
              </span>
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Ngày bàn giao:
              </span>
              <span
                style={{
                  width: "calc(100% - 140px)",
                }}
              >
                {Data.ngayBanGiao}
              </span>
            </Col>
          </Row>
          <Row
            style={{
              padding: "0px 50px",
            }}
          >
            {Data.list_CongDoans &&
              Data.list_CongDoans.map((congdoan) => {
                return (
                  <Col
                    lg={12}
                    xs={24}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        width: "140px",
                        fontWeight: "bold",
                      }}
                    >
                      {congdoan.tenCongDoan}
                    </span>
                    <div
                      style={{
                        width: "calc(100% - 140px)",
                        alignItems: "start",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <span
                        style={{
                          borderBottom: "2px solid #c8c8c8",
                          borderLeft: "2px solid #c8c8c8",
                          display: "block",
                          boxSizing: "border-box",
                          padding: "5px",
                          width: "180px",
                          fontSize: "14px",
                        }}
                      >
                        <RightCircleOutlined
                          style={{
                            color: "#0469B9",
                            marginRight: "10px",
                          }}
                        />
                        {congdoan.thoiGianVaoCongDoan}
                      </span>
                      <span
                        style={{
                          borderLeft: "2px solid #c8c8c8",
                          display: "block",
                          boxSizing: "border-box",
                          padding: "5px",
                          width: "180px",
                          fontSize: "14px",
                        }}
                      >
                        <LeftCircleOutlined
                          style={{
                            color: "#0469B9",
                            marginRight: "10px",
                          }}
                        />
                        {congdoan.thoiGianRaCongDoan}
                      </span>
                    </div>
                  </Col>
                );
              })}
          </Row>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "0px 50px",
            }}
          >
            <span
              onClick={() => setActiveModalHoSoChatLuong(true)}
              style={{
                fontWeight: "bold",
                color: "#0469b9",
                cursor: "pointer",
              }}
            >
              Xem hồ sơ kiểm tra chất lượng
            </span>
          </div>
        </Card>
      ) : null}
      {Data ? (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <div
            style={{
              padding: "0px 50px ",
            }}
          >
            <Row
              span={24}
              style={{
                marginBottom: 10,
              }}
            >
              <h4
                style={{
                  fontWeight: "bold",
                }}
              >
                Thông tin vật tư
              </h4>
            </Row>
            <Row span={24}>
              <Col
                lg={12}
                xs={24}
                style={{
                  borderRight: "2px solid #c8c8c8",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#0469B9",
                      fontWeight: "bold",
                      fontSize: "15px",
                    }}
                  >
                    Vật tư linh kiện
                  </span>
                </div>
                <Divider style={{ marginBottom: "10px" }} />
                <div
                  style={{
                    height: "450px",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  {Data.list_VatTuLapRaps &&
                    Data.list_VatTuLapRaps.map((vattu, index) => {
                      return (
                        <div
                          style={{
                            display: "flex",
                            marginBottom: "20px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "bold",
                              marginRight: "5px",
                            }}
                          >
                            {index + 1}.
                          </span>
                          <Row
                            gutter={[0, 8]}
                            style={{
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "100px",
                                  fontWeight: "bold",
                                }}
                              >
                                Tên vật tư:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 100px)",
                                }}
                              >
                                {vattu.tenVatTu}
                              </span>
                            </Col>
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "130px",
                                  fontWeight: "bold",
                                }}
                              >
                                Mã hợp đồng:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 130px)",
                                }}
                              >
                                {vattu.maHopDong && vattu.maHopDong}
                              </span>
                            </Col>
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "130px",
                                  fontWeight: "bold",
                                }}
                              >
                                Nhập kho:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 130px)",
                                }}
                              >
                                {vattu.ngayNhapKho && vattu.ngayNhapKho}
                              </span>
                            </Col>
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "130px",
                                  fontWeight: "bold",
                                }}
                              >
                                Người nhập kho:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 130px)",
                                }}
                              >
                                {vattu.tenNguoiNhap && vattu.tenNguoiNhap}
                              </span>
                            </Col>
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "130px",
                                  fontWeight: "bold",
                                }}
                              >
                                File chứng từ:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 130px)",
                                }}
                              >
                                {vattu.list_ChungTu && (
                                  <span
                                    onClick={() => {
                                      setListFileChungTu(
                                        JSON.parse(vattu.list_ChungTu)
                                      );
                                      setActiveModalFileChungTu(true);
                                    }}
                                    title="Xem file chứng từ"
                                    style={{
                                      color: "#0469b9",
                                      fontWeight: "bold",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Xem file chứng từ
                                  </span>
                                )}
                              </span>
                            </Col>
                          </Row>
                        </div>
                      );
                    })}
                </div>
              </Col>
              <Col lg={12} xs={24}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#0469B9",
                      fontWeight: "bold",
                      fontSize: "15px",
                    }}
                  >
                    Vật tư thép
                  </span>
                </div>
                <Divider style={{ marginBottom: "10px" }} />
                <div
                  style={{
                    height: "450px",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  {Data.list_VatTuTheps &&
                    Data.list_VatTuTheps.map((vattu, index) => {
                      return (
                        <div
                          style={{
                            display: "flex",
                            marginBottom: "20px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "bold",
                              marginRight: "5px",
                            }}
                          >
                            {index + 1}.
                          </span>
                          <Row
                            gutter={[0, 8]}
                            style={{
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "100px",
                                  fontWeight: "bold",
                                }}
                              >
                                Tên vật tư:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 100px)",
                                }}
                              >
                                {vattu.tenVatTu}
                              </span>
                            </Col>
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "130px",
                                  fontWeight: "bold",
                                }}
                              >
                                Mã hợp đồng:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 130px)",
                                }}
                              >
                                {vattu.maHopDong && vattu.maHopDong}
                              </span>
                            </Col>
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "130px",
                                  fontWeight: "bold",
                                }}
                              >
                                Nhập kho:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 130px)",
                                }}
                              >
                                {vattu.ngayNhapKho && vattu.ngayNhapKho}
                              </span>
                            </Col>
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "130px",
                                  fontWeight: "bold",
                                }}
                              >
                                Người nhập kho:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 130px)",
                                }}
                              >
                                {vattu.tenNguoiNhap && vattu.tenNguoiNhap}
                              </span>
                            </Col>
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "130px",
                                  fontWeight: "bold",
                                }}
                              >
                                File chứng từ:
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 130px)",
                                }}
                              >
                                {vattu.list_ChungTu && (
                                  <span
                                    onClick={() => {
                                      setListFileChungTu(
                                        JSON.parse(vattu.list_ChungTu)
                                      );
                                      setActiveModalFileChungTu(true);
                                    }}
                                    title="Xem file chứng từ"
                                    style={{
                                      color: "#0469b9",
                                      fontWeight: "bold",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Xem file chứng từ
                                  </span>
                                )}
                              </span>
                            </Col>
                          </Row>
                        </div>
                      );
                    })}
                </div>
              </Col>
            </Row>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <span
                style={{
                  color: "#0469b9",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setActiveModalThongTinVatTu(true)}
              >
                Xem thông tin hồ sơ chi tiết
              </span>
            </div>
          </div>
        </Card>
      ) : null}
      <AntModal
        title={"Hồ sơ kiểm tra chất lượng"}
        className="th-card-reset-margin"
        open={ActiveModalHoSoChatLuong}
        width={"70%"}
        closable={true}
        onCancel={() => setActiveModalHoSoChatLuong(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Table
            bordered
            columns={columnschitiet}
            components={components}
            scroll={{ x: 1000, y: "55vh" }}
            className="gx-table-responsive"
            dataSource={reDataForTable(DataHoSoChatLuong)}
            size="small"
            loading={loading}
            pagination={false}
          />
        </Card>
      </AntModal>
      <AntModal
        title={"HỒ SƠ THÔNG TIN VẬT TƯ"}
        className="th-card-reset-margin"
        open={ActiveModalThongTinVatTu}
        width={"70%"}
        closable={true}
        onCancel={() => setActiveModalThongTinVatTu(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Table
            bordered
            columns={columnThongTinVatTu}
            components={components}
            scroll={{ x: 1000, y: "55vh" }}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(ListThongTinVatTu)}
            size="small"
            loading={loading}
            pagination={false}
          />
        </Card>
      </AntModal>
      <AntModal
        title={"Danh sách file chứng từ"}
        className="th-card-reset-margin"
        open={ActiveModalFileChungTu}
        width={"70%"}
        closable={true}
        onCancel={() => setActiveModalFileChungTu(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Table
            bordered
            columns={columnFileChungTu}
            components={components}
            scroll={{ x: 1000, y: "55vh" }}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(ListFileChungTu)}
            size="small"
            loading={loading}
            pagination={false}
          />
        </Card>
      </AntModal>
    </div>
  );
}

export default TraCuuThongTinXe;
