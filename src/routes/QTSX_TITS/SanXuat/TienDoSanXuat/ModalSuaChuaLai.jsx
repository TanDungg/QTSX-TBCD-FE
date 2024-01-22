import {
  Modal as AntModal,
  Form,
  Row,
  Input,
  Button,
  Col,
  Tag,
  Divider,
} from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Table, EditableTableRow, Modal } from "src/components/Common";
import ImageDrawing from "src/routes/QTSX_TITS/SanXuat/TienDoSanXuat/ImageDrawing";
import { BASE_URL_API } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";

import { SaveOutlined } from "@ant-design/icons";
import Helpers from "src/helpers";
const { EditableRow, EditableCell } = EditableTableRow;

function ModalSuaChuaLai({ openModalFS, openModal, info, refesh }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListHangMucKiemTra, setListHangMucKiemTra] = useState([]);
  const [ListLoi, setListLoi] = useState([]);
  const [ActiveXacNhanSCL, setActiveXacNhanSCL] = useState(false);
  const [ThoiGianVaoTram, setThoiGianVaoTram] = useState("");
  useEffect(() => {
    if (openModal) {
      setActiveXacNhanSCL(false);
      getHoSoChatLuong(info);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getHoSoChatLuong = (info) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_TienDoSanXuat_Id: info.tits_qtsx_TienDoSanXuat_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/vao-sua-chua-lai?${param}`,
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
        const newData = [];
        const newListLoi = [];
        // const newListTongLoi = [];
        res.data.list_TDSXKiemSoatChatLuongs &&
          res.data.list_TDSXKiemSoatChatLuongs.forEach((ks) => {
            ks.list_TDSXKiemSoatChatLuongTieuDePhus.forEach((tdp) => {
              tdp.list_TDSXKiemSoatChatLuongChiTiets =
                tdp.list_TDSXKiemSoatChatLuongChiTiets.filter(
                  (ksclct) =>
                    ksclct.list_TDSXKiemSoatChatLuongChiTietLois.length > 0
                );
              tdp.list_TDSXKiemSoatChatLuongChiTiets.forEach((ct) => {
                if (ct.list_TDSXKiemSoatChatLuongChiTietLois.length > 0) {
                  ct.list_TDSXKiemSoatChatLuongChiTietLois =
                    ct.list_TDSXKiemSoatChatLuongChiTietLois.filter(
                      (ctl) => ctl.isHoanThanhSCL === false
                    );
                  ct.list_TDSXKiemSoatChatLuongChiTietLois.forEach((Ctl) => {
                    Ctl.tenHangMucKiemTra = ks.tenHangMucKiemTra;
                    if (Ctl.nguoiSuaChuaLai_Id) {
                      Ctl.isHoanThanhSCL = true;
                      ct.ketQua = undefined;
                      ct.isDat = ct.isNoiDung ? true : ct.isDat;
                      Ctl.nguoiXacNhanSuaChuaLai_Id = getTokenInfo().id;
                      setActiveXacNhanSCL(true);
                    }
                    setThoiGianVaoTram(Ctl.thoiGianVao);
                    ks.list_HinhAnhs.forEach((ha) => {
                      if (
                        Ctl.tits_qtsx_SanPhamHinhAnh_Id ===
                        ha.tits_qtsx_SanPhamHinhAnh_Id
                      ) {
                        if (ha.listViTri) {
                          const viTriLoi = JSON.parse(Ctl.viTri);
                          viTriLoi.isHoanThanhSCL = Ctl.isHoanThanhSCL;
                          viTriLoi.maLoi = Ctl.maLoi;
                          viTriLoi.tenNhomLoi = Ctl.tenNhomLoi;
                          viTriLoi.moTa = Ctl.moTa;
                          viTriLoi.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id =
                            Ctl.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id;
                          viTriLoi.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id =
                            ct.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id;
                          ha.listViTri.push(JSON.stringify(viTriLoi));
                        } else {
                          const viTriLoi = JSON.parse(Ctl.viTri);
                          viTriLoi.isHoanThanhSCL = Ctl.isHoanThanhSCL;
                          viTriLoi.maLoi = Ctl.maLoi;
                          viTriLoi.tenNhomLoi = Ctl.tenNhomLoi;
                          viTriLoi.moTa = Ctl.moTa;
                          viTriLoi.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id =
                            Ctl.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id;
                          viTriLoi.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id =
                            ct.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id;
                          ha.listViTri = [JSON.stringify(viTriLoi)];
                        }
                      }
                    });
                    ks.list_HinhAnhs = ks.list_HinhAnhs.filter(
                      (ha) => ha.listViTri && ha.listViTri.length > 0
                    );
                  });
                  newListLoi.push(...ct.list_TDSXKiemSoatChatLuongChiTietLois);
                }
                if (
                  ct.list_TDSXKiemSoatChatLuongChiTietLois.length > 0 &&
                  !newData.some((item) => item === ks)
                ) {
                  newData.push(ks);
                }
              });
            });
          });
        setListLoi(newListLoi);
        console.log(newData);
        setListHangMucKiemTra(newData);
      } else {
        setListHangMucKiemTra([]);
      }
    });
  };
  let renderLoi = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã lỗi",
      dataIndex: "maLoi",
      key: "maLoi",
      align: "center",
    },
    {
      title: "Hạng mục kiểm tra",
      dataIndex: "tenHangMucKiemTra",
      key: "tenHangMucKiemTra",
      align: "center",
    },
    {
      title: "Nhóm lỗi",
      dataIndex: "tenNhomLoi",
      key: "tenNhomLoi",
      align: "center",
    },
    {
      title: "Mô tả lỗi",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
    },
    {
      title: "Ghi chú SCL",
      dataIndex: "moTaSCL",
      key: "moTaSCL",
      align: "center",
    },
    {
      title: "Người kiểm tra",
      dataIndex: "tenNguoiKiemTra",
      key: "tenNguoiKiemTra",
      align: "center",
    },
    {
      title: "Người SCL",
      dataIndex: "tenNguoiSuaChuaLai",
      key: "tenNguoiSuaChuaLai",
      align: "center",
    },
    {
      title: "Người xác nhận SCL",
      dataIndex: "tenXacNhanNguoiSuaChuaLai",
      key: "tenXacNhanNguoiSuaChuaLai",
      align: "center",
    },
  ];
  let renderNoiDung = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Nội dung",
      dataIndex: "noiDungKiemTra",
      key: "noiDungKiemTra",
      align: "center",
    },
    {
      title: "Tiêu chuẩn đánh giá",
      dataIndex: "tieuChuanDanhGia",
      key: "tieuChuanDanhGia",
      align: "center",
    },
    {
      title: "Giá trị tiêu chuẩn",
      dataIndex: "giaTriTieuChuan",
      key: "giaTriTieuChuan",
      align: "center",
    },
    {
      title: "Đánh giá",
      dataIndex: "isDat",
      key: "isDat",
      align: "center",
      render: (val) => (
        <Tag color={val ? "green" : "red"}>{val ? "Đạt" : "Không đạt"} </Tag>
      ),
    },
    {
      title: "Lỗi",
      dataIndex: "list_TDSXKiemSoatChatLuongChiTietLois",
      key: "list_TDSXKiemSoatChatLuongChiTietLois",
      align: "center",
      render: (val) =>
        val.map((l) => {
          return (
            <Tag color={l.isHoanThanhSCL ? "#0E42FA" : "#FF0101"}>
              {JSON.parse(l.viTri).maLoi}
            </Tag>
          );
        }),
    },
  ];
  const handleInputChange = (val, item) => {
    const ketQua = val.target.value;
    const newData = [...ListHangMucKiemTra];
    newData.forEach((ct, index) => {
      ct.list_TDSXKiemSoatChatLuongTieuDePhus.forEach((tdp) => {
        if (
          tdp.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id ===
          item.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id
        ) {
          tdp.list_TDSXKiemSoatChatLuongChiTiets.forEach((clct) => {
            if (
              clct.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id ===
              item.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id
            ) {
              clct.ketQua = ketQua;
              clct.isDat =
                item.giaTriMin <= ketQua && ketQua <= item.giaTriMax
                  ? true
                  : false;
              clct.list_TDSXKiemSoatChatLuongChiTietLois.forEach((Ctl) => {
                if (!clct.isDat) {
                  Ctl.isHoanThanhSCL = false;
                } else {
                  Ctl.isHoanThanhSCL = true;
                }
                ct.list_HinhAnhs.forEach((ha) => {
                  if (
                    Ctl.tits_qtsx_SanPhamHinhAnh_Id ===
                    ha.tits_qtsx_SanPhamHinhAnh_Id
                  ) {
                    if (ha.listViTri) {
                      const viTriLoi = JSON.parse(Ctl.viTri);
                      viTriLoi.isHoanThanhSCL = Ctl.isHoanThanhSCL;
                      viTriLoi.maLoi = Ctl.maLoi;
                      viTriLoi.tenNhomLoi = Ctl.tenNhomLoi;
                      viTriLoi.moTa = Ctl.moTa;
                      viTriLoi.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id =
                        Ctl.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id;
                      ha.listViTri.push(JSON.stringify(viTriLoi));
                    } else {
                      const viTriLoi = JSON.parse(Ctl.viTri);
                      viTriLoi.isHoanThanhSCL = Ctl.isHoanThanhSCL;
                      viTriLoi.maLoi = Ctl.maLoi;
                      viTriLoi.tenNhomLoi = Ctl.tenNhomLoi;
                      viTriLoi.moTa = Ctl.moTa;
                      viTriLoi.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id =
                        Ctl.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id;
                      ha.listViTri = [JSON.stringify(viTriLoi)];
                    }
                  }
                });
              });
            }
          });
        }
      });
    });
    setListHangMucKiemTra(newData);
  };

  const rendersoLuong = (item) => {
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.ketQua}
          onChange={(val) => handleInputChange(val, item)}
        />
      </>
    );
  };
  let renderThongSo = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Nội dung",
      dataIndex: "noiDungKiemTra",
      key: "noiDungKiemTra",
      align: "center",
    },
    {
      title: "Giá trị MIN",
      dataIndex: "giaTriMin",
      key: "giaTriMin",
      align: "center",
    },
    {
      title: "Giá trị MAX",
      dataIndex: "giaTriMax",
      key: "giaTriMax",
      align: "center",
    },
    {
      title: "Kết quả",
      // dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
      render: (val) => ActiveXacNhanSCL && rendersoLuong(val),
    },
    {
      title: "Đánh giá",
      dataIndex: "isDat",
      key: "isDat",
      align: "center",
      render: (val) => (
        <Tag color={val ? "green" : "red"}>{val ? "Đạt" : "Không đạt"} </Tag>
      ),
    },
    {
      title: "Lỗi",
      dataIndex: "list_TDSXKiemSoatChatLuongChiTietLois",
      key: "list_TDSXKiemSoatChatLuongChiTietLois",
      align: "center",
      render: (val) =>
        val.map((l) => {
          return (
            <Tag color={l.isHoanThanhSCL ? "#0E42FA" : "#FF0101"}>
              {l.maLoi}
            </Tag>
          );
        }),
    },
  ];
  const columnLoi = map(renderLoi, (col) => {
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
  const columnThongSos = map(renderThongSo, (col) => {
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
  const columnNoiDungs = map(renderNoiDung, (col) => {
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
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleCancel = () => {
    openModalFS(false);
  };
  const AddLoi = (data) => {
    const newData = [...ListHangMucKiemTra];
    newData.forEach((hm) => {
      hm.list_TDSXKiemSoatChatLuongChiTiets.forEach((ct) => {
        if (
          ct.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id ===
          data.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id
        ) {
          ct.isDat = false;
          ct.list_TDSXKiemSoatChatLuongChiTietLois = [
            ...ct.list_TDSXKiemSoatChatLuongChiTietLois,
            data,
          ];
        }
      });
      hm.list_HinhAnhs.forEach((ha) => {
        if (
          ha.tits_qtsx_HangMucKiemTra_HinhAnh_Id ===
          data.tits_qtsx_HangMucKiemTra_HinhAnh_Id
        ) {
          if (ha.listViTri) {
            ha.listViTri = [...ha.listViTri, data.viTri];
          } else {
            ha.listViTri = [data.viTri];
          }
        }
      });
    });
    setListHangMucKiemTra(newData);
  };
  const suaChuaLai = (data) => {
    const newData = [...ListHangMucKiemTra];
    newData.forEach((hm) => {
      hm.list_TDSXKiemSoatChatLuongTieuDePhus.forEach((tdp) => {
        if (
          tdp.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id ===
          data.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id
        ) {
          tdp.list_TDSXKiemSoatChatLuongChiTiets.forEach((ct) => {
            if (
              ct.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id ===
              data.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id
            ) {
              ct.isDat = true;
              ct.list_TDSXKiemSoatChatLuongChiTietLois.forEach((ctl) => {
                if (
                  ctl.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id ===
                  data.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id
                ) {
                  ctl.isHoanThanhSCL = true;
                }
              });
            }
          });
        }
      });
      hm.list_HinhAnhs.forEach((ha) => {
        if (
          ha.tits_qtsx_HangMucKiemTra_HinhAnh_Id ===
          data.tits_qtsx_HangMucKiemTra_HinhAnh_Id
        ) {
          ha.listViTri.forEach((lvt, index) => {
            if (lvt === JSON.stringify(data.viTri)) {
              data.viTri.isHoanThanhSCL = true;
              ha.listViTri[index] = JSON.stringify(data.viTri);
            }
          });
        }
      });
    });
    setListHangMucKiemTra(newData);
    setListLoi([
      ...ListLoi.map((ll) => {
        if (
          ll.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id ===
          data.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id
        ) {
          return {
            ...ll,
            moTaSCL: data.moTaSCL,
            tenNguoiSuaChuaLai: data.tenNguoiSuaChuaLai,
            nguoiSuaChuaLai_Id: data.nguoiSuaChuaLai_Id,
          };
        } else {
          return ll;
        }
      }),
    ]);
  };
  const onSave = () => {
    let check = false;
    ListLoi.forEach((ll) => {
      if (!ll.isHoanThanhSCL) {
        check = true;
      }
    });
    if (!check) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_TienDoSanXuat/put-sua-chua-lai?tits_qtsx_TienDoSanXuat_Id=${info.tits_qtsx_TienDoSanXuat_Id}`,
            "PUT",
            ListLoi,
            "DETAIL",
            "",
            resolve,
            reject
          )
        );
      }).then((res) => {
        if (res && res.status === 200) {
          Helpers.alertSuccessMessage("Đã lưu thành công!!");
          resetFields();
          openModalFS(false);
          refesh();
        }
      });
    } else {
      Helpers.alertWarning("Chưa sửa chữa hết các lỗi tại trạm");
    }
  };
  const XacNhanSCL = () => {
    const newData = [];
    let check = false;
    ListHangMucKiemTra.forEach((lhmkt) =>
      lhmkt.list_TDSXKiemSoatChatLuongTieuDePhus.forEach((tdp) => {
        tdp.list_TDSXKiemSoatChatLuongChiTiets.forEach((kscl) => {
          if (!kscl.isDat) {
            check = true;
          } else {
            newData.push(kscl);
          }
        });
      })
    );
    if (!check) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_TienDoSanXuat/put-xac-nhan-hoan-thanh-sua-chua-lai?tits_qtsx_TienDoSanXuat_Id=${info.tits_qtsx_TienDoSanXuat_Id}`,
            "PUT",
            newData,
            "DETAIL",
            "",
            resolve,
            reject
          )
        );
      }).then((res) => {
        if (res && res.status === 200) {
          Helpers.alertSuccessMessage("Đã lưu thành công!!");
          resetFields();
          openModalFS(false);
          refesh();
        }
      });
    } else {
      Helpers.alertWarning("Kết quả chưa đạt chưa thể xác nhận");
    }
  };
  const modalXacNhan = (ham, title) => {
    Modal({
      type: "confirm",
      okText: "Xác nhận",
      cancelText: "Hủy",
      title: `Xác nhận ${title}`,
      onOk: ham,
    });
  };
  return (
    <AntModal
      title={ActiveXacNhanSCL ? "Xác nhận sửa chữa lại" : "Sửa chữa lại"}
      open={openModal}
      width={`95%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Row justify={"center"} style={{ marginBottom: 10 }}>
        <Col span={1}></Col>
        <Col span={13} style={{ marginBottom: 10 }}>
          Trạm: <span style={{ fontWeight: "bold" }}>&nbsp;{info.tenTram}</span>
        </Col>
        <Col span={10} style={{ marginBottom: 10 }}>
          Thời gian vào sữa chữa lại:{" "}
          <span style={{ fontWeight: "bold" }}>&nbsp;{ThoiGianVaoTram}</span>
        </Col>
        <Col span={1}></Col>
        <Col span={13}>
          Sản phẩm:{" "}
          <span style={{ fontWeight: "bold" }}>&nbsp;{info.tenSanPham}</span>
        </Col>
        <Col span={10}>
          Số khung nội bộ:{" "}
          <span style={{ fontWeight: "bold" }}>&nbsp;{info.maNoiBo}</span>
        </Col>
      </Row>
      <Divider />
      <Table
        bordered
        scroll={{ x: 800, y: "70vh" }}
        columns={columnLoi}
        components={components}
        className="gx-table-responsive"
        dataSource={reDataForTable(ListLoi)}
        size="small"
        pagination={false}
      />
      <Divider />
      {ListHangMucKiemTra.length > 0 &&
        ListHangMucKiemTra.map((hmkt, index) => {
          return (
            <>
              <Row key={index}>
                <Col xl={12} lg={24}>
                  <Row>
                    <Col
                      span={24}
                      style={{
                        marginBottom: 10,
                        position: "relative",
                        height: 301,
                        overflow: "auto",
                      }}
                    >
                      <span style={{ marginBottom: 10, display: "block" }}>
                        Hạng mục kiểm tra:{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {hmkt.tenHangMucKiemTra}
                        </span>
                      </span>
                      {hmkt.list_TDSXKiemSoatChatLuongTieuDePhus.map((tdp) => {
                        if (tdp.list_TDSXKiemSoatChatLuongChiTiets.length > 0) {
                          return (
                            <>
                              {tdp.tieuDePhu && (
                                <span
                                  style={{ marginBottom: 10, display: "block" }}
                                >
                                  Hạng mục:{" "}
                                  <span style={{ fontWeight: "bold" }}>
                                    {tdp.tieuDePhu}
                                  </span>
                                </span>
                              )}
                              <Table
                                bordered
                                scroll={{ x: 800, y: "70vh" }}
                                columns={
                                  hmkt.isNoiDung
                                    ? columnNoiDungs
                                    : columnThongSos
                                }
                                components={components}
                                className="gx-table-responsive"
                                dataSource={reDataForTable(
                                  tdp.list_TDSXKiemSoatChatLuongChiTiets
                                )}
                                size="small"
                                pagination={false}
                              />
                            </>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </Col>
                  </Row>
                </Col>
                <Col
                  xl={12}
                  lg={24}
                  align="center"
                  style={{
                    position: "relative",
                    height: 301,
                    overflow: "auto",
                  }}
                >
                  {hmkt.list_HinhAnhs.length > 0 &&
                    hmkt.list_HinhAnhs.map((ha) => {
                      return (
                        <ImageDrawing
                          imageUrl={BASE_URL_API + ha.hinhAnh}
                          hinhAnhId={ha.tits_qtsx_HangMucKiemTra_HinhAnh_Id}
                          sanPhamhinhAnhId={ha.tits_qtsx_SanPhamHinhAnh_Id}
                          dataNoiDung={hmkt}
                          setListHangMucKiemTra={setListHangMucKiemTra}
                          AddLoi={AddLoi}
                          listViTri={ha.listViTri}
                          SuaChuaLai={suaChuaLai}
                        />
                      );
                    })}
                </Col>
              </Row>
              <Divider />
            </>
          );
        })}
      <Row style={{ marginTop: 10 }}>
        <Col span={24} align="center">
          <Button
            className="th-margin-bottom-0"
            style={{ margin: 0 }}
            icon={<SaveOutlined />}
            onClick={() =>
              modalXacNhan(
                ActiveXacNhanSCL ? XacNhanSCL : onSave,
                ActiveXacNhanSCL
                  ? "Xác nhận đã sửa chữa lại"
                  : "Lưu sửa chữa lại"
              )
            }
            type="primary"
          >
            {ActiveXacNhanSCL ? "Xác nhận" : "Lưu"}
          </Button>
        </Col>
      </Row>
    </AntModal>
  );
}

export default ModalSuaChuaLai;
